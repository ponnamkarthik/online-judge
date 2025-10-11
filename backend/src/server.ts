import http from 'http';

import app from './app';
import { env } from './lib/env';
import { connectDB } from './lib/db';

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});
