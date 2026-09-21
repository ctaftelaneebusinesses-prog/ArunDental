import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Dr. Arun Dental Care API listening on port ${env.port} (${env.nodeEnv})`);
});
