declare module 'getmac';

declare module 'vscode';

declare module 'fs-extra';

declare module 'pino';

declare namespace RecoreReporter {
  type UUID = string;

  type Timestamp = string;

  interface ILogFn {
    (msg: string, ...args: any[]): void;
    (obj: object, msg?: string, ...args: any[]): void;
  }

  interface ILog {
    debug: ILogFn;
    info: ILogFn;
    error: ILogFn;
  }

  interface IRecord {
    runAt: Timestamp;
    command: string;
  }
}