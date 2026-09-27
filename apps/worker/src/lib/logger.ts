import pino from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.isDev ? 'debug' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'headers.authorization',
      'authorization',
      'apiKey',
      'key',
      'cookie',
      'set-cookie',
      '*.token',
      '*.password',
    ],
    remove: true,
  },
  transport: config.isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:HH:MM:ss',
        },
      }
    : undefined,
});
