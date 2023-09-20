const puppeteer = require('puppeteer-core');

const config: any = {
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
};

export const browser = new (class Browser {
  browser: any | null;
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
    const p = b.newPage();
    await p.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    );
    return p;
  }

  close(page: any) {
    this.pages--;
    if (this.pages === 0) {
      console.log('closing browser');
      return this.browser.close();
    }
    return page.close();
  }
})();
