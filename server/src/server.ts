import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { app } from './app.js';

await connectDb();

app.listen(env.PORT, () => {
  console.log(`BISILE secure API listening on ${env.PORT}`);
});
