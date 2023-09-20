const puppeteer = require('puppeteer-core');
import { env } from '../env';
import { TBrowser, TConfig } from '../types';

const config: TConfig =
  env.NODE_ENV === 'production'
    ? {
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
      }
    : {
        headless: false,
        args: ['--no-sandbox', '--disable-gpu'],
        executablePath:
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      };

export const browser = new (class Browser {
  browser: TBrowser | null = null;
  pages = 0;

  private async get() {
    if (!this.browser) {
      this.browser = await puppeteer.launch(config);
    }
    return this.browser;
  }

  async page() {
    const b = await this.get();
    this.pages++;
    const p = await b!.newPage();
    await p.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    );
    return p;
  }

  close(page: Awaited<ReturnType<TBrowser['pages']>>[number]) {
    this.pages--;
    if (this.pages > 0) {
      return page.close();
    }
    this.browser?.close();
    this.browser = null;
    return;
  }
})();
