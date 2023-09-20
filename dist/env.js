"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const schema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string(),
    NODE_ENV: zod_1.z.string().default('production'),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error(parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
