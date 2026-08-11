import { buildApp } from "./app.js";

const host = process.env.API_HOST ?? process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3200);
const app = buildApp();

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}