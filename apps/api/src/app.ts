import { scryptSync, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { prisma } from "@stock-hub/database";
import { canCreateStockEntry } from "@stock-hub/domain";

function hashPassword(password: string, salt = "stock-hub-dev") {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(hashPassword(password, salt).split(":")[2] ?? "", "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function publicUser(user: { id: string; identifier: string; email: string | null; firstName: string; lastName: string; roles: unknown; active: boolean }) {
  return {
    id: user.id,
    identifier: user.identifier,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    active: user.active
  };
}
function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sameQuantity(left: number, right: number) {
  return Math.abs(left - right) < 0.000001;
}

function parseDate(value: unknown): Date {
  if (typeof value === "string") {
    const french = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (french) return new Date(french[3] + "-" + french[2] + "-" + french[1] + "T00:00:00.000Z");
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function asBody(requestBody: unknown): Record<string, unknown> {
  return requestBody && typeof requestBody === "object" ? requestBody as Record<string, unknown> : {};
}

function auditUserIdFromBody(body: Record<string, unknown>) {
  return asString(body.auditUserId) ?? null;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("R2_NOT_CONFIGURED");
  return value;
}

function storageDriver() {
  const driver = (process.env.STORAGE_DRIVER ?? (process.env.NODE_ENV === "production" ? "r2" : "local")).trim().toLowerCase();
  if (driver !== "local" && driver !== "r2") throw new Error("STORAGE_DRIVER_INVALID");
  return driver as "local" | "r2";
}

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(apiRoot, "../..");

function localUploadRoot() {
  const configured = process.env.LOCAL_UPLOAD_DIR;
  if (configured && path.isAbsolute(configured)) return path.resolve(configured);
  return path.resolve(workspaceRoot, configured ?? "apps/api/uploads");
}

function r2Client() {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: "https://" + accountId + ".r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY")
    }
  });
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "preuve-signee";
}

async function saveProofFile(movementId: string, fileName: string, mimeType: string, buffer: Buffer) {
  const key = "material-requests/" + movementId + "/" + Date.now() + "-" + safeFileName(fileName);
  if (storageDriver() === "r2") {
    const bucket = requiredEnv("R2_BUCKET");
    await r2Client().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType || "application/octet-stream"
    }));
    return key;
  }
  const filePath = path.resolve(localUploadRoot(), key);
  if (!filePath.startsWith(localUploadRoot() + path.sep)) {
    throw new Error("LOCAL_UPLOAD_PATH_INVALID");
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return key;
}

async function signedProofUrl(key: string) {
  return getSignedUrl(
    r2Client(),
    new GetObjectCommand({ Bucket: requiredEnv("R2_BUCKET"), Key: key }),
    { expiresIn: 60 * 5 }
  );
}

function localProofPath(key: string) {
  const filePath = path.resolve(localUploadRoot(), key);
  if (!filePath.startsWith(localUploadRoot() + path.sep)) {
    throw new Error("LOCAL_UPLOAD_PATH_INVALID");
  }
  return filePath;
}

function returnBreakdownFromObservation(observation: string | null | undefined) {
  const text = observation ?? "";
  const read = (label: string) => {
    const match = text.match(new RegExp(label + "\\s+(\\d+(?:[.,]\\d+)?)", "i"));
    return match ? Number(match[1].replace(",", ".")) : 0;
  };
  const structured = /Retour:\s*total/i.test(text);
  const total = read("total");
  const good = read("bon etat");
  const damaged = read("endommage");
  const scrap = read("rebut");
  const pending = read("a controler");
  return { total, good, damaged, scrap, pending, structured };
}

function articleFamily(value: unknown) {
  const family = String(value ?? "").trim().toUpperCase();
  return ["FO", "GSM", "BLR"].includes(family) ? family : "FO";
}

async function nextArticleCode(family: string) {
  const prefix = family + "-";
  const articles = await prisma.article.findMany({
    where: { code: { startsWith: prefix } },
    select: { code: true }
  });
  const numbers = articles
    .map((article) => Number(article.code.slice(prefix.length).replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return prefix + String(next).padStart(4, "0");
}

async function nextCode(
  findMany: () => Promise<Array<{ code: string }>>,
  prefix: string,
  width = 3,
) {
  const rows = await findMany();
  const numbers = rows
    .map((row) => Number(row.code.slice(prefix.length).replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return prefix + String(next).padStart(width, "0");
}

async function nextMatricule(prefix = "EMP-", width = 3) {
  const employees = await prisma.employee.findMany({
    where: { matricule: { startsWith: prefix } },
    select: { matricule: true }
  });
  const numbers = employees
    .map((employee) => Number(employee.matricule.slice(prefix.length).replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return prefix + String(next).padStart(width, "0");
}

function locationCodePrefix(type: unknown) {
  const normalized = String(type ?? "MAGASIN").trim().toUpperCase();
  if (normalized === "DEPOT") return "DEP-";
  if (normalized === "BUREAU") return "BUR-";
  if (normalized === "VEHICULE") return "VEH-";
  if (normalized === "SITE" || normalized === "CHANTIER") return "SITE-";
  if (normalized === "MAGASIN") return "MAG-";
  return "LOC-";
}

async function uniqueCodeOrNext(
  requested: string | undefined,
  findUnique: (code: string) => Promise<unknown>,
  findMany: () => Promise<Array<{ code: string }>>,
  prefix: string,
  width = 3,
) {
  const clean = requested?.trim();
  if (clean && !(await findUnique(clean))) return clean;
  return nextCode(findMany, prefix, width);
}

async function uniqueMatriculeOrNext(requested: string | undefined) {
  const clean = requested?.trim();
  if (clean && !(await prisma.employee.findUnique({ where: { matricule: clean } }))) {
    return clean;
  }
  return nextMatricule();
}

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });
  app.register(multipart, {
    limits: {
      fileSize: 12 * 1024 * 1024,
      files: 1
    }
  });

  app.get("/health", async () => ({ status: "ok" }));
  app.get("/ready", async () => ({ status: "ready" }));

  app.get("/meta", async () => ({
    name: "Stock Hub API",
    version: "0.1.0",
    stack: ["Fastify", "TypeScript", "PostgreSQL", "Prisma"],
    checks: {
      adminCanCreateEntry: canCreateStockEntry(["ADMIN_STOCK"])
    }
  }));

  app.post("/auth/login", async (request, reply) => {
    const body = asBody(request.body);
    const identifier = String(body.identifier ?? body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!identifier || !password) {
      return reply.code(400).send({ message: "Identifiant et mot de passe sont requis." });
    }
    const user = await prisma.user.findFirst({
      where: { OR: [{ identifier }, { email: identifier }] }
    });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return reply.code(401).send({ message: "Identifiant ou mot de passe incorrect." });
    }
    if (!user.active) {
      return reply.code(403).send({ message: "Compte utilisateur inactif." });
    }
    return { user: publicUser(user) };
  });
  app.get("/dashboard-summary", async () => {
    const [articles, ruptures, movementsToday, equipmentAssigned] = await Promise.all([
      prisma.article.count({ where: { active: true } }),
      prisma.stockLevel.count({ where: { quantity: { lte: 0 } } }),
      prisma.stockMovement.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.equipment.count({ where: { status: "ASSIGNED" } })
    ]);

    return { articles, ruptures, movementsToday, equipmentAssigned };
  });

  app.get("/articles", async () => {
    return prisma.article.findMany({ orderBy: { code: "asc" } });
  });

  app.post("/articles", async (request, reply) => {
    const body = asBody(request.body);
    const category = articleFamily(body.category);
    const prefix = category + "-";
    const requestedCode = asString(body.code);
    const existing = requestedCode ? await prisma.article.findUnique({ where: { code: requestedCode } }) : null;
    const code = requestedCode && requestedCode.startsWith(prefix) && !existing ? requestedCode : await nextArticleCode(category);
    const initialStock = toNumber(body.initialStock) ?? 0;
    const defaultLocationId = asString(body.defaultLocationId);
    const initialLocationId = asString(body.initialLocationId) ?? defaultLocationId;
    if (initialStock > 0 && !initialLocationId) {
      return reply.code(400).send({ message: "Emplacement de depart requis pour initialiser le stock." });
    }
    const article = await prisma.$transaction(async (tx) => {
      const created = await tx.article.create({
        data: {
          code,
          designation: String(body.designation ?? ""),
          category,
          unit: String(body.unit ?? "U"),
          trackingMode: body.trackingMode === "INDIVIDUAL" ? "INDIVIDUAL" : "QUANTITY",
          minimumStock: toNumber(body.minimumStock) ?? 0,
          securityStock: toNumber(body.securityStock) ?? 0,
          referencePrice: toNumber(body.referencePrice),
          defaultSupplierId: asString(body.defaultSupplierId),
          defaultLocationId,
          initialStock,
          stockLevels: initialStock > 0 && initialLocationId ? {
            create: {
              locationId: initialLocationId,
              quantity: initialStock
            }
          } : undefined
        }
      });
      if (initialStock > 0 && initialLocationId) {
        await tx.stockMovement.create({
          data: {
            reference: "INIT-" + created.code,
            type: "INITIAL",
            status: "COMPLETED",
            date: created.createdAt,
            fromLocationId: initialLocationId,
            toLocationId: initialLocationId,
            lines: {
              create: {
                articleId: created.id,
                expectedQuantity: initialStock,
                completedQuantity: initialStock,
                observation: "Stock initial au demarrage"
              }
            }
          }
        });
      }
      return created;
    });
    return reply.code(201).send(article);
  });

  app.patch("/articles/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const stockQuantity = body.stockQuantity === undefined ? undefined : toNumber(body.stockQuantity) ?? 0;
    const requestedStockLocationId = asString(body.stockLocationId) ?? asString(body.defaultLocationId);

    const article = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id },
        data: {
          designation: asString(body.designation) ?? undefined,
          category: asString(body.category) ?? undefined,
          unit: asString(body.unit) ?? undefined,
          trackingMode: body.trackingMode === undefined ? undefined : body.trackingMode === "INDIVIDUAL" ? "INDIVIDUAL" : "QUANTITY",
          minimumStock: body.minimumStock === undefined ? undefined : toNumber(body.minimumStock) ?? 0,
          securityStock: body.securityStock === undefined ? undefined : toNumber(body.securityStock) ?? 0,
          referencePrice: body.referencePrice === undefined ? undefined : toNumber(body.referencePrice),
          defaultSupplierId: body.defaultSupplierId === null ? null : asString(body.defaultSupplierId) ?? undefined,
          defaultLocationId: body.defaultLocationId === null ? null : asString(body.defaultLocationId) ?? undefined,
          active: body.active === undefined ? undefined : Boolean(body.active)
        }
      });

      if (stockQuantity !== undefined) {
        const targetLocationId = requestedStockLocationId ?? updated.defaultLocationId;
        if (!targetLocationId) {
          throw new Error("Un emplacement est requis pour renseigner le stock actuel.");
        }
        await tx.stockLevel.upsert({
          where: { articleId_locationId: { articleId: id, locationId: targetLocationId } },
          update: { quantity: stockQuantity },
          create: { articleId: id, locationId: targetLocationId, quantity: stockQuantity }
        });
      }

      return updated;
    });

    return reply.send(article);
  });

  app.get("/clients", async () => {
    return prisma.client.findMany({ orderBy: { code: "asc" } });
  });

  app.post("/clients", async (request, reply) => {
    const body = asBody(request.body);
    const code = await uniqueCodeOrNext(
      asString(body.code),
      (value) => prisma.client.findUnique({ where: { code: value } }),
      () => prisma.client.findMany({ where: { code: { startsWith: "CLI-" } }, select: { code: true } }),
      "CLI-"
    );
    const client = await prisma.client.create({
      data: {
        code,
        name: String(body.name ?? ""),
        contact: body.contact ? String(body.contact) : undefined,
        phone: body.phone ? String(body.phone) : undefined,
        email: body.email ? String(body.email) : undefined
      }
    });
    return reply.code(201).send(client);
  });

  app.patch("/clients/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: asString(body.name) ?? undefined,
        contact: body.contact === null ? null : asString(body.contact) ?? undefined,
        phone: body.phone === null ? null : asString(body.phone) ?? undefined,
        email: body.email === null ? null : asString(body.email) ?? undefined,
        active: body.active === undefined ? undefined : Boolean(body.active)
      }
    });
    return reply.send(client);
  });

  app.get("/team-services", async () => {
    return prisma.teamService.findMany({ orderBy: { code: "asc" } });
  });

  app.post("/team-services", async (request, reply) => {
    const body = asBody(request.body);
    const code = await uniqueCodeOrNext(
      asString(body.code),
      (value) => prisma.teamService.findUnique({ where: { code: value } }),
      () => prisma.teamService.findMany({ where: { code: { startsWith: "SRV-" } }, select: { code: true } }),
      "SRV-"
    );
    const service = await prisma.teamService.create({
      data: {
        code,
        name: String(body.name ?? ""),
        type: String(body.type ?? "SERVICE"),
        manager: asString(body.manager)
      }
    });
    return reply.code(201).send(service);
  });

  app.patch("/team-services/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const service = await prisma.teamService.update({
      where: { id },
      data: {
        name: asString(body.name) ?? undefined,
        type: asString(body.type) ?? undefined,
        manager: body.manager === null ? null : asString(body.manager) ?? undefined,
        active: body.active === undefined ? undefined : Boolean(body.active)
      }
    });
    return reply.send(service);
  });

  app.get("/employees", async () => {
    return prisma.employee.findMany({ orderBy: [{ active: "desc" }, { lastName: "asc" }, { firstName: "asc" }] });
  });

  app.post("/employees", async (request, reply) => {
    const body = asBody(request.body);
    const matricule = await uniqueMatriculeOrNext(asString(body.matricule));
    const employee = await prisma.employee.create({
      data: {
        matricule,
        lastName: String(body.lastName ?? ""),
        firstName: String(body.firstName ?? ""),
        department: asString(body.department),
        role: asString(body.role),
        phone: asString(body.phone)
      }
    });
    return reply.code(201).send(employee);
  });

  app.patch("/employees/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        matricule: asString(body.matricule) ?? undefined,
        lastName: asString(body.lastName) ?? undefined,
        firstName: asString(body.firstName) ?? undefined,
        department: body.department === null ? null : asString(body.department) ?? undefined,
        role: body.role === null ? null : asString(body.role) ?? undefined,
        phone: body.phone === null ? null : asString(body.phone) ?? undefined,
        active: body.active === undefined ? undefined : Boolean(body.active)
      }
    });
    return reply.send(employee);
  });

  app.get("/suppliers", async () => {
    return prisma.supplier.findMany({ orderBy: { code: "asc" } });
  });

  app.post("/suppliers", async (request, reply) => {
    const body = asBody(request.body);
    const code = await uniqueCodeOrNext(
      asString(body.code),
      (value) => prisma.supplier.findUnique({ where: { code: value } }),
      () => prisma.supplier.findMany({ where: { code: { startsWith: "FRN-" } }, select: { code: true } }),
      "FRN-"
    );
    const supplier = await prisma.supplier.create({
      data: {
        code,
        name: String(body.name ?? ""),
        fiscalId: asString(body.fiscalId),
        category: asString(body.category),
        contact: body.contact ? String(body.contact) : undefined,
        phone: body.phone ? String(body.phone) : undefined,
        email: body.email ? String(body.email) : undefined,
        address: asString(body.address)
      }
    });
    return reply.code(201).send(supplier);
  });

  app.patch("/suppliers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: asString(body.name) ?? undefined,
        fiscalId: body.fiscalId === null ? null : asString(body.fiscalId) ?? undefined,
        category: body.category === null ? null : asString(body.category) ?? undefined,
        contact: body.contact === null ? null : asString(body.contact) ?? undefined,
        phone: body.phone === null ? null : asString(body.phone) ?? undefined,
        email: body.email === null ? null : asString(body.email) ?? undefined,
        address: body.address === null ? null : asString(body.address) ?? undefined,
        active: body.active === undefined ? undefined : Boolean(body.active)
      }
    });
    return reply.send(supplier);
  });

  app.get("/projects", async () => {
    return prisma.project.findMany({ include: { sites: true }, orderBy: { code: "asc" } });
  });

  app.post("/projects", async (request, reply) => {
    const body = asBody(request.body);
    const projectManagerId = asString(body.projectManagerId);
    if (!projectManagerId) {
      return reply.code(400).send({ message: "Un chef de projet actif est obligatoire." });
    }
    const projectManager = await prisma.user.findFirst({
      where: { id: projectManagerId, active: true, roles: { has: "CHEF_PROJET" } }
    });
    if (!projectManager) {
      return reply.code(400).send({ message: "Le chef de projet doit etre un utilisateur actif avec le role Chef projet." });
    }
    const clientId = asString(body.clientId);
    const selectedClient = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
    const projectPrefix = "PROJ-" + new Date().getFullYear() + "-";
    const code = await uniqueCodeOrNext(
      asString(body.code),
      (value) => prisma.project.findUnique({ where: { code: value } }),
      () => prisma.project.findMany({ where: { code: { startsWith: projectPrefix } }, select: { code: true } }),
      projectPrefix
    );
    const project = await prisma.project.create({
      data: {
        code,
        name: String(body.name ?? ""),
        client: selectedClient?.name ?? asString(body.client),
        clientId,
        projectManagerId,
        region: asString(body.region),
        city: asString(body.city),
        site: asString(body.site),
        startDate: body.startDate ? parseDate(body.startDate) : undefined,
        endDate: body.endDate ? parseDate(body.endDate) : undefined
      }
    });
    return reply.code(201).send(project);
  });


  app.patch("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name);
    if (body.clientId !== undefined) {
      const clientId = asString(body.clientId);
      const selectedClient = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
      data.clientId = clientId;
      data.client = selectedClient?.name ?? null;
    }
    if (body.projectManagerId !== undefined) {
      const projectManagerId = asString(body.projectManagerId);
      if (!projectManagerId) return reply.code(400).send({ message: "Un chef de projet actif est obligatoire." });
      const projectManager = await prisma.user.findFirst({ where: { id: projectManagerId, active: true, roles: { has: "CHEF_PROJET" } } });
      if (!projectManager) return reply.code(400).send({ message: "Le chef de projet doit etre un utilisateur actif avec le role Chef projet." });
      data.projectManagerId = projectManagerId;
    }
    if (body.region !== undefined) data.region = asString(body.region);
    if (body.city !== undefined) data.city = asString(body.city);
    if (body.startDate !== undefined) data.startDate = body.startDate === null ? null : parseDate(body.startDate);
    if (body.endDate !== undefined) data.endDate = body.endDate === null ? null : parseDate(body.endDate);
    if (body.active !== undefined) data.active = Boolean(body.active);
    const project = await prisma.project.update({ where: { id }, data: data as any, include: { sites: true } });
    return reply.send(project);
  });

  app.get("/users", async () => {
    const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { firstName: "asc" }, { identifier: "asc" }] });
    return users.map(publicUser);
  });

  app.post("/users", async (request, reply) => {
    const body = asBody(request.body);
    const roles = Array.isArray(body.roles) ? body.roles.map(String) : ["GESTIONNAIRE_STOCK"];
    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    if (!identifier) return reply.code(400).send({ message: "Identifiant utilisateur requis." });
    const email = asString(body.email)?.trim().toLowerCase() ?? null;
    const passwordHash = hashPassword(String(body.password ?? "12345678"));
    const user = await prisma.user.create({
      data: {
        identifier,
        email,
        firstName: String(body.firstName ?? ""),
        lastName: String(body.lastName ?? ""),
        roles: roles as any,
        passwordHash,
        active: body.active === false ? false : true
      }
    });
    return reply.code(201).send(publicUser(user));
  });

  app.patch("/users/:id/profile", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = asString(body.email)?.trim().toLowerCase() ?? null;
    if (!firstName || !lastName) {
      return reply.code(400).send({ message: "Prenom et nom sont requis." });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, email }
    });
    return reply.send(publicUser(user));
  });

  app.post("/users/:id/change-password", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    if (!currentPassword || !newPassword) {
      return reply.code(400).send({ message: "Ancien et nouveau mot de passe sont requis." });
    }
    if (newPassword.length < 8) {
      return reply.code(400).send({ message: "Le nouveau mot de passe doit contenir au moins 8 caracteres." });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.code(404).send({ message: "Utilisateur introuvable." });
    if (!user.active) return reply.code(403).send({ message: "Compte utilisateur inactif." });
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return reply.code(401).send({ message: "Ancien mot de passe incorrect." });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { passwordHash: hashPassword(newPassword) }
    });
    return reply.send(publicUser(updated));
  });

  app.patch("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const data: Record<string, unknown> = {};
    if (body.identifier !== undefined) data.identifier = String(body.identifier).trim().toLowerCase();
    if (body.email !== undefined) data.email = asString(body.email)?.trim().toLowerCase() ?? null;
    if (body.firstName !== undefined) data.firstName = String(body.firstName);
    if (body.lastName !== undefined) data.lastName = String(body.lastName);
    if (Array.isArray(body.roles)) data.roles = body.roles.map(String);
    if (body.active !== undefined) data.active = Boolean(body.active);
    if (body.password) data.passwordHash = hashPassword(String(body.password));
    const user = await prisma.user.update({ where: { id }, data: data as any });
    return reply.send(publicUser(user));
  });

  app.get("/locations", async () => {
    return prisma.location.findMany({ orderBy: { code: "asc" } });
  });

  app.post("/locations", async (request, reply) => {
    const body = asBody(request.body);
    const type = String(body.type ?? "MAGASIN");
    const prefix = locationCodePrefix(type);
    const code = await uniqueCodeOrNext(
      asString(body.code),
      (value) => prisma.location.findUnique({ where: { code: value } }),
      () => prisma.location.findMany({ where: { code: { startsWith: prefix } }, select: { code: true } }),
      prefix
    );
    const location = await prisma.location.create({
      data: {
        code,
        name: String(body.name ?? ""),
        type,
        responsible: asString(body.responsible),
        region: asString(body.region),
        city: asString(body.city),
        address: asString(body.address),
        projectId: asString(body.projectId)
      }
    });
    return reply.code(201).send(location);
  });

  app.get("/stock-levels", async () => {
    return prisma.stockLevel.findMany({
      include: { article: true, location: true },
      orderBy: [{ location: { code: "asc" } }, { article: { code: "asc" } }]
    });
  });

  app.get("/equipments", async () => {
    const equipments = await prisma.equipment.findMany({
      include: { article: true, supplier: true, history: { orderBy: { createdAt: "desc" } } },
      orderBy: { code: "asc" }
    });
    const locationIds = equipments.map((equipment) => equipment.locationId).filter(Boolean) as string[];
    const locations = locationIds.length ? await prisma.location.findMany({ where: { id: { in: locationIds } } }) : [];
    const locationsById = new Map(locations.map((location) => [location.id, location]));
    return equipments.map((equipment) => ({
      ...equipment,
      location: equipment.locationId ? locationsById.get(equipment.locationId) ?? null : null
    }));
  });

  app.post("/equipments", async (request, reply) => {
    const body = asBody(request.body);
    const articleId = asString(body.articleId);
    if (!articleId) {
      return reply.code(400).send({ message: "Un article modele est requis pour creer un equipement." });
    }
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return reply.code(404).send({ message: "Article modele introuvable." });
    }
    if (article.trackingMode !== "INDIVIDUAL") {
      return reply.code(400).send({ message: "Un equipement ne peut etre cree que pour un article en suivi individuel." });
    }
    const equipmentCount = await prisma.equipment.count();
    const code = "EQP-" + new Date().getFullYear() + "-" + String(equipmentCount + 1).padStart(3, "0");
    const equipment = await prisma.equipment.create({
      data: {
        code,
        serialNumber: asString(body.serialNumber),
        articleId,
        supplierId: asString(body.supplierId),
        state: String(body.state ?? "GOOD"),
        status: "AVAILABLE",
        assignedTo: null,
        locationId: asString(body.locationId),
        entryDate: body.entryDate ? parseDate(body.entryDate) : undefined,
        origin: asString(body.origin),
        notes: asString(body.notes)
      },
      include: { article: true, supplier: true }
    });
    await prisma.equipmentHistory.create({
      data: {
        equipmentId: equipment.id,
        action: "CREATED",
        status: equipment.status,
        state: equipment.state,
        locationId: equipment.locationId,
        observation: equipment.notes
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: auditUserIdFromBody(body),
        action: "CREATE_EQUIPMENT",
        entity: "Equipment",
        entityId: equipment.id,
        after: equipment as any
      }
    });
    const location = equipment.locationId ? await prisma.location.findUnique({ where: { id: equipment.locationId } }) : null;
    return reply.code(201).send({ ...equipment, location });
  });

  app.patch("/equipments/:id", async (request, reply) => {
    const body = asBody(request.body);
    const params = request.params as { id: string };
    const before = await prisma.equipment.findUnique({ where: { id: params.id }, include: { article: true, supplier: true } });
    if (!before) {
      return reply.code(404).send({ message: "Equipement introuvable." });
    }
    const requestedArticleId = asString(body.articleId);
    if (requestedArticleId && requestedArticleId !== before.articleId) {
      const article = await prisma.article.findUnique({ where: { id: requestedArticleId } });
      if (!article || article.trackingMode !== "INDIVIDUAL") {
        return reply.code(400).send({ message: "L'article modele doit etre en suivi individuel." });
      }
    }
    const equipment = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        articleId: requestedArticleId ?? before.articleId,
        serialNumber: asString(body.serialNumber) ?? before.serialNumber,
        supplierId: body.supplierId === null ? null : asString(body.supplierId) ?? before.supplierId,
        state: asString(body.state) ?? before.state,
        status: asString(body.status) ?? before.status,
        assignedTo: body.assignedTo === null ? null : asString(body.assignedTo) ?? before.assignedTo,
        locationId: body.locationId === null ? null : asString(body.locationId) ?? before.locationId,
        entryDate: body.entryDate ? parseDate(body.entryDate) : before.entryDate,
        origin: body.origin === null ? null : asString(body.origin) ?? before.origin,
        notes: body.notes === null ? null : asString(body.notes) ?? before.notes
      },
      include: { article: true, supplier: true }
    });
    await prisma.equipmentHistory.create({
      data: {
        equipmentId: equipment.id,
        action: before.status !== equipment.status ? "STATUS_CHANGED" : before.assignedTo !== equipment.assignedTo ? "ASSIGNED" : "UPDATED",
        status: equipment.status,
        state: equipment.state,
        assignedTo: equipment.assignedTo,
        locationId: equipment.locationId,
        observation: equipment.notes
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: auditUserIdFromBody(body),
        action: "UPDATE_EQUIPMENT",
        entity: "Equipment",
        entityId: equipment.id,
        before: before as any,
        after: equipment as any
      }
    });
    const location = equipment.locationId ? await prisma.location.findUnique({ where: { id: equipment.locationId } }) : null;
    const history = await prisma.equipmentHistory.findMany({ where: { equipmentId: equipment.id }, orderBy: { createdAt: "desc" } });
    return { ...equipment, location, history };
  });

  app.post("/equipments/:id/unassign", async (request, reply) => {
    const params = request.params as { id: string };
    const body = asBody(request.body);
    const before = await prisma.equipment.findUnique({ where: { id: params.id }, include: { article: true, supplier: true } });
    if (!before) {
      return reply.code(404).send({ message: "Equipement introuvable." });
    }
    if (!before.assignedTo && before.status === "AVAILABLE") {
      return reply.code(400).send({ message: "Cet equipement n'est pas affecte." });
    }
    const equipment = await prisma.equipment.update({
      where: { id: params.id },
      data: { assignedTo: null, status: "AVAILABLE" },
      include: { article: true, supplier: true }
    });
    await prisma.equipmentHistory.create({
      data: {
        equipmentId: equipment.id,
        action: "UNASSIGNED",
        status: equipment.status,
        state: equipment.state,
        assignedTo: null,
        locationId: equipment.locationId,
        observation: "Desaffecte de " + (before.assignedTo ?? "l'affectation courante")
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: auditUserIdFromBody(body),
        action: "UNASSIGN_EQUIPMENT",
        entity: "Equipment",
        entityId: equipment.id,
        before: before as any,
        after: equipment as any
      }
    });
    const location = equipment.locationId ? await prisma.location.findUnique({ where: { id: equipment.locationId } }) : null;
    const history = await prisma.equipmentHistory.findMany({ where: { equipmentId: equipment.id }, orderBy: { createdAt: "desc" } });
    return { ...equipment, location, history };
  });


  app.get("/vehicles", async () => {
    return prisma.vehicle.findMany({ include: { history: { orderBy: { createdAt: "desc" } } }, orderBy: { code: "asc" } });
  });

  app.post("/vehicles", async (request, reply) => {
    const body = asBody(request.body);
    const type = String(body.type ?? "").trim();
    const plateNumber = String(body.plateNumber ?? "").trim();
    if (!type || !plateNumber) {
      return reply.code(400).send({ message: "Le type et l'immatriculation sont requis." });
    }
    const year = new Date().getFullYear();
    const vehicleCount = await prisma.vehicle.count();
    const code = "VH-" + year + "-" + String(vehicleCount + 1).padStart(3, "0");
    const name = String(body.name ?? "").trim() || plateNumber;
    const vehicle = await prisma.vehicle.create({
      data: {
        code,
        name,
        type,
        plateNumber,
        assignment: asString(body.assignment),
        driverName: asString(body.driverName),
        apprenticeName: asString(body.apprenticeName),
        status: "AVAILABLE",
        insuranceExpiresAt: body.insuranceExpiresAt ? parseDate(body.insuranceExpiresAt) : undefined,
        technicalVisitAt: body.technicalVisitAt ? parseDate(body.technicalVisitAt) : undefined,
        notes: asString(body.notes)
      }
    });
    await prisma.vehicleHistory.create({
      data: {
        vehicleId: vehicle.id,
        action: "CREATED",
        assignment: vehicle.assignment,
        driverName: vehicle.driverName,
        apprenticeName: vehicle.apprenticeName,
        status: vehicle.status,
        observation: vehicle.notes
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: auditUserIdFromBody(body),
        action: "CREATE_VEHICLE",
        entity: "Vehicle",
        entityId: vehicle.id,
        after: vehicle as any
      }
    });
    return reply.code(201).send(vehicle);
  });

  app.patch("/vehicles/:id", async (request, reply) => {
    const body = asBody(request.body);
    const params = request.params as { id: string };
    const before = await prisma.vehicle.findUnique({ where: { id: params.id } });
    if (!before) return reply.code(404).send({ message: "Vehicule introuvable." });
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        name: asString(body.name) ?? before.name,
        type: asString(body.type) ?? before.type,
        plateNumber: asString(body.plateNumber) ?? before.plateNumber,
        assignment: body.assignment === null ? null : asString(body.assignment) ?? before.assignment,
        driverName: body.driverName === null ? null : asString(body.driverName) ?? before.driverName,
        apprenticeName: body.apprenticeName === null ? null : asString(body.apprenticeName) ?? before.apprenticeName,
        status: asString(body.status) ?? before.status,
        insuranceExpiresAt: body.insuranceExpiresAt === null ? null : body.insuranceExpiresAt ? parseDate(body.insuranceExpiresAt) : before.insuranceExpiresAt,
        technicalVisitAt: body.technicalVisitAt === null ? null : body.technicalVisitAt ? parseDate(body.technicalVisitAt) : before.technicalVisitAt,
        notes: body.notes === null ? null : asString(body.notes) ?? before.notes,
        active: body.active === undefined ? before.active : body.active !== false
      }
    });
    const action = before.assignment !== vehicle.assignment
      ? (vehicle.assignment ? "ASSIGNED" : "UNASSIGNED")
      : before.driverName !== vehicle.driverName
        ? "DRIVER_CHANGED"
        : before.apprenticeName !== vehicle.apprenticeName
          ? "APPRENTICE_CHANGED"
          : before.status !== vehicle.status
            ? (vehicle.status === "MAINTENANCE" ? "MAINTENANCE" : "STATUS_CHANGED")
            : "UPDATED";
    await prisma.vehicleHistory.create({
      data: {
        vehicleId: vehicle.id,
        action,
        assignment: vehicle.assignment,
        previousAssignment: before.assignment,
        driverName: vehicle.driverName,
        previousDriverName: before.driverName,
        apprenticeName: vehicle.apprenticeName,
        previousApprenticeName: before.apprenticeName,
        status: vehicle.status,
        previousStatus: before.status,
        observation: vehicle.notes
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: auditUserIdFromBody(body),
        action: "UPDATE_VEHICLE",
        entity: "Vehicle",
        entityId: vehicle.id,
        before: before as any,
        after: vehicle as any
      }
    });
    const history = await prisma.vehicleHistory.findMany({ where: { vehicleId: vehicle.id }, orderBy: { createdAt: "desc" } });
    return { ...vehicle, history };
  });
  app.patch("/locations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const location = await prisma.location.update({
      where: { id },
      data: {
        name: asString(body.name) ?? undefined,
        type: asString(body.type) ?? undefined,
        responsible: body.responsible === null ? null : asString(body.responsible) ?? undefined,
        region: body.region === null ? null : asString(body.region) ?? undefined,
        city: body.city === null ? null : asString(body.city) ?? undefined,
        address: body.address === null ? null : asString(body.address) ?? undefined,
        projectId: body.projectId === null ? null : asString(body.projectId) ?? undefined,
        active: body.active === undefined ? undefined : Boolean(body.active)
      }
    });
    return reply.send(location);
  });

  app.post("/stock-movements/entries", async (request, reply) => {
    const body = asBody(request.body);
    const lines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne d'entree est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? `BE-${Date.now()}`),
          type: "ENTRY",
          status: "COMPLETED",
          date: parseDate(body.date),
          supplierId: asString(body.supplierId),
          clientId: asString(body.clientId),
          projectId: asString(body.projectId),
          teamServiceId: asString(body.teamServiceId),
          siteLocationId: asString(body.siteLocationId),
          toLocationId: asString(body.toLocationId),
          handledBy: asString(body.handledBy),
          receivedBy: asString(body.receivedBy),
          deliveredBy: asString(body.deliveredBy),
          notes: [asString(body.notes), asString(body.attachmentFileName) ? "Piece jointe: " + asString(body.attachmentFileName) : undefined].filter(Boolean).join(" - ") || undefined,
          lines: {
            create: lines.map((line) => ({
              articleId: String(line.articleId ?? ""),
              expectedQuantity: toNumber(line.expectedQuantity),
              completedQuantity: toNumber(line.completedQuantity) ?? 0,
              unitPrice: toNumber(line.unitPrice),
              observation: asString(line.observation)
            }))
          }
        },
        include: { lines: { include: { article: true } } }
      });

      if (created.toLocationId) {
        for (const line of created.lines) {
          await tx.stockLevel.upsert({
            where: { articleId_locationId: { articleId: line.articleId, locationId: created.toLocationId } },
            update: { quantity: { increment: line.completedQuantity ?? 0 } },
            create: {
              articleId: line.articleId,
              locationId: created.toLocationId,
              quantity: line.completedQuantity ?? 0
            }
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "CREATE_STOCK_ENTRY",
          entity: "StockMovement",
          entityId: created.id,
          after: created as any
        }
      });

      return created;
    });

    return reply.code(201).send(movement);
  });

  app.post("/stock-movements/entries/:id/resolve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const inputLines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    if (!inputLines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de resolution est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const before = await tx.stockMovement.findUnique({
        where: { id },
        include: {
          lines: { include: { article: true } },
          sourceRequest: { include: { lines: { include: { article: true } } } }
        }
      });
      if (!before) {
        return reply.code(404).send({ message: "Entree stock introuvable." });
      }
      if (before.type !== "ENTRY") {
        return reply.code(400).send({ message: "Seules les entrees stock peuvent etre resolues ici." });
      }
      if (before.status === "CANCELLED") {
        return reply.code(400).send({ message: "Une entree annulee ne peut pas etre resolue." });
      }

      const lineById = new Map(before.lines.map((line) => [line.id, line]));
      let changed = false;
      const resolutionNotes: string[] = [];

      for (const input of inputLines) {
        const lineId = asString(input.lineId);
        const action = asString(input.action);
        if (!lineId || !action) continue;
        const line = lineById.get(lineId);
        if (!line) {
          return reply.code(400).send({ message: "Ligne d'entree introuvable dans ce bon." });
        }

        const expected = line.expectedQuantity ?? 0;
        const completed = line.completedQuantity ?? 0;
        const observation = asString(input.observation);

        if (action === "COMPLETE_MISSING") {
          const missing = expected - completed;
          const quantity = toNumber(input.quantity) ?? 0;
          if (missing <= 0) {
            return reply.code(400).send({ message: "Cette ligne n'a pas de manquant a completer." });
          }
          if (quantity <= 0 || quantity > missing) {
            return reply.code(400).send({ message: "La quantite complementaire doit etre positive et inferieure ou egale au manquant." });
          }
          await tx.stockMovementLine.update({
            where: { id: line.id },
            data: {
              completedQuantity: completed + quantity,
              observation: [line.observation, observation].filter(Boolean).join(" - ") || undefined
            }
          });
          if (before.toLocationId) {
            await tx.stockLevel.upsert({
              where: { articleId_locationId: { articleId: line.articleId, locationId: before.toLocationId } },
              update: { quantity: { increment: quantity } },
              create: { articleId: line.articleId, locationId: before.toLocationId, quantity }
            });
          }
          resolutionNotes.push(`Complete ${line.article.code}: +${quantity}`);
          changed = true;
        } else if (action === "ACCEPT_SURPLUS") {
          if (completed <= expected) {
            return reply.code(400).send({ message: "Cette ligne n'a pas de surplus a accepter." });
          }
          await tx.stockMovementLine.update({
            where: { id: line.id },
            data: {
              expectedQuantity: completed,
              observation: [line.observation, observation].filter(Boolean).join(" - ") || undefined
            }
          });
          resolutionNotes.push(`Surplus accepte ${line.article.code}: ${completed - expected}`);
          changed = true;
        } else if (action === "RETURN_SURPLUS") {
          const surplus = completed - expected;
          const quantity = toNumber(input.quantity) ?? 0;
          if (surplus <= 0) {
            return reply.code(400).send({ message: "Cette ligne n'a pas de surplus a retourner." });
          }
          if (quantity <= 0 || quantity > surplus) {
            return reply.code(400).send({ message: "La quantite retournee doit etre positive et inferieure ou egale au surplus." });
          }
          if (!before.toLocationId) {
            return reply.code(400).send({ message: "Impossible de retourner un surplus sans emplacement de reception." });
          }
          const stock = await tx.stockLevel.findUnique({
            where: { articleId_locationId: { articleId: line.articleId, locationId: before.toLocationId } }
          });
          if (!stock || stock.quantity < quantity) {
            return reply.code(400).send({ message: "Stock disponible insuffisant pour retourner ce surplus." });
          }
          await tx.stockMovementLine.update({
            where: { id: line.id },
            data: {
              completedQuantity: completed - quantity,
              observation: [line.observation, observation].filter(Boolean).join(" - ") || undefined
            }
          });
          await tx.stockLevel.update({
            where: { articleId_locationId: { articleId: line.articleId, locationId: before.toLocationId } },
            data: { quantity: { decrement: quantity } }
          });
          resolutionNotes.push(`Surplus retourne ${line.article.code}: -${quantity}`);
          changed = true;
        } else {
          return reply.code(400).send({ message: "Action de resolution inconnue." });
        }
      }

      if (!changed) {
        return reply.code(400).send({ message: "Aucune resolution valide n'a ete fournie." });
      }

      const after = await tx.stockMovement.update({
        where: { id },
        data: {
          handledBy: asString(body.handledBy) ?? before.handledBy,
          notes: [before.notes, asString(body.notes), resolutionNotes.join(" / ")].filter(Boolean).join(" - ") || undefined
        },
        include: {
          lines: { include: { article: true } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "RESOLVE_STOCK_ENTRY_DISPUTE",
          entity: "StockMovement",
          entityId: after.id,
          before: before as any,
          after: after as any
        }
      });

      return after;
    });

    if (reply.sent) return;
    return reply.send(movement);
  });


  app.post("/stock-movements/exit-requests", async (request, reply) => {
    const body = asBody(request.body);
    const lines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de demande est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "DS-" + Date.now()),
          type: "EXIT_REQUEST",
          status: "SUBMITTED",
          date: parseDate(body.date),
          clientId: asString(body.clientId),
          projectId: asString(body.projectId),
          teamServiceId: asString(body.teamServiceId),
          siteLocationId: asString(body.siteLocationId),
          fromLocationId: asString(body.fromLocationId),
          requestedBy: asString(body.requestedBy),
          notes: asString(body.notes),
          lines: {
            create: lines.map((line) => ({
              articleId: String(line.articleId ?? ""),
              requestedQuantity: toNumber(line.requestedQuantity) ?? 0,
              observation: asString(line.observation)
            }))
          }
        },
        include: { lines: { include: { article: true } } }
      });

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "CREATE_EXIT_REQUEST",
          entity: "StockMovement",
          entityId: created.id,
          after: created as any
        }
      });

      return created;
    });

    return reply.code(201).send(movement);
  });


  app.post("/stock-movements/exit-requests/:id/prepare", async (request, reply) => {
    const params = request.params as { id: string };
    const body = asBody(request.body);
    const inputLines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    if (!inputLines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de preparation est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const requestMovement = await tx.stockMovement.findUnique({
        where: { id: params.id },
        include: {
          lines: { include: { article: true } },
          generatedExits: true
        }
      });
      if (!requestMovement || requestMovement.type !== "EXIT_REQUEST") {
        throw new Error("EXIT_REQUEST_NOT_FOUND");
      }
      if (requestMovement.status !== "SUBMITTED" || requestMovement.generatedExits.length > 0) {
        throw new Error("EXIT_REQUEST_ALREADY_PREPARED");
      }

      const fromLocationId = asString(body.fromLocationId) ?? requestMovement.fromLocationId;
      if (!fromLocationId) {
        throw new Error("EXIT_SOURCE_REQUIRED");
      }

      const preparedLines = requestMovement.lines.map((line) => {
        const input = inputLines.find((candidate) => asString(candidate.lineId) === line.id || asString(candidate.articleId) === line.articleId);
        const quantity = toNumber(input?.completedQuantity) ?? 0;
        const requestedQuantity = Number(line.requestedQuantity ?? 0);
        const observation = asString(input?.observation);
        if (quantity <= 0) {
          throw new Error("INVALID_EXIT_QUANTITY|" + line.article.designation);
        }
        if (requestedQuantity > 0 && quantity > requestedQuantity) {
          throw new Error("EXIT_EXCEEDS_REQUEST|" + line.article.designation + "|" + requestedQuantity + "|" + quantity);
        }
        if (requestedQuantity > 0 && quantity < requestedQuantity && !observation) {
          throw new Error("PARTIAL_EXIT_NEEDS_OBSERVATION|" + line.article.designation + "|" + requestedQuantity + "|" + quantity);
        }
        return { line, quantity, requestedQuantity, observation };
      });

      for (const item of preparedLines) {
        const level = await tx.stockLevel.findUnique({
          where: { articleId_locationId: { articleId: item.line.articleId, locationId: fromLocationId } },
          include: { article: true }
        });
        if (!level || level.quantity < item.quantity) {
          const available = level?.quantity ?? 0;
          throw new Error("STOCK_INSUFFICIENT|" + item.line.article.designation + "|" + available + "|" + item.quantity);
        }
      }

      const exit = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "BS-" + Date.now()),
          type: "EXIT",
          status: "COMPLETED",
          date: new Date(),
          clientId: requestMovement.clientId,
          projectId: requestMovement.projectId,
          teamServiceId: requestMovement.teamServiceId,
          siteLocationId: requestMovement.siteLocationId,
          fromLocationId,
          requestedBy: requestMovement.requestedBy,
          handledBy: asString(body.handledBy),
          deliveredBy: asString(body.deliveredBy),
          receivedBy: asString(body.receivedBy),
          sourceRequestId: requestMovement.id,
          notes: requestMovement.notes,
          lines: {
            create: preparedLines.map((item) => ({
              articleId: item.line.articleId,
              requestedQuantity: item.line.requestedQuantity,
              completedQuantity: item.quantity,
              observation: item.observation
            }))
          }
        }
      });

      for (const item of preparedLines) {
        await tx.stockLevel.update({
          where: { articleId_locationId: { articleId: item.line.articleId, locationId: fromLocationId } },
          data: { quantity: { decrement: item.quantity } }
        });
        await tx.stockMovementLine.update({
          where: { id: item.line.id },
          data: { completedQuantity: item.quantity, observation: item.observation }
        });
      }

      const updated = await tx.stockMovement.update({
        where: { id: requestMovement.id },
        data: {
          status: "PREPARED",
          fromLocationId,
          handledBy: asString(body.handledBy),
          deliveredBy: asString(body.deliveredBy),
          receivedBy: asString(body.receivedBy)
        },
        include: {
          lines: { include: { article: true } },
          generatedExits: { include: { lines: { include: { article: true } } } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "PREPARE_EXIT_REQUEST",
          entity: "StockMovement",
          entityId: requestMovement.id,
          after: { request: updated, exit } as any
        }
      });

      return updated;
    }).catch((error) => {
      if (error instanceof Error && error.message === "EXIT_REQUEST_NOT_FOUND") {
        return reply.code(404).send({ message: "Demande materiel introuvable." });
      }
      if (error instanceof Error && error.message === "EXIT_REQUEST_ALREADY_PREPARED") {
        return reply.code(409).send({ message: "Cette demande est deja preparee ou terminee. Le stock ne peut pas etre deduit une deuxieme fois." });
      }
      if (error instanceof Error && error.message === "EXIT_SOURCE_REQUIRED") {
        return reply.code(400).send({ message: "Un magasin source est requis pour preparer la demande." });
      }
      if (error instanceof Error && error.message.startsWith("STOCK_INSUFFICIENT|")) {
        const [, label, available, quantity] = error.message.split("|");
        return reply.code(409).send({ message: "Stock insuffisant pour " + label + ". Disponible " + available + ", demande " + quantity + "." });
      }
      if (error instanceof Error && error.message.startsWith("EXIT_EXCEEDS_REQUEST|")) {
        const [, label, requested, quantity] = error.message.split("|");
        return reply.code(400).send({ message: "Quantite remise superieure a la demande pour " + label + ". Demandee " + requested + ", remise " + quantity + "." });
      }
      if (error instanceof Error && error.message.startsWith("PARTIAL_EXIT_NEEDS_OBSERVATION|")) {
        const [, label] = error.message.split("|");
        return reply.code(400).send({ message: "Remise partielle pour " + label + " : ajoute une observation avant validation." });
      }
      if (error instanceof Error && error.message.startsWith("INVALID_EXIT_QUANTITY|")) {
        return reply.code(400).send({ message: "La quantite remise doit etre superieure a 0." });
      }
      throw error;
    });

    if (reply.sent) return;
    return reply.send(movement);
  });

  app.post("/stock-movements/exit-requests/:id/reject", async (request, reply) => {
    const params = request.params as { id: string };
    const body = asBody(request.body);
    const reason = asString(body.reason)?.trim();
    if (!reason) {
      return reply.code(400).send({ message: "Le motif du refus est obligatoire." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const before = await tx.stockMovement.findUnique({
        where: { id: params.id },
        include: {
          lines: { include: { article: true } },
          generatedExits: { include: { lines: { include: { article: true } } } }
        }
      });
      if (!before || before.type !== "EXIT_REQUEST") {
        throw new Error("EXIT_REQUEST_NOT_FOUND");
      }
      if (before.status !== "SUBMITTED" || before.generatedExits.length > 0) {
        throw new Error("EXIT_REQUEST_NOT_REJECTABLE");
      }

      const updated = await tx.stockMovement.update({
        where: { id: before.id },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: asString(body.rejectedBy)
        },
        include: {
          lines: { include: { article: true } },
          generatedExits: { include: { lines: { include: { article: true } } } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "REJECT_EXIT_REQUEST",
          entity: "StockMovement",
          entityId: updated.id,
          before: before as any,
          after: updated as any
        }
      });

      return updated;
    }).catch((error) => {
      if (error instanceof Error && error.message === "EXIT_REQUEST_NOT_FOUND") {
        return reply.code(404).send({ message: "Demande materiel introuvable." });
      }
      if (error instanceof Error && error.message === "EXIT_REQUEST_NOT_REJECTABLE") {
        return reply.code(409).send({ message: "Cette demande est deja preparee ou terminee. Elle ne peut plus etre refusee." });
      }
      throw error;
    });

    if (reply.sent) return;
    return reply.send(movement);
  });

  app.post("/stock-movements/exit-requests/:id/proof", async (request, reply) => {
    const params = request.params as { id: string };
    if (!request.isMultipart()) {
      return reply.code(400).send({ message: "Ajoute le fichier signe en multipart/form-data." });
    }

    const uploaded = await request.file();
    if (!uploaded) {
      return reply.code(400).send({ message: "Ajoute la fiche signee." });
    }
    const fileName = uploaded.filename || "preuve-signee";
    const mimeType = uploaded.mimetype || "application/octet-stream";
    if (!mimeType.startsWith("application/pdf") && !mimeType.startsWith("image/")) {
      return reply.code(400).send({ message: "La preuve doit etre un PDF ou une image." });
    }

    const existing = await prisma.stockMovement.findUnique({ where: { id: params.id } });
    if (!existing || existing.type !== "EXIT_REQUEST") {
      return reply.code(404).send({ message: "Demande materiel introuvable." });
    }
    if (existing.status === "SUBMITTED") {
      return reply.code(400).send({ message: "La demande doit etre preparee avant de joindre la fiche signee." });
    }

    const buffer = await uploaded.toBuffer();
    let proofFileKey = "";
    try {
      proofFileKey = await saveProofFile(existing.id, fileName, mimeType, buffer);
    } catch (error) {
      if (error instanceof Error && error.message === "R2_NOT_CONFIGURED") {
        return reply.code(500).send({ message: "Stockage Cloudflare R2 non configure." });
      }
      if (error instanceof Error && error.message === "STORAGE_DRIVER_INVALID") {
        return reply.code(500).send({ message: "Driver de stockage invalide." });
      }
      throw error;
    }
    const uploadedByField = uploaded.fields.uploadedBy as { value?: unknown } | undefined;
    const auditUserIdField = uploaded.fields.auditUserId as { value?: unknown } | undefined;
    const updated = await prisma.stockMovement.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        proofFileKey,
        proofFileName: fileName,
        proofMimeType: mimeType,
        proofSizeBytes: buffer.byteLength,
        proofUploadedAt: new Date(),
        proofUploadedBy: asString(uploadedByField?.value)
      },
      include: {
        lines: { include: { article: true } },
        generatedExits: { include: { lines: { include: { article: true } } } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: asString(auditUserIdField?.value) ?? null,
        action: "UPLOAD_EXIT_REQUEST_PROOF",
        entity: "StockMovement",
        entityId: updated.id,
        after: updated as any
      }
    });

    return reply.send(updated);
  });

  app.get("/stock-movements/exit-requests/:id/proof", async (request, reply) => {
    const params = request.params as { id: string };
    const movement = await prisma.stockMovement.findUnique({ where: { id: params.id } });
    if (!movement || movement.type !== "EXIT_REQUEST") {
      return reply.code(404).send({ message: "Demande materiel introuvable." });
    }
    if (!movement.proofFileKey) {
      return reply.code(404).send({ message: "Aucune preuve signee jointe." });
    }
    try {
      if (storageDriver() === "local") {
        const filePath = localProofPath(movement.proofFileKey);
        await stat(filePath);
        const protoHeader = request.headers["x-forwarded-proto"];
        const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader ?? request.protocol;
        return {
          url: protocol + "://" + request.headers.host + "/stock-movements/exit-requests/" + encodeURIComponent(movement.id) + "/proof/file",
          fileName: movement.proofFileName,
          mimeType: movement.proofMimeType
        };
      }
      return {
        url: await signedProofUrl(movement.proofFileKey),
        fileName: movement.proofFileName,
        mimeType: movement.proofMimeType,
        expiresIn: 300
      };
    } catch (error) {
      if (error instanceof Error && error.message === "R2_NOT_CONFIGURED") {
        return reply.code(500).send({ message: "Stockage Cloudflare R2 non configure." });
      }
      if (error instanceof Error && error.message === "STORAGE_DRIVER_INVALID") {
        return reply.code(500).send({ message: "Driver de stockage invalide." });
      }
      throw error;
    }
  });

  app.get("/stock-movements/exit-requests/:id/proof/file", async (request, reply) => {
    const params = request.params as { id: string };
    if (storageDriver() !== "local") {
      return reply.code(404).send({ message: "Fichier local indisponible avec ce driver de stockage." });
    }
    const movement = await prisma.stockMovement.findUnique({ where: { id: params.id } });
    if (!movement || movement.type !== "EXIT_REQUEST") {
      return reply.code(404).send({ message: "Demande materiel introuvable." });
    }
    if (!movement.proofFileKey) {
      return reply.code(404).send({ message: "Aucune preuve signee jointe." });
    }
    const filePath = localProofPath(movement.proofFileKey);
    try {
      await stat(filePath);
    } catch {
      return reply.code(404).send({ message: "Fichier local introuvable." });
    }
    reply.header("Content-Type", movement.proofMimeType ?? "application/octet-stream");
    reply.header("Content-Disposition", "inline; filename=\"" + safeFileName(movement.proofFileName ?? "preuve-signee") + "\"");
    return reply.send(createReadStream(filePath));
  });

  app.post("/stock-movements/exits", async (request, reply) => {
    const body = asBody(request.body);
    const lines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    const fromLocationId = asString(body.fromLocationId);
    if (!fromLocationId) {
      return reply.code(400).send({ message: "Un magasin source est requis pour une sortie." });
    }
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de sortie est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const articleId = String(line.articleId ?? "");
        const quantity = toNumber(line.completedQuantity) ?? 0;
        const requestedQuantity = toNumber(line.requestedQuantity) ?? 0;
        const observation = asString(line.observation);
        if (quantity <= 0) {
          throw new Error("INVALID_EXIT_QUANTITY|" + articleId);
        }
        if (requestedQuantity > 0 && quantity > requestedQuantity) {
          throw new Error("EXIT_EXCEEDS_REQUEST|" + articleId + "|" + requestedQuantity + "|" + quantity);
        }
        if (requestedQuantity > 0 && quantity < requestedQuantity && !observation) {
          throw new Error("PARTIAL_EXIT_NEEDS_OBSERVATION|" + articleId + "|" + requestedQuantity + "|" + quantity);
        }
        const level = await tx.stockLevel.findUnique({
          where: { articleId_locationId: { articleId, locationId: fromLocationId } },
          include: { article: true }
        });
        if (!level || level.quantity < quantity) {
          const label = level?.article.designation ?? articleId;
          const available = level?.quantity ?? 0;
          throw new Error("STOCK_INSUFFICIENT|" + label + "|" + available + "|" + quantity);
        }
      }

      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "BS-" + Date.now()),
          type: "EXIT",
          status: "COMPLETED",
          date: parseDate(body.date),
          clientId: asString(body.clientId),
          projectId: asString(body.projectId),
          teamServiceId: asString(body.teamServiceId),
          siteLocationId: asString(body.siteLocationId),
          fromLocationId,
          handledBy: asString(body.handledBy),
          deliveredBy: asString(body.deliveredBy),
          requestedBy: asString(body.requestedBy),
          notes: asString(body.notes),
          lines: {
            create: lines.map((line) => ({
              articleId: String(line.articleId ?? ""),
              requestedQuantity: toNumber(line.requestedQuantity),
              completedQuantity: toNumber(line.completedQuantity) ?? 0,
              observation: asString(line.observation)
            }))
          }
        },
        include: { lines: { include: { article: true } } }
      });

      for (const line of created.lines) {
        await tx.stockLevel.update({
          where: { articleId_locationId: { articleId: line.articleId, locationId: fromLocationId } },
          data: { quantity: { decrement: line.completedQuantity ?? 0 } }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "CREATE_STOCK_EXIT",
          entity: "StockMovement",
          entityId: created.id,
          after: created as any
        }
      });

      return created;
    }).catch((error) => {
      if (error instanceof Error && error.message.startsWith("STOCK_INSUFFICIENT|")) {
        const [, label, available, quantity] = error.message.split("|");
        return reply.code(409).send({ message: "Stock insuffisant pour " + label + ". Disponible " + available + ", demande " + quantity + "." });
      }
      if (error instanceof Error && error.message.startsWith("EXIT_EXCEEDS_REQUEST|")) {
        const [, , requested, quantity] = error.message.split("|");
        return reply.code(400).send({ message: "Quantite remise superieure a la quantite demandee. Demandee " + requested + ", remise " + quantity + "." });
      }
      if (error instanceof Error && error.message.startsWith("PARTIAL_EXIT_NEEDS_OBSERVATION|")) {
        return reply.code(400).send({ message: "Remise partielle : ajoute une observation avant validation." });
      }
      if (error instanceof Error && error.message.startsWith("INVALID_EXIT_QUANTITY|")) {
        return reply.code(400).send({ message: "La quantite remise doit etre superieure a 0." });
      }
      throw error;
    });

    if (reply.sent) return;
    return reply.code(201).send(movement);
  });

  app.post("/stock-movements/returns", async (request, reply) => {
    const body = asBody(request.body);
    const lines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    const toLocationId = asString(body.toLocationId);
    const sourceMovementId = asString(body.sourceMovementId);
    if (!toLocationId) {
      return reply.code(400).send({ message: "Un emplacement retour est requis." });
    }
    if (!sourceMovementId) {
      return reply.code(400).send({ message: "La sortie d'origine est requise pour enregistrer un retour." });
    }
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de retour est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const source = await tx.stockMovement.findUnique({
        where: { id: sourceMovementId },
        include: { lines: { include: { article: true } } }
      });
      if (!source || source.type !== "EXIT") {
        throw new Error("RETURN_SOURCE_NOT_FOUND");
      }

      const previousReturns = await tx.stockMovement.findMany({
        where: {
          type: "RETURN",
          sourceRequestId: sourceMovementId,
          status: { not: "CANCELLED" }
        },
        include: { lines: true }
      });
      const returnedByArticle = new Map<string, number>();
      for (const item of previousReturns) {
        for (const line of item.lines) {
          returnedByArticle.set(
            line.articleId,
            (returnedByArticle.get(line.articleId) ?? 0) + Number(line.completedQuantity ?? 0)
          );
        }
      }
      const sourceByArticle = new Map(source.lines.map((line) => [line.articleId, line]));
      const seenArticleIds = new Set<string>();
      const checkedLines = lines.map((line) => {
        const articleId = String(line.articleId ?? "");
        const quantity = toNumber(line.completedQuantity) ?? 0;
        const goodQuantity = toNumber(line.goodQuantity) ?? 0;
        const damagedQuantity = toNumber(line.damagedQuantity) ?? 0;
        const scrapQuantity = toNumber(line.scrapQuantity) ?? 0;
        const pendingControlQuantity = toNumber(line.pendingControlQuantity) ?? 0;
        const stateTotal = goodQuantity + damagedQuantity + scrapQuantity + pendingControlQuantity;
        const sourceLine = sourceByArticle.get(articleId);
        if (!articleId || !sourceLine) {
          throw new Error("RETURN_ARTICLE_NOT_IN_SOURCE|" + articleId);
        }
        if (seenArticleIds.has(articleId)) {
          throw new Error("RETURN_DUPLICATE_ARTICLE|" + (sourceLine.article?.designation ?? articleId));
        }
        seenArticleIds.add(articleId);
        if (quantity <= 0) {
          throw new Error("INVALID_RETURN_QUANTITY|" + (sourceLine.article?.designation ?? articleId));
        }
        if ([goodQuantity, damagedQuantity, scrapQuantity, pendingControlQuantity].some((value) => value < 0)) {
          throw new Error("INVALID_RETURN_STATE_QUANTITY|" + (sourceLine.article?.designation ?? articleId));
        }
        if (!sameQuantity(stateTotal, quantity)) {
          throw new Error("RETURN_STATE_TOTAL_MISMATCH|" + (sourceLine.article?.designation ?? articleId));
        }
        const exited = Number(sourceLine.completedQuantity ?? 0);
        const alreadyReturned = returnedByArticle.get(articleId) ?? 0;
        const remaining = exited - alreadyReturned;
        if (quantity > remaining) {
          throw new Error("RETURN_EXCEEDS_REMAINING|" + (sourceLine.article?.designation ?? articleId) + "|" + remaining + "|" + quantity);
        }
        return {
          articleId,
          quantity,
          goodQuantity,
          damagedQuantity,
          scrapQuantity,
          pendingControlQuantity,
          observation: asString(line.observation)
        };
      });
      const hasPendingControl = checkedLines.some((line) => line.pendingControlQuantity > 0);

      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "RET-" + Date.now()),
          type: "RETURN",
          status: hasPendingControl ? "PREPARED" : "COMPLETED",
          date: parseDate(body.date),
          sourceRequestId: sourceMovementId,
          toLocationId,
          handledBy: asString(body.handledBy),
          receivedBy: asString(body.receivedBy),
          deliveredBy: asString(body.deliveredBy),
          notes: asString(body.notes),
          lines: {
            create: checkedLines.map((line) => ({
              articleId: line.articleId,
              completedQuantity: line.quantity,
              observation: [
                "Retour: total " + line.quantity,
                "bon etat " + line.goodQuantity,
                "endommage " + line.damagedQuantity,
                "rebut " + line.scrapQuantity,
                "a controler " + line.pendingControlQuantity,
                line.observation
              ].filter(Boolean).join(" | ")
            }))
          }
        },
        include: {
          lines: { include: { article: true } },
          sourceRequest: { include: { lines: { include: { article: true } } } }
        }
      });

      for (const line of checkedLines) {
        if (line.goodQuantity > 0) {
          await tx.stockLevel.upsert({
            where: { articleId_locationId: { articleId: line.articleId, locationId: toLocationId } },
            update: { quantity: { increment: line.goodQuantity } },
            create: { articleId: line.articleId, locationId: toLocationId, quantity: line.goodQuantity }
          });
        }
      }

      await tx.auditLog.create({
        data: { userId: auditUserIdFromBody(body), action: "CREATE_STOCK_RETURN", entity: "StockMovement", entityId: created.id, after: created as any }
      });
      return created;
    }).catch((error) => {
      if (error instanceof Error && error.message === "RETURN_SOURCE_NOT_FOUND") {
        return reply.code(404).send({ message: "Sortie d'origine introuvable." });
      }
      if (error instanceof Error && error.message.startsWith("RETURN_ARTICLE_NOT_IN_SOURCE|")) {
        return reply.code(400).send({ message: "Un article retourne n'appartient pas a la sortie selectionnee." });
      }
      if (error instanceof Error && error.message.startsWith("RETURN_DUPLICATE_ARTICLE|")) {
        const [, label] = error.message.split("|");
        return reply.code(400).send({ message: "Article en double dans le retour : " + label + "." });
      }
      if (error instanceof Error && error.message.startsWith("INVALID_RETURN_QUANTITY|")) {
        return reply.code(400).send({ message: "La quantite retournee doit etre superieure a 0." });
      }
      if (error instanceof Error && error.message.startsWith("INVALID_RETURN_STATE_QUANTITY|")) {
        return reply.code(400).send({ message: "Les quantites par etat doivent etre positives ou nulles." });
      }
      if (error instanceof Error && error.message.startsWith("RETURN_STATE_TOTAL_MISMATCH|")) {
        const [, label] = error.message.split("|");
        return reply.code(400).send({ message: "La somme des etats doit etre egale au total retourne pour " + label + "." });
      }
      if (error instanceof Error && error.message.startsWith("RETURN_EXCEEDS_REMAINING|")) {
        const [, label, remaining, quantity] = error.message.split("|");
        return reply.code(400).send({ message: "Retour superieur au reste pour " + label + ". Reste " + remaining + ", retour " + quantity + "." });
      }
      throw error;
    });

    if (reply.sent) return;
    return reply.code(201).send(movement);
  });

  app.post("/stock-movements/returns/:id/control", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = asBody(request.body);
    const inputLines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    if (!inputLines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de controle est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const before = await tx.stockMovement.findUnique({
        where: { id },
        include: { lines: { include: { article: true } } }
      });
      if (!before || before.type !== "RETURN") {
        throw new Error("RETURN_NOT_FOUND");
      }
      if (before.status === "COMPLETED" || before.status === "CANCELLED" || before.status !== "PREPARED") {
        throw new Error("RETURN_NOT_CONTROLLABLE");
      }
      if (!before.toLocationId) {
        throw new Error("RETURN_LOCATION_REQUIRED");
      }

      const lineById = new Map(before.lines.map((line) => [line.id, line]));
      const pendingLineIds = new Set(
        before.lines
          .filter((line) => {
            const breakdown = returnBreakdownFromObservation(line.observation);
            return (breakdown.structured ? breakdown.pending : Number(line.completedQuantity ?? 0)) > 0;
          })
          .map((line) => line.id)
      );
      const inputLineIds = new Set(inputLines.map((line) => asString(line.lineId)).filter(Boolean) as string[]);
      if (pendingLineIds.size === 0 || [...pendingLineIds].some((lineId) => !inputLineIds.has(lineId))) {
        throw new Error("RETURN_CONTROL_INCOMPLETE");
      }
      const seenLineIds = new Set<string>();
      const decisionLabels: Record<string, string> = {
        REINTEGRATE: "Reintegre au stock",
        DISCARD: "Rebut / inutilisable",
        REPAIR: "A reparer / anomalie"
      };

      for (const input of inputLines) {
        const lineId = asString(input.lineId);
        const decision = asString(input.decision);
        if (!lineId || !decision) {
          throw new Error("INVALID_RETURN_CONTROL_LINE");
        }
        if (seenLineIds.has(lineId)) {
          throw new Error("DUPLICATE_RETURN_CONTROL_LINE");
        }
        seenLineIds.add(lineId);
        const line = lineById.get(lineId);
        if (!line) {
          throw new Error("RETURN_CONTROL_LINE_NOT_FOUND");
        }
        if (!["REINTEGRATE", "DISCARD", "REPAIR"].includes(decision)) {
          throw new Error("INVALID_RETURN_CONTROL_DECISION");
        }
        const breakdown = returnBreakdownFromObservation(line.observation);
        const pendingQuantity = breakdown.structured
          ? breakdown.pending
          : Number(line.completedQuantity ?? 0);
        if (pendingQuantity <= 0) {
          throw new Error("RETURN_CONTROL_NO_PENDING|" + (line.article?.designation ?? line.articleId));
        }
        const acceptedQuantity = decision === "REINTEGRATE" ? toNumber(input.acceptedQuantity) ?? pendingQuantity : 0;
        if (acceptedQuantity < 0 || acceptedQuantity > pendingQuantity) {
          throw new Error("INVALID_ACCEPTED_RETURN_QUANTITY|" + (line.article?.designation ?? line.articleId));
        }
        if (decision === "REINTEGRATE" && acceptedQuantity <= 0) {
          throw new Error("INVALID_ACCEPTED_RETURN_QUANTITY|" + (line.article?.designation ?? line.articleId));
        }

        if (decision === "REINTEGRATE") {
          await tx.stockLevel.upsert({
            where: { articleId_locationId: { articleId: line.articleId, locationId: before.toLocationId } },
            update: { quantity: { increment: acceptedQuantity } },
            create: { articleId: line.articleId, locationId: before.toLocationId, quantity: acceptedQuantity }
          });
        }

        const controlNote = [
          "Controle retour: " + decisionLabels[decision],
          decision === "REINTEGRATE" ? "quantite acceptee " + acceptedQuantity : undefined,
          "sur a controler " + pendingQuantity,
          asString(input.observation)
        ].filter(Boolean).join(" - ");
        await tx.stockMovementLine.update({
          where: { id: line.id },
          data: {
            observation: [line.observation, controlNote].filter(Boolean).join(" | ") || undefined
          }
        });
      }

      const after = await tx.stockMovement.update({
        where: { id: before.id },
        data: {
          status: "COMPLETED",
          handledBy: asString(body.handledBy) ?? before.handledBy,
          notes: [before.notes, asString(body.notes)].filter(Boolean).join(" - ") || undefined
        },
        include: {
          lines: { include: { article: true } },
          sourceRequest: { include: { lines: { include: { article: true } } } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: auditUserIdFromBody(body),
          action: "CONTROL_STOCK_RETURN",
          entity: "StockMovement",
          entityId: after.id,
          before: before as any,
          after: after as any
        }
      });

      return after;
    }).catch((error) => {
      if (error instanceof Error && error.message === "RETURN_NOT_FOUND") {
        return reply.code(404).send({ message: "Retour stock introuvable." });
      }
      if (error instanceof Error && error.message === "RETURN_NOT_CONTROLLABLE") {
        return reply.code(409).send({ message: "Ce retour est deja controle ou ne peut pas etre controle." });
      }
      if (error instanceof Error && error.message === "RETURN_LOCATION_REQUIRED") {
        return reply.code(400).send({ message: "Emplacement retour manquant pour reintegrer le stock." });
      }
      if (error instanceof Error && error.message === "RETURN_CONTROL_INCOMPLETE") {
        return reply.code(400).send({ message: "Toutes les quantites a controler doivent etre traitees." });
      }
      if (error instanceof Error && error.message.startsWith("INVALID_ACCEPTED_RETURN_QUANTITY|")) {
        const [, label] = error.message.split("|");
        return reply.code(400).send({ message: "Quantite acceptee invalide pour " + label + "." });
      }
      if (error instanceof Error && error.message.startsWith("RETURN_CONTROL_NO_PENDING|")) {
        const [, label] = error.message.split("|");
        return reply.code(400).send({ message: "Aucune quantite a controler pour " + label + "." });
      }
      if (error instanceof Error && error.message === "INVALID_RETURN_CONTROL_LINE") {
        return reply.code(400).send({ message: "Chaque ligne controlee doit avoir une decision." });
      }
      if (error instanceof Error && error.message === "DUPLICATE_RETURN_CONTROL_LINE") {
        return reply.code(400).send({ message: "Une ligne de retour ne peut etre controlee qu'une seule fois." });
      }
      if (error instanceof Error && error.message === "RETURN_CONTROL_LINE_NOT_FOUND") {
        return reply.code(400).send({ message: "Une ligne controlee n'appartient pas a ce retour." });
      }
      if (error instanceof Error && error.message === "INVALID_RETURN_CONTROL_DECISION") {
        return reply.code(400).send({ message: "Decision de controle inconnue." });
      }
      throw error;
    });

    if (reply.sent) return;
    return reply.send(movement);
  });

  app.post("/stock-movements/transfers", async (request, reply) => {
    const body = asBody(request.body);
    const lines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    const fromLocationId = asString(body.fromLocationId);
    const toLocationId = asString(body.toLocationId);
    if (!fromLocationId || !toLocationId) {
      return reply.code(400).send({ message: "Les emplacements source et destination sont requis." });
    }
    if (fromLocationId === toLocationId) {
      return reply.code(400).send({ message: "La source et la destination doivent etre differentes." });
    }
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de transfert est requise." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const articleId = String(line.articleId ?? "");
        const quantity = toNumber(line.completedQuantity) ?? 0;
        const level = await tx.stockLevel.findUnique({
          where: { articleId_locationId: { articleId, locationId: fromLocationId } },
          include: { article: true }
        });
        if (!level || level.quantity < quantity) {
          const label = level?.article.designation ?? articleId;
          const available = level?.quantity ?? 0;
          throw new Error("STOCK_INSUFFICIENT|" + label + "|" + available + "|" + quantity);
        }
      }

      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "TRF-" + Date.now()),
          type: "TRANSFER",
          status: "COMPLETED",
          date: parseDate(body.date),
          fromLocationId,
          toLocationId,
          handledBy: asString(body.handledBy),
          receivedBy: asString(body.receivedBy),
          deliveredBy: asString(body.deliveredBy),
          notes: asString(body.notes),
          lines: {
            create: lines.map((line) => ({
              articleId: String(line.articleId ?? ""),
              completedQuantity: toNumber(line.completedQuantity) ?? 0,
              observation: asString(line.observation)
            }))
          }
        },
        include: { lines: { include: { article: true } } }
      });

      for (const line of created.lines) {
        const quantity = line.completedQuantity ?? 0;
        await tx.stockLevel.update({
          where: { articleId_locationId: { articleId: line.articleId, locationId: fromLocationId } },
          data: { quantity: { decrement: quantity } }
        });
        await tx.stockLevel.upsert({
          where: { articleId_locationId: { articleId: line.articleId, locationId: toLocationId } },
          update: { quantity: { increment: quantity } },
          create: { articleId: line.articleId, locationId: toLocationId, quantity }
        });
      }

      await tx.auditLog.create({
        data: { userId: auditUserIdFromBody(body), action: "CREATE_STOCK_TRANSFER", entity: "StockMovement", entityId: created.id, after: created as any }
      });
      return created;
    }).catch((error) => {
      if (error instanceof Error && error.message.startsWith("STOCK_INSUFFICIENT|")) {
        const [, label, available, quantity] = error.message.split("|");
        return reply.code(409).send({ message: "Stock insuffisant pour " + label + ". Disponible " + available + ", demande " + quantity + "." });
      }
      throw error;
    });

    if (reply.sent) return;
    return reply.code(201).send(movement);
  });
  app.post("/stock-movements/adjustments", async (request, reply) => {
    const body = asBody(request.body);
    const lines = Array.isArray(body.lines) ? body.lines as Array<Record<string, unknown>> : [];
    const locationId = asString(body.locationId);
    if (!locationId) {
      return reply.code(400).send({ message: "Un emplacement inventorie est requis." });
    }
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de comptage est requise." });
    }

    let checkedLines: Array<{
      articleId: string;
      expectedQuantity: number | undefined;
      completedQuantity: number;
      goodQuantity: number;
      repairQuantity: number;
      outOfServiceQuantity: number;
      observation: string | undefined;
    }>;
    try {
      checkedLines = lines.map((line) => {
        const articleId = String(line.articleId ?? "");
        const completedQuantity = toNumber(line.completedQuantity) ?? 0;
        const goodQuantity = line.goodQuantity === undefined ? completedQuantity : toNumber(line.goodQuantity) ?? 0;
        const repairQuantity = toNumber(line.repairQuantity) ?? 0;
        const outOfServiceQuantity = toNumber(line.outOfServiceQuantity) ?? 0;
        const stateTotal = goodQuantity + repairQuantity + outOfServiceQuantity;
        if (!articleId) {
          throw new Error("INVALID_INVENTORY_ARTICLE");
        }
        if ([completedQuantity, goodQuantity, repairQuantity, outOfServiceQuantity].some((value) => value < 0)) {
          throw new Error("INVALID_INVENTORY_QUANTITY");
        }
        if (!sameQuantity(stateTotal, completedQuantity)) {
          throw new Error("INVENTORY_STATE_TOTAL_MISMATCH");
        }
        return {
          articleId,
          expectedQuantity: toNumber(line.expectedQuantity),
          completedQuantity,
          goodQuantity,
          repairQuantity,
          outOfServiceQuantity,
          observation: asString(line.observation)
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_INVENTORY_ARTICLE") {
        return reply.code(400).send({ message: "Chaque ligne d'inventaire doit contenir un article." });
      }
      if (error instanceof Error && error.message === "INVALID_INVENTORY_QUANTITY") {
        return reply.code(400).send({ message: "Les quantites d'inventaire doivent etre positives ou nulles." });
      }
      if (error instanceof Error && error.message === "INVENTORY_STATE_TOTAL_MISMATCH") {
        return reply.code(400).send({ message: "La quantite constatee doit etre egale a bon etat + a reparer + hors service." });
      }
      throw error;
    }

    const movement = await prisma.$transaction(async (tx) => {
      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "INV-" + Date.now()),
          type: "ADJUSTMENT",
          status: "COMPLETED",
          date: parseDate(body.date),
          fromLocationId: locationId,
          toLocationId: locationId,
          handledBy: asString(body.handledBy),
          notes: asString(body.notes),
          lines: {
            create: checkedLines.map((line) => ({
              articleId: line.articleId,
              expectedQuantity: line.expectedQuantity,
              completedQuantity: line.completedQuantity,
              observation: [
                "Inventaire: constate " + line.completedQuantity,
                "bon etat " + line.goodQuantity,
                "a reparer " + line.repairQuantity,
                "hors service " + line.outOfServiceQuantity,
                line.observation
              ].filter(Boolean).join(" | ")
            }))
          }
        },
        include: { lines: { include: { article: true } } }
      });

      for (const line of created.lines) {
        await tx.stockLevel.upsert({
          where: { articleId_locationId: { articleId: line.articleId, locationId } },
          update: { quantity: line.completedQuantity ?? 0 },
          create: { articleId: line.articleId, locationId, quantity: line.completedQuantity ?? 0 }
        });
      }

      await tx.auditLog.create({
        data: { userId: auditUserIdFromBody(body), action: "CREATE_INVENTORY_ADJUSTMENT", entity: "StockMovement", entityId: created.id, after: created as any }
      });
      return created;
    });

    return reply.code(201).send(movement);
  });

  app.get("/audit-logs", async () => {
    return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  });

  app.get("/alerts", async () => {
    const [levels, movements] = await Promise.all([
      prisma.stockLevel.findMany({
        where: { OR: [{ quantity: { lte: 0 } }, { quantity: { lte: 999999999 } }] },
        include: { article: true, location: true },
        orderBy: [{ location: { code: "asc" } }, { article: { code: "asc" } }]
      }),
      prisma.stockMovement.findMany({
        where: { status: { not: "CANCELLED" } },
        include: {
          lines: { include: { article: true } },
          sourceRequest: true
        },
        orderBy: { createdAt: "desc" },
        take: 200
      })
    ]);
    const movementLocationIds = movements
      .flatMap((movement) => [movement.fromLocationId, movement.toLocationId, movement.siteLocationId])
      .filter(Boolean) as string[];
    const movementLocations = movementLocationIds.length
      ? await prisma.location.findMany({ where: { id: { in: movementLocationIds } } })
      : [];
    const locationsById = new Map(movementLocations.map((location) => [location.id, location]));
    const movementLocation = (movement: typeof movements[number]) =>
      locationsById.get(movement.toLocationId ?? "") ??
      locationsById.get(movement.fromLocationId ?? "") ??
      locationsById.get(movement.siteLocationId ?? "") ??
      null;

    const stockAlerts = levels
      .filter((level) => level.quantity <= level.article.minimumStock)
      .map((level) => ({
        id: "stock-" + level.id,
        domain: "STOCK",
        type: level.quantity <= 0 ? "Rupture" : "Stock bas",
        object: level.article.designation,
        objectCode: level.article.code,
        articleId: level.articleId,
        articleCode: level.article.code,
        articleName: level.article.designation,
        locationId: level.locationId,
        location: level.location.name,
        severity: level.quantity <= 0 ? "CRITIQUE" : "A_VERIFIER",
        date: level.updatedAt,
        impact: "Disponible " + level.quantity + " / seuil " + level.article.minimumStock,
        action: level.quantity <= 0 ? "Reapprovisionner avant nouvelle sortie" : "Verifier le seuil et preparer reapprovisionnement",
        status: "OUVERTE",
        completedQuantity: level.quantity,
        expectedQuantity: level.article.minimumStock,
        gapQuantity: level.quantity - level.article.minimumStock
      }));

    const inventoryAlerts = movements
      .filter((movement) => movement.type === "ADJUSTMENT")
      .flatMap((movement) => movement.lines
      .filter((line) => (line.expectedQuantity ?? 0) !== (line.completedQuantity ?? 0))
      .map((line) => ({
        id: "inventory-" + line.id,
        domain: "INVENTORY",
        type: "Ecart inventaire",
        object: line.article.designation,
        objectCode: line.article.code,
        articleId: line.articleId,
        articleCode: line.article.code,
        articleName: line.article.designation,
        locationId: movement.toLocationId ?? movement.fromLocationId,
        location: movementLocation(movement)?.name ?? "Emplacement inventorie",
        movementId: movement.id,
        movementReference: movement.reference,
        severity: "A_VERIFIER",
        date: movement.createdAt,
        impact: "Ecart " + ((line.completedQuantity ?? 0) - (line.expectedQuantity ?? 0)),
        action: "Controler et justifier ecart " + ((line.completedQuantity ?? 0) - (line.expectedQuantity ?? 0)),
        status: "OUVERTE",
        expectedQuantity: line.expectedQuantity,
        completedQuantity: line.completedQuantity,
        gapQuantity: (line.completedQuantity ?? 0) - (line.expectedQuantity ?? 0),
        details: { observation: line.observation }
      }))
    );

    const entryDisputes = movements
      .filter((movement) => movement.type === "ENTRY" && movement.status !== "COMPLETED")
      .flatMap((movement) => movement.lines
        .filter((line) => {
          const expected = line.expectedQuantity ?? 0;
          const completed = line.completedQuantity ?? 0;
          return expected > 0 && expected !== completed;
        })
        .map((line) => ({
          id: "entry-" + line.id,
          domain: "ENTRY",
          type: "Entree en litige",
          object: line.article.designation,
          objectCode: line.article.code,
          articleId: line.articleId,
          articleCode: line.article.code,
          articleName: line.article.designation,
          locationId: movement.toLocationId,
          location: movementLocation(movement)?.name ?? "Magasin reception",
          movementId: movement.id,
          movementReference: movement.reference,
          severity: "A_VERIFIER",
          date: movement.createdAt,
          impact: "Recu " + (line.completedQuantity ?? 0) + " / attendu " + (line.expectedQuantity ?? 0),
          action: "Completer le manquant ou regulariser l'ecart",
          status: "OUVERTE",
          expectedQuantity: line.expectedQuantity,
          completedQuantity: line.completedQuantity,
          gapQuantity: (line.completedQuantity ?? 0) - (line.expectedQuantity ?? 0),
          details: { observation: line.observation }
        }))
      );

    const staleLimit = new Date();
    staleLimit.setDate(staleLimit.getDate() - 3);
    const exitAlerts = movements
      .filter((movement) => movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" && movement.createdAt <= staleLimit)
      .map((movement) => ({
        id: "exit-stale-" + movement.id,
        domain: "EXIT",
        type: "Demande en attente",
        object: movement.reference,
        objectCode: movement.reference,
        locationId: movement.fromLocationId ?? movement.siteLocationId,
        location: movementLocation(movement)?.name ?? "Sortie stock",
        movementId: movement.id,
        movementReference: movement.reference,
        severity: "A_VERIFIER",
        date: movement.createdAt,
        impact: movement.lines.length + " article(s) demandes",
        action: "Preparer ou refuser la demande materiel",
        status: "OUVERTE"
      }));
    const proofAlerts = movements
      .filter((movement) => movement.type === "EXIT_REQUEST" && movement.status === "PREPARED" && !movement.proofFileKey && !movement.proofFileName)
      .map((movement) => ({
        id: "proof-" + movement.id,
        domain: "EXIT",
        type: "Preuve signee manquante",
        object: movement.reference,
        objectCode: movement.reference,
        locationId: movement.fromLocationId ?? movement.siteLocationId,
        location: movementLocation(movement)?.name ?? "Sortie stock",
        movementId: movement.id,
        movementReference: movement.reference,
        severity: "A_VERIFIER",
        date: movement.updatedAt,
        impact: "Demande preparee non cloturee",
        action: "Uploader la fiche signee",
        status: "OUVERTE"
      }));
    const returnAlerts = movements
      .filter((movement) => movement.type === "RETURN" && movement.status === "PREPARED")
      .map((movement) => ({
        id: "return-control-" + movement.id,
        domain: "RETURN",
        type: "Retour a controler",
        object: movement.reference,
        objectCode: movement.reference,
        locationId: movement.toLocationId,
        location: movementLocation(movement)?.name ?? "Retour stock",
        movementId: movement.id,
        movementReference: movement.reference,
        severity: "A_VERIFIER",
        date: movement.createdAt,
        impact: movement.lines.reduce((sum, line) => sum + (line.completedQuantity ?? 0), 0) + " article(s) retournes",
        action: "Verifier l'etat du materiel retourne",
        status: "OUVERTE"
      }));
    const orphanReturnAlerts = movements
      .filter((movement) => movement.type === "RETURN" && !movement.sourceRequestId)
      .map((movement) => ({
        id: "return-orphan-" + movement.id,
        domain: "DATA",
        type: "Retour sans sortie source",
        object: movement.reference,
        objectCode: movement.reference,
        locationId: movement.toLocationId,
        location: movementLocation(movement)?.name ?? "Retour stock",
        movementId: movement.id,
        movementReference: movement.reference,
        severity: "CRITIQUE",
        date: movement.createdAt,
        impact: "Rattachement sortie absent",
        action: "Rattacher le retour a sa sortie source",
        status: "OUVERTE"
      }));

    return [
      ...stockAlerts,
      ...inventoryAlerts,
      ...entryDisputes,
      ...exitAlerts,
      ...proofAlerts,
      ...returnAlerts,
      ...orphanReturnAlerts
    ];
  });

  app.get("/stock-movements", async () => {
    const movements = await prisma.stockMovement.findMany({
      include: {
        lines: { include: { article: true } },
        generatedExits: { include: { lines: { include: { article: true } } } },
        sourceRequest: { include: { lines: { include: { article: true } } } }
      },
      orderBy: { date: "desc" }
    });
    const supplierIds = movements.map((movement) => movement.supplierId).filter(Boolean) as string[];
    const clientIds = movements.map((movement) => movement.clientId).filter(Boolean) as string[];
    const teamServiceIds = movements.map((movement) => movement.teamServiceId).filter(Boolean) as string[];
    const projectIds = movements.map((movement) => movement.projectId).filter(Boolean) as string[];
    const locationIds = movements.flatMap((movement) => [movement.fromLocationId, movement.toLocationId, movement.siteLocationId]).filter(Boolean) as string[];
    const [suppliers, clients, teamServices, projects, locations] = await Promise.all([
      supplierIds.length ? prisma.supplier.findMany({ where: { id: { in: supplierIds } } }) : [],
      clientIds.length ? prisma.client.findMany({ where: { id: { in: clientIds } } }) : [],
      teamServiceIds.length ? prisma.teamService.findMany({ where: { id: { in: teamServiceIds } } }) : [],
      projectIds.length ? prisma.project.findMany({ where: { id: { in: projectIds } } }) : [],
      locationIds.length ? prisma.location.findMany({ where: { id: { in: locationIds } } }) : []
    ]);
    const suppliersById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
    const clientsById = new Map(clients.map((client) => [client.id, client]));
    const teamServicesById = new Map(teamServices.map((service) => [service.id, service]));
    const projectsById = new Map(projects.map((project) => [project.id, project]));
    const locationsById = new Map(locations.map((location) => [location.id, location]));
    return movements.map((movement) => ({
      ...movement,
      supplier: movement.supplierId ? suppliersById.get(movement.supplierId) ?? null : null,
      client: movement.clientId ? clientsById.get(movement.clientId) ?? null : null,
      project: movement.projectId ? projectsById.get(movement.projectId) ?? null : null,
      teamService: movement.teamServiceId ? teamServicesById.get(movement.teamServiceId) ?? null : null,
      siteLocation: movement.siteLocationId ? locationsById.get(movement.siteLocationId) ?? null : null,
      fromLocation: movement.fromLocationId ? locationsById.get(movement.fromLocationId) ?? null : null,
      toLocation: movement.toLocationId ? locationsById.get(movement.toLocationId) ?? null : null
    }));
  });

  return app;
}



