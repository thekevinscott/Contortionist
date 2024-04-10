import { bundle as _bundle, } from 'testeroni';
import path from 'path';
import * as url from 'url';
import util from 'util';
import { exec as _exec } from 'child_process';
const exec = util.promisify(_exec);

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTORT_DIR = path.resolve(ROOT, 'packages/contort');

export const buildContortionist = () => {
  if (process.env.CI) {
    return exec('pnpm build', {
      cwd: CONTORT_DIR,
    });
  }
};

