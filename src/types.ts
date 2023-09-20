import puppeteer from "puppeteer";

export type TBrowser = Awaited<ReturnType<typeof puppeteer.launch>>
export  type TConfig = Parameters<typeof puppeteer.launch>[0]

export type Scraper = {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  url: string;
  schedule: number;
  selectors: {
    name: string;
    selector: string;
  }[];
};
