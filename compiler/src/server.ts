import app from "./app";
import { env } from "./lib/env";

app.listen(env.PORT, () => {
  console.log(`Compiler service listening on port ${env.PORT}`);
});
