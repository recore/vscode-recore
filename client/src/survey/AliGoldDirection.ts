import * as Agent from "agentkeepalive";
import axios from "axios";

const httpAgent = new Agent({
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
  maxFreeSockets: 10,
  maxSockets: 100,
  timeout: 60000 // active socket keepalive for 60 seconds
});

export class AliGoldDirection {
  private baseURL: string;
  private biz: string;
  private stage: string;
  private uuid: RecoreReporter.UUID;

  constructor(
    uuid: RecoreReporter.UUID,
    stage: string,
  ) {
    this.uuid = uuid;
    this.baseURL = "http://gm.mmstat.com";
    this.biz = "recore";
    this.stage = stage;
  }

  public async sendRecord(record: RecoreReporter.IRecord) {
    const url = this.createURL(record.command);
    return axios.get(url, {
      httpAgent,
      params: {
        cna: this.uuid,
        runAt: record.runAt
      }
    });
  }

  private createURL(command: string): string {
    return `${this.baseURL}/${this.biz}.${this.stage}.${command}`;
  }
}
