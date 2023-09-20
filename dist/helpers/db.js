"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
const postgres_1 = __importDefault(require("postgres"));
const connectionString = process.env.DATABASE_URL;
const sql = (0, postgres_1.default)(connectionString);
exports.sql = sql;
