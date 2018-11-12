import * as crypto from "crypto";
import { getMac } from "getmac";

export default async function createUUID(): Promise<string> {
    const uuid: string = await generate();
    return uuid;
}

function generate(): Promise<string> {
  return new Promise((resolve, reject) => {
    getMac((err: Error, macAddress: string) => {
      if (err) {
        reject(err);
        return;
      }
      const hash = crypto.createHash("sha1");
      hash.update(macAddress);
      resolve(hash.digest("hex"));
    });
  });
}
