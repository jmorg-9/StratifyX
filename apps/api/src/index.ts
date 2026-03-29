import { env } from "./env.js";
import { createServer } from "./server.js";

async function main() {
  const app = await createServer();

  try {
    await app.listen({
      port: env.port,
      host: "0.0.0.0"
    });
    console.log(`StratifyX API listening on http://localhost:${env.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
