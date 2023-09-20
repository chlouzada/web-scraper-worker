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
exports.init = void 0;
require("dotenv/config");
const node_cron_1 = __importDefault(require("node-cron"));
const puppeteer_1 = require("./helpers/puppeteer");
const getScrapers = (schedule) => __awaiter(void 0, void 0, void 0, function* () {
    const result = [];
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
const run = (schedule) => __awaiter(void 0, void 0, void 0, function* () {
    const executionId = [schedule, new Date().toISOString()];
    console.log('Running', ...executionId);
    const [scrapers, page] = yield Promise.all([
        getScrapers(schedule),
        puppeteer_1.browser.page(),
    ]);
    for (const scraper of scrapers) {
        const { url, selectors } = scraper;
        console.log(url, selectors);
        yield page.goto(url, { waitUntil: 'networkidle2' });
        const values = [];
        for (const item of selectors) {
            console.log('selector', item.selector);
            const elements = yield page.$$(item.selector);
            const inside = yield Promise.all(elements.map((el) => __awaiter(void 0, void 0, void 0, function* () {
                const content = yield el.getProperty('textContent'); // TODO: 'innerHTML'
                return content.jsonValue();
            })));
            if (inside.length === 0) {
                console.log('no value');
            }
            values.push(inside);
        }
        yield createResultForScraper({
            values,
            selectors,
        });
    }
    yield puppeteer_1.browser.close(page);
    console.log('Done', ...executionId);
});
const init = () => {
    console.log('Worker initialized');
    node_cron_1.default.schedule('*/15 * * * *', () => run(15));
    node_cron_1.default.schedule('*/30 * * * *', () => run(30));
    node_cron_1.default.schedule('0 * * * *', () => run(60));
    node_cron_1.default.schedule('0 */3 * * *', () => run(180));
    node_cron_1.default.schedule('0 */6 * * *', () => run(720));
    node_cron_1.default.schedule('0 */12 * * *', () => run(1440));
};
exports.init = init;
(0, exports.init)();
// run(15);
