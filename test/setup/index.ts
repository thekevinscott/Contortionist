import { setLogLevel, } from 'testeroni';
import path from 'path';
import * as url from 'url';
import './matchers/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const TMP_DIR = path.resolve(__dirname, '../../tmp/integration-tests');
// setLogLevel('error');
