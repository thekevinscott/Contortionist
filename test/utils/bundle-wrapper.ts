import { BundleOptions, BundlerName, bundle as _bundle, } from 'testeroni';
import path from 'path';
import * as url from 'url';
import util from 'util';
import { spawn, exec as _exec } from 'child_process';
const exec = util.promisify(_exec);

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTORT_DIR = path.resolve(ROOT, 'packages/contort');

export async function bundle(bundlerName: string, outDir: string, args: Parameters<typeof _bundle>[2] = {}) {
  // spawn('pnpm build', { 
  //   stdio: 'inherit',
  //  });

  // const { stdout, stderr } = await exec('pnpm build', {
  //   cwd: CONTORT_DIR,
  // });
  // console.log('stdout', stdout);

  // Build Contortionist
  await exec('pnpm build', {
    cwd: CONTORT_DIR,
  });

  // bundle the app
  if (bundlerName !== 'umd') {
    // args.isPackageInstallSilent = true;
  }
  await _bundle(bundlerName, outDir, args);
}