import { scryptSync, timingSafeEqual } from "node:crypto";
import cors from "@fastify/cors";
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

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
    const article = await prisma.article.create({
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
        stockLevels: initialStock > 0 && initialLocationId ? {
          create: {
            locationId: initialLocationId,
            quantity: initialStock
          }
        } : undefined
      }
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
    const client = await prisma.client.create({
      data: {
        code: String(body.code ?? ""),
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
    const service = await prisma.teamService.create({
      data: {
        code: String(body.code ?? ""),
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
    const employee = await prisma.employee.create({
      data: {
        matricule: String(body.matricule ?? ""),
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
    const supplier = await prisma.supplier.create({
      data: {
        code: String(body.code ?? ""),
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
    const project = await prisma.project.create({
      data: {
        code: String(body.code ?? ""),
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
    const location = await prisma.location.create({
      data: {
        code: String(body.code ?? ""),
        name: String(body.name ?? ""),
        type: String(body.type ?? "MAGASIN"),
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
    const equipment = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        serialNumber: asString(body.serialNumber) ?? before.serialNumber,
        supplierId: body.supplierId === null ? null : asString(body.supplierId) ?? before.supplierId,
        state: asString(body.state) ?? before.state,
        status: asString(body.status) ?? before.status,
        assignedTo: asString(body.assignedTo) ?? before.assignedTo,
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


  app.get("/vehicles", async () => {
    return prisma.vehicle.findMany({ orderBy: { code: "asc" } });
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
    await prisma.auditLog.create({
      data: {
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
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_VEHICLE",
        entity: "Vehicle",
        entityId: vehicle.id,
        before: before as any,
        after: vehicle as any
      }
    });
    return vehicle;
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
          notes: asString(body.notes),
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

  app.post("/stock-movements/exit-requests/:id/proof", async (request, reply) => {
    const params = request.params as { id: string };
    const body = asBody(request.body);
    const fileName = asString(body.fileName);
    if (!fileName) {
      return reply.code(400).send({ message: "Ajoute le nom de la fiche signee." });
    }

    const existing = await prisma.stockMovement.findUnique({ where: { id: params.id } });
    if (!existing || existing.type !== "EXIT_REQUEST") {
      return reply.code(404).send({ message: "Demande materiel introuvable." });
    }
    if (existing.status === "SUBMITTED") {
      return reply.code(400).send({ message: "La demande doit etre preparee avant de joindre la fiche signee." });
    }

    const updated = await prisma.stockMovement.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        proofFileName: fileName,
        proofUploadedAt: new Date(),
        proofUploadedBy: asString(body.uploadedBy)
      },
      include: {
        lines: { include: { article: true } },
        generatedExits: { include: { lines: { include: { article: true } } } }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "UPLOAD_EXIT_REQUEST_PROOF",
        entity: "StockMovement",
        entityId: updated.id,
        after: updated as any
      }
    });

    return reply.send(updated);
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
    if (!toLocationId) {
      return reply.code(400).send({ message: "Un emplacement retour est requis." });
    }
    if (!lines.length) {
      return reply.code(400).send({ message: "Au moins une ligne de retour est requise." });
    }

    const reintegrate = body.reintegrate !== false;
    const movement = await prisma.$transaction(async (tx) => {
      const created = await tx.stockMovement.create({
        data: {
          reference: String(body.reference ?? "RET-" + Date.now()),
          type: "RETURN",
          status: reintegrate ? "COMPLETED" : "PREPARED",
          date: parseDate(body.date),
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

      if (reintegrate) {
        for (const line of created.lines) {
          await tx.stockLevel.upsert({
            where: { articleId_locationId: { articleId: line.articleId, locationId: toLocationId } },
            update: { quantity: { increment: line.completedQuantity ?? 0 } },
            create: { articleId: line.articleId, locationId: toLocationId, quantity: line.completedQuantity ?? 0 }
          });
        }
      }

      await tx.auditLog.create({
        data: { action: "CREATE_STOCK_RETURN", entity: "StockMovement", entityId: created.id, after: created as any }
      });
      return created;
    });

    return reply.code(201).send(movement);
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
        data: { action: "CREATE_STOCK_TRANSFER", entity: "StockMovement", entityId: created.id, after: created as any }
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
            create: lines.map((line) => ({
              articleId: String(line.articleId ?? ""),
              expectedQuantity: toNumber(line.expectedQuantity),
              completedQuantity: toNumber(line.completedQuantity) ?? 0,
              observation: asString(line.observation)
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
        data: { action: "CREATE_INVENTORY_ADJUSTMENT", entity: "StockMovement", entityId: created.id, after: created as any }
      });
      return created;
    });

    return reply.code(201).send(movement);
  });

  app.get("/audit-logs", async () => {
    return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  });

  app.get("/alerts", async () => {
    const [levels, adjustments] = await Promise.all([
      prisma.stockLevel.findMany({
        where: { OR: [{ quantity: { lte: 0 } }, { quantity: { lte: 999999999 } }] },
        include: { article: true, location: true },
        orderBy: [{ location: { code: "asc" } }, { article: { code: "asc" } }]
      }),
      prisma.stockMovement.findMany({
        where: { type: "ADJUSTMENT" },
        include: { lines: { include: { article: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ]);

    const stockAlerts = levels
      .filter((level) => level.quantity <= level.article.minimumStock)
      .map((level) => ({
        id: "stock-" + level.id,
        type: level.quantity <= 0 ? "Rupture" : "Stock bas",
        object: level.article.designation,
        location: level.location.name,
        severity: level.quantity <= 0 ? "CRITIQUE" : "A_VERIFIER",
        date: level.updatedAt,
        action: level.quantity <= 0 ? "Reapprovisionner avant nouvelle sortie" : "Verifier le seuil et preparer reapprovisionnement",
        status: "OUVERTE"
      }));

    const inventoryAlerts = adjustments.flatMap((movement) => movement.lines
      .filter((line) => (line.expectedQuantity ?? 0) !== (line.completedQuantity ?? 0))
      .map((line) => ({
        id: "inventory-" + line.id,
        type: "Ecart inventaire",
        object: line.article.designation,
        location: movement.fromLocationId ?? "Emplacement inventorie",
        severity: "A_VERIFIER",
        date: movement.createdAt,
        action: "Controler et justifier ecart " + ((line.completedQuantity ?? 0) - (line.expectedQuantity ?? 0)),
        status: "OUVERTE"
      }))
    );

    return [...stockAlerts, ...inventoryAlerts];
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



