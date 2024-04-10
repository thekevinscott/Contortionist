/**
 * This tests the various environments Contortionist can exist in, including:
 * 
 * - Node.js
 * - Browser (UMD)
 * - Browser (ESM)
 * 
 * It also tests the various ways Contortionist can be bundled, including:
 * - Webpack
 * - ESBuild
 */

import { rimraf } from "rimraf";
import { chromium, } from 'playwright';
import { makeTmpDir, ClientsideTestRunner, ServersideTestRunner, SupportedDriver, setLogLevel, } from 'testeroni';
import path from 'path';
import * as url from 'url';
import { main as contortionistUMDFilePath } from '../../packages/contort/package.json' assert { type: "json" };
import { bundle } from "../utils/bundle-wrapper.js";
import {
  configureNonStreamingServer as _configureNonStreamingServer,
  configureStreamingServer as _configureStreamingServer,
} from "../utils/bootstrap-server-mock.js";
import MockLLMAPI from "../utils/mock-llm-api.js";
import { makeLlamaCPPResponse } from "../__mocks__/mock-llama-cpp-response.js";

setLogLevel('warn')

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TMP = path.resolve(ROOT, 'tmp');

const configureNonStreamingServer = (content: string) => _configureNonStreamingServer(content, makeLlamaCPPResponse);
const configureStreamingServer = (content: string, n: number) => _configureStreamingServer(content, n, makeLlamaCPPResponse);

describe('llama.cpp', async () => {
  let _mockLLMAPI: MockLLMAPI;

  afterEach(async () => {
    await Promise.all([
      _mockLLMAPI ? await _mockLLMAPI.stop() : undefined,
    ]);
  });

  describe('Node.js', async () => {
    let outDir = await makeTmpDir(TMP);
    const nodeRunner = new ServersideTestRunner({
      cwd: outDir,
      module: true,
    });

    beforeAll(async function beforeAll() {
      await nodeRunner.beforeAll(() => bundle('node', outDir, {
        dependencies: {
          'contort': 'workspace:*',
        }
      }));
    });

    afterAll(() => Promise.all([
      rimraf(outDir),
    ]));

    const runScript = async (script: string) => {
      const endpoint = `http://localhost:${_mockLLMAPI.port}/completion`;
      const wrappedScript = `
      import Contortionist from 'contort';
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: '${endpoint}',
        },
      });
      ${script}
    `;
      return nodeRunner.run(wrappedScript);
    };

    test('it should return a non-streaming response', async () => {
      const content = 'FOO BAR!';
      const { mockLLMAPI } = configureNonStreamingServer(content);
      _mockLLMAPI = mockLLMAPI;
      expect(await runScript(`
          const result = await contortionist.execute('prompt', {
            n: 10,
          });
          return result;
        `)).toEqual(content);
    });

    test('it should return a streaming response', async () => {
      const content = 'abc';
      const n = 3;
      const { mockLLMAPI } = configureStreamingServer(content, n);
      _mockLLMAPI = mockLLMAPI;
      expect(await runScript(`
          const result = await contortionist.execute('prompt', {
            n: ${n},
            stream: true,
          });
          return result;
        `)).toEqual(content);
    });

    test('it should callback with a streaming response', async () => {
      const n = 3;
      const content = 'abc';
      const { mockLLMAPI } = configureStreamingServer(content, n);
      _mockLLMAPI = mockLLMAPI;
      expect(await runScript(`
      let content = '';
          const result = await contortionist.execute('prompt', {
            n: ${n},
            callback: ({ partial, chunk }) => {
              content += partial;

            },
          });
          return content;
      `)).toEqual('aababc');
    });

    test('it should abort', async () => {
      const n = 3;
      const content = 'abc';
      const { mockLLMAPI } = configureStreamingServer(content, n);
      _mockLLMAPI = mockLLMAPI;
      expect(await runScript(`
      let result = '';
      let resolve;
      const promise = new Promise(r => {
        resolve = r;
      });
          contortionist.execute('prompt', {
            n: ${n},
            callback: ({ partial, chunk }) => {
              contortionist.abort();
            },
          }).then(() => {
            result = 'then';
            resolve();
          }).catch(() => {
            result = 'catch';
            resolve();
          });
          await promise;
          return result;
      `)).toEqual('catch');
    });
  });

  describe('Browser', () => {
    describe.each([
      ['umd', 'Contortionist', {
        files: [path.resolve(ROOT, './packages/contort', contortionistUMDFilePath)],
      }],
      ['esbuild', 'contort', {
        dependencies: {
          'contort': 'workspace:*',
        }
      }],
      ['webpack', 'contort', {
        dependencies: {
          'contort': 'workspace:*',
        }
      }],

    ])('%s', async (bundlerName, key, bundleOptions) => {
      let outDir = await makeTmpDir(TMP);

      const browserRunner = new ClientsideTestRunner({
        log: false,
        dist: outDir,
        driver: SupportedDriver.playwright,
        launch: chromium.launch.bind(chromium),
      });

      beforeAll(async function beforeAll() {
        await browserRunner.beforeAll(() => bundle(bundlerName, outDir, bundleOptions));
      });

      afterAll(() => Promise.all([
        rimraf(outDir),
        browserRunner.afterAll(),
      ]));

      beforeEach(async function beforeEach() {
        await browserRunner.beforeEach();
      });

      afterEach(async function afterEach() {
        await browserRunner.afterEach();
      });

      test('it should return a non-streaming response', async () => {

        const content = 'FOO BAR!';
        const n = 10;
        const { endpoint, mockLLMAPI } = configureNonStreamingServer(content);
        _mockLLMAPI = mockLLMAPI;
        const result = await browserRunner.page.evaluate(({ endpoint, n, key }) => {
          const contortionist = new window[key]({
            model: {
              protocol: 'llama.cpp',
              endpoint,
            },
          });
          return contortionist.execute('prompt', {
            n,
          });
        }, { endpoint, n, key, });

        expect(result).toEqual(content);
      });

      test('it should return a streaming response', async () => {


        const content = 'abc';
        const n = 3;
        const { endpoint, mockLLMAPI } = configureStreamingServer(content, n);
        _mockLLMAPI = mockLLMAPI;
        const result = await browserRunner.page.evaluate(({ endpoint, n, key }) => {
          const contortionist = new window[key]({
            model: {
              protocol: 'llama.cpp',
              endpoint,
            },
          });
          return contortionist.execute('prompt', {
            n,
            stream: true,
          });
        }, { endpoint, n, key, });
        expect(result).toEqual(content);
      });

      test('it should callback with a streaming response', async () => {
        const n = 3;
        const content = 'abc';
        const { endpoint, mockLLMAPI } = configureStreamingServer(content, n);
        _mockLLMAPI = mockLLMAPI;
        const result = await browserRunner.page.evaluate(async ({ endpoint, n, key }) => {
          const contortionist = new window[key]({
            model: {
              protocol: 'llama.cpp',
              endpoint,
            },
          });
          let content = '';
          await contortionist.execute('prompt', {
            n,
            stream: true,
            callback: ({ partial }) => {
              content += partial;
            },
          });
          return content;
        }, { endpoint, n, key, });
        expect(result).toEqual('aababc');
      });

      test('it should abort', async () => {


        const n = 3;
        const content = 'abc';
        const { endpoint, mockLLMAPI } = configureStreamingServer(content, n);
        _mockLLMAPI = mockLLMAPI;
        const result = await browserRunner.page.evaluate(async ({ endpoint, n, key }) => {
          const contortionist = new window[key]({
            model: {
              protocol: 'llama.cpp',
              endpoint,
            },
          });

          let result = '';
          let resolve;
          const promise = new Promise(r => {
            resolve = r;
          });
          contortionist.execute('prompt', {
            n,
            callback: ({ partial, chunk }) => {
              contortionist.abort();
            },
          }).then(() => {
            result = 'then';
            resolve();
          }).catch(() => {
            result = 'catch';
            resolve();
          });
          await promise;
          return result;
        }, { endpoint, n, key, });
        expect(result).toEqual('catch');
      });
    });
  });
});

