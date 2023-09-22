import './env'
import cron from 'node-cron';
import { browser } from './helpers/puppeteer';
import { Scraper } from './types';
import { sql } from './helpers/db';
import { logger } from './helpers/logger';

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
  logger.info('create-results', JSON.stringify({selectors, values}));
  // const results = values.map((value: any, index: any) => ({
  //   selectorId: selectors[index]._id,
  //   value,
  //   createdAt: new Date(),
  // }));
  // await ResultCollection.insertMany(results);
};

const run = async (schedule: Schedule) => {
  const executionId = [schedule, new Date().toISOString()];
  logger.info('Running', ...executionId);

  const [scrapers, page] = await Promise.all([
    getScrapers(schedule),
    browser.page(),
  ]);

  for (const scraper of scrapers) {
    const { url, selectors } = scraper;
    // logger.info(url, selectors);

    console.time('goto')
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.timeEnd('goto')

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
  }

  await browser.close(page);

  logger.info('Done', ...executionId);
};

export const init = () => {
  logger.info('Worker initialized');
  cron.schedule('*/15 * * * *', () => run(15));
  cron.schedule('*/30 * * * *', () => run(30));
  cron.schedule('0 * * * *', () => run(60));
  cron.schedule('0 */3 * * *', () => run(180));
  cron.schedule('0 */6 * * *', () => run(720));
  cron.schedule('0 */12 * * *', () => run(1440));
};





const main = async () => {
  init();
}

main()

