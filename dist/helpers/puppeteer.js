"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.browser = void 0;
const puppeteer = require('puppeteer-core');
const config = {
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
};
exports.browser = new (class Browser {
    constructor() {
        this.browser = null;
        this.pages = 0;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                this.browser = yield puppeteer.launch(config);
            }
            return this.browser;
        });
    }
    page() {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield this.get();
            this.pages++;
            const p = yield b.newPage();
            yield p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
            return p;
        });
    }
    close(page) {
        var _a;
        this.pages--;
        if (this.pages > 0) {
            return page.close();
        }
        return (_a = this.browser) === null || _a === void 0 ? void 0 : _a.close();
    }
})();
