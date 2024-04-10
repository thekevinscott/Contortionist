import { Server } from "http";
import express, {
  Express,
  // Server,
} from 'express';

export default class MockLLMAPI {
  app: Express = express();
  server: Server;
  port: number;

  constructor() {
    this.app.use(express.json());
    const server = this.app.listen();
    this.server = server;
    const address = server.address();
    if (isString(address)) {
      throw new Error('Server address is a string');
    }
    this.port = address.port;
    process.on('exit', () => server.close());
  }

  stop = () => new Promise<void>((resolve, reject) => {
    this.server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const isString = (value: unknown): value is string => value instanceof String || typeof value === 'string';
