import cors from "@fastify/cors";
import Fastify from "fastify";
import { prisma } from "@stock-hub/database";
import { canCreateStockEntry } from "@stock-hub/domain";

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asBody(requestBody: unknown): Record<string, unknown> {
  return requestBody && typeof requestBody === "object" ? requestBody as Record<string, unknown> : {};
}

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

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
    const article = await prisma.article.create({
      data: {
        code: String(body.code ?? ""),
        designation: String(body.designation ?? ""),
        category: String(body.category ?? "DIVERS"),
        unit: String(body.unit ?? "U"),
        trackingMode: body.trackingMode === "INDIVIDUAL" ? "INDIVIDUAL" : "QUANTITY",
        minimumStock: toNumber(body.minimumStock) ?? 0,
        referencePrice: toNumber(body.referencePrice)
      }
    });
    return reply.code(201).send(article);
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
        contact: body.contact ? String(body.contact) : undefined,
        phone: body.phone ? String(body.phone) : undefined,
        email: body.email ? String(body.email) : undefined
      }
    });
    return reply.code(201).send(supplier);
  });

  app.get("/projects", async () => {
    return prisma.project.findMany({ orderBy: { code: "asc" } });
  });

  app.post("/projects", async (request, reply) => {
    const body = asBody(request.body);
    const project = await prisma.project.create({
      data: {
        code: String(body.code ?? ""),
        name: String(body.name ?? ""),
        client: body.client ? String(body.client) : undefined,
        site: body.site ? String(body.site) : undefined
      }
    });
    return reply.code(201).send(project);
  });


  app.get("/users", async () => {
    return prisma.user.findMany({ orderBy: [{ active: "desc" }, { firstName: "asc" }] });
  });

  app.post("/users", async (request, reply) => {
    const body = asBody(request.body);
    const roles = Array.isArray(body.roles) ? body.roles.map(String) : ["GESTIONNAIRE_STOCK"];
    const user = await prisma.user.create({
      data: {
        email: String(body.email ?? ""),
        firstName: String(body.firstName ?? ""),
        lastName: String(body.lastName ?? ""),
        roles: roles as any,
        active: body.active === false ? false : true
      }
    });
    return reply.code(201).send(user);
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
        type: String(body.type ?? "MAGASIN")
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

  app.get("/stock-movements", async () => {
    return prisma.stockMovement.findMany({
      include: { lines: { include: { article: true } } },
      orderBy: { date: "desc" }
    });
  });

  return app;
}