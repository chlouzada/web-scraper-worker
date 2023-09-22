"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const toFile = (level, ...args) => {
    const message = args
        .map((a) => {
        if (typeof a === 'object') {
            return JSON.stringify(a);
        }
        return a;
    })
        .join(' ');
    const date = new Date().toISOString();
    const log = `${date}: [${level}] ${message}\n`;
    fs_1.default.appendFile('logs.txt', log, (err) => {
        if (err) {
            console.error(err);
        }
    });
};
exports.logger = {
    info: (...args) => {
        console.log(...args);
        toFile('INFO', ...args);
    },
};
