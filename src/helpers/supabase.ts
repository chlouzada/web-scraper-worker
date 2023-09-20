
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
