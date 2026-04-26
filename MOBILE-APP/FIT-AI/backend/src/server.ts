import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`FIT-AI backend listening on port ${env.port}`);
});
