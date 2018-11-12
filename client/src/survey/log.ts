import { readFile, writeFile } from "fs-extra";

export default class Log {
  private file: string;
  private logger?: RecoreReporter.ILog;
  private separator: string = "\n";

  constructor(file: string, options?: { logger?: RecoreReporter.ILog }) {
    this.logger = options.logger;
    this.file = file;
    this.logger.info("Operation File: ", file);
  }

  public async writeOne(command: string) {
    const record = `${Date.now()} ${command}${this.separator}`;
    return writeFile(this.file, record, { flag: "a+" });
  }

  public async load(): Promise<RecoreReporter.IRecord[]> {
    const records: string = await readFile(this.file, { encoding: "utf8" });
    return records
      .trim()
      .split(this.separator)
      .map(record => {
        const [runAt, command] = record.split(" ");
        return {
          command,
          runAt
        };
      });
  }
}
