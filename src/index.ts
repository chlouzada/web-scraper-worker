import './env';
import cron from 'node-cron';
import { browser } from './helpers/puppeteer';
import { Scraper } from './types';
import { sql } from './helpers/db';

// FIXME: two browser opening

type Schedule = 15 | 30 | 60 | 180 | 720 | 1440;

const getScrapers = async (schedule: Schedule): Promise<Scraper[]> => {
  const result: Scraper[] = await sql`
  SELECT * FROM scrapers
  WHERE schedule = ${schedule}
  `;
  return result;
};

const createResultForScraper = async ({
  selectors,
  values,
}: {
  values: any[];
  selectors: Scraper['selectors'];
}) => {
  console.log('createResults', selectors, values);
  // const results = values.map((value: any, index: any) => ({
  //   selectorId: selectors[index]._id,
  //   value,
  //   createdAt: new Date(),
  // }));
  // await ResultCollection.insertMany(results);
  console.log('done creating results');
};

const scrapeUrl = async ({
  page,
  url,
  selectors,
}: {
  page: Awaited<ReturnType<typeof browser.page>>;
  url: string;
  selectors: Scraper['selectors'];
}) => {
  console.log(url, selectors);

  await page.goto(url, { waitUntil: 'networkidle2' });

  const values = [];
  for (const item of selectors) {
    const elements = await page.$$(item.selector);
    const inside = await Promise.all(
      elements.map(async (el) => {
        const content = await el.getProperty('textContent'); // TODO: 'innerHTML'
        return content.jsonValue();
      })
    );
    values.push(inside);
  }

  await createResultForScraper({
    values,
    selectors,
  });

  await browser.close(page);
};

const BATCH_SIZE = 3;

const run = async (schedule: Schedule) => {
  const executionId = [schedule, new Date().toISOString()];
  console.time(`run ${schedule}`);
  console.log('Running', ...executionId);

  const scrapers = await getScrapers(schedule);

  const batches = (() => {
    const result: Scraper[][] = [];
    for (let i = 0; i < scrapers.length; i += BATCH_SIZE) {
      result.push(scrapers.slice(i, i + BATCH_SIZE));
    }
    return result;
  })();

  for (const batch of batches) {
    const pages = await Promise.all(batch.map(() => browser.page()));
    await Promise.all(
      batch.map(async (scraper) => {
        return scrapeUrl({
          page: pages.pop()!,
          url: scraper.url,
          selectors: scraper.selectors,
        });
      })
    );
  }

  console.log('Done', ...executionId);
  console.timeEnd(`run ${schedule}`);
};

export const setupSchedules = () => {
  console.log('Worker initialized');
  cron.schedule('*/15 * * * *', () => run(15));
  cron.schedule('*/30 * * * *', () => run(30));
  cron.schedule('0 * * * *', () => run(60));
  cron.schedule('0 */3 * * *', () => run(180));
  cron.schedule('0 */6 * * *', () => run(720));
  cron.schedule('0 */12 * * *', () => run(1440));
};

const main = async () => {
  setupSchedules();

  const blank_page = await browser.page();

  await run(15);

  await browser.close(blank_page);
};

main();
