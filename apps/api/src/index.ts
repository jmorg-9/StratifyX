import { createServer } from "./server.js";

async function main() {
  const app = await createServer();
  const port = Number(process.env.PORT ?? 3001);

  try {
    await app.listen({
      port,
      host: "0.0.0.0"
    });
    console.log(`StratifyX API listening on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
