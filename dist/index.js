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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSchedules = void 0;
require("./env");
const node_cron_1 = __importDefault(require("node-cron"));
const puppeteer_1 = require("./helpers/puppeteer");
const db_1 = require("./helpers/db");
const getScrapers = (schedule) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, db_1.sql) `
  SELECT * FROM scrapers
  WHERE schedule = ${schedule}
  `;
    return result;
});
const createResultForScraper = ({ selectors, values, }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('createResults', selectors, values);
    // const results = values.map((value: any, index: any) => ({
    //   selectorId: selectors[index]._id,
    //   value,
    //   createdAt: new Date(),
    // }));
    // await ResultCollection.insertMany(results);
    console.log('done creating results');
});
const scrapeUrl = ({ page, url, selectors, }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(url, selectors);
    yield page.goto(url, { waitUntil: 'networkidle2' });
    const values = [];
    for (const item of selectors) {
        const elements = yield page.$$(item.selector);
        const inside = yield Promise.all(elements.map((el) => __awaiter(void 0, void 0, void 0, function* () {
            const content = yield el.getProperty('textContent'); // TODO: 'innerHTML'
            return content.jsonValue();
        })));
        values.push(inside);
    }
    yield createResultForScraper({
        values,
        selectors,
    });
    yield puppeteer_1.browser.close(page);
});
const BATCH_SIZE = 3;
const run = (schedule) => __awaiter(void 0, void 0, void 0, function* () {
    const executionId = [schedule, new Date().toISOString()];
    console.time(`run ${schedule}`);
    console.log('Running', ...executionId);
    const scrapers = yield getScrapers(schedule);
    const batches = (() => {
        const result = [];
        for (let i = 0; i < scrapers.length; i += BATCH_SIZE) {
            result.push(scrapers.slice(i, i + BATCH_SIZE));
        }
        return result;
    })();
    for (const batch of batches) {
        const pages = yield Promise.all(batch.map(() => puppeteer_1.browser.page()));
        yield Promise.all(batch.map((scraper) => __awaiter(void 0, void 0, void 0, function* () {
            return scrapeUrl({
                page: pages.pop(),
                url: scraper.url,
                selectors: scraper.selectors,
            });
        })));
    }
    console.log('Done', ...executionId);
    console.timeEnd(`run ${schedule}`);
});
const setupSchedules = () => {
    console.log('Worker initialized');
    node_cron_1.default.schedule('*/15 * * * *', () => run(15));
    node_cron_1.default.schedule('*/30 * * * *', () => run(30));
    node_cron_1.default.schedule('0 * * * *', () => run(60));
    node_cron_1.default.schedule('0 */3 * * *', () => run(180));
    node_cron_1.default.schedule('0 */6 * * *', () => run(720));
    node_cron_1.default.schedule('0 */12 * * *', () => run(1440));
};
exports.setupSchedules = setupSchedules;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, exports.setupSchedules)();
    const blank_page = yield puppeteer_1.browser.page();
    yield run(15);
    yield puppeteer_1.browser.close(blank_page);
});
main();
