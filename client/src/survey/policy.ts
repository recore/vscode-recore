/**
 * 访问调查策略
 * 每周五 10:00 - 18:00 之间，不在区间不提醒
 * 当天仅提醒一次
 * start
 *   read the timestamp file
 *     exist
 *       check in the period Fri. 10:00 - 18:00
 *         in => setTimeout until next Fri. 10:00 <return>
 *         not => goto [not exit]
 *     not exist
 *       check current time in the period Fri. 10:00 - 18:00
 *         in => run the job and record <return>
 *         not => setTimeout until next Fri. 10:00 <return>
 */
import { readFile, writeFile } from 'fs';
import { homedir } from 'os';
import { join } from "path";
import dayjs = require('dayjs');
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const timestampFile = join(homedir(), '.nowa/recore/survey-timestamp.txt');

function writeTimestamp(): void {
    writeFile(timestampFile, Date.now());
}

function readTimestamp(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        readFile(timestampFile, { encoding: 'utf8' }, (err, data: string) => {
            if (err) {
                if (err.code === "ENOENT") {
                    resolve(null);
                } else {
                    reject(err);
                }
            } else {
                resolve(+data);
            }
        });
    });
}

function checkInPeriod(timestamp: number): boolean {
    const time = dayjs(timestamp);
    const day = time.day();

    if (day === 5) {
        return dayjs().set('hour', 10).set('minute', 0).set('second', 0) <= time
            && time <= dayjs().set('hour', 18).set('minute', 0).set('second', 0);
    }
    return false;
}

function calculatePeriod(): number {
    let nextTime;
    const currentTime = dayjs();
    const day = currentTime.day();

    // 周五
    if (day < 5) {
        nextTime = currentTime.add(5 - day, 'day');
    } else if (day >= 5) {
        nextTime = currentTime.add(7, 'day');
    }
    nextTime = nextTime.set('hour', 10).set('minute', 0).set('second', 0);
    return (nextTime as any) - (dayjs() as any);
}

export default async function surveyPolicy(job: Function) {
    const timestamp = await readTimestamp();
    const currentTimestamp = Date.now();

    // 安排下一任务
    function scheduleTask() {
        const timeout = calculatePeriod();
        setTimeout(() => job(), timeout);
    }

    function doTask() {
        // 写入时间戳
        writeTimestamp();
        // 执行 job
        job();
        // 安排下一任务
        scheduleTask();
    }

    if (timestamp) {
        // 如果时间存在
        // 说明之前有过访谈
        // 校验是不是在访问范围内
        if (checkInPeriod(timestamp)) {
            // 如果在，说明当天已经访谈过，计算下一周期
            scheduleTask();
            return;
        }
    }

    // 如果时间不存在，说明是首次启动
    // 校验现在是否在访谈时间
    if (checkInPeriod(currentTimestamp)) {
        // 符合，则执行
        doTask();
        return;
    } else {
        // 不符合，计算下一任务
        scheduleTask();
        return;
    }
}
