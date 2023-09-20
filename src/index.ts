import cron from 'node-cron';
import { browser } from './helpers/puppeteer';
import { Scraper } from './helpers/supabase';

type Schedule = 15 | 30 | 60 | 180 | 720 | 1440;

const getScrapers = async (schedule: Schedule): Promise<Scraper[]> => {
  return [];
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

const run = async (schedule: Schedule) => {
  const executionId = [schedule, new Date().toISOString()];
  console.log('Running', ...executionId);

  const [scrapers, page] = await Promise.all([
    getScrapers(schedule),
    browser.page(),
  ]);

  for (const scraper of scrapers) {
    const { url, selectors } = scraper;
    console.log(url, selectors);

    await page.goto(url, { waitUntil: 'networkidle2' });

    const values = [];
    for (const item of selectors) {
      console.log('selector', item.selector);

      const value = await page.$eval(
        item.selector,
        (el: any) => el.textContent
      );
      values.push(String(value));

      if (!value) {
        console.log('not value', value);
      } else {
        console.log('value', value);
      }
    }

    await createResultForScraper({
      values,
      selectors,
    });
  }

  await browser.close(page);

  console.log('Done', ...executionId);
};

export const init = () => {
  console.log('Worker initialized');
  cron.schedule('*/15 * * * *', () => run(15));
  cron.schedule('*/30 * * * *', () => run(30));
  cron.schedule('0 * * * *', () => run(60));
  cron.schedule('0 */3 * * *', () => run(180));
  cron.schedule('0 */6 * * *', () => run(720));
  cron.schedule('0 */12 * * *', () => run(1440));
};


// init();
run(15);