import 'dotenv/config';

import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.string().default('production'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
