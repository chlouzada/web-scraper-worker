import fs from 'fs';

const toFile = (level: string, ...args: any) => {
  const message = args
    .map((a: any) => {
      if (typeof a === 'object') {
        return JSON.stringify(a);
      }
      return a;
    })
    .join(' ');
  const date = new Date().toISOString();
  const log = `${date}: [${level}] ${message}\n`;
  fs.appendFile('logs.txt', log, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

export const logger = {
  info: (...args: any) => {
    console.log(...args);
    toFile('INFO', ...args);
  },
};
