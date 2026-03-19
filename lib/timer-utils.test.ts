import { describe, expect, it } from "vitest";

import { formatTimerValue, isTimestampToday } from "./timer-utils";

describe("timer-utils", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatTimerValue(1500)).toBe("25:00");
    expect(formatTimerValue(61)).toBe("01:01");
    expect(formatTimerValue(0)).toBe("00:00");
  });

  it("detects timestamps from today", () => {
    expect(isTimestampToday(Date.now())).toBe(true);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isTimestampToday(yesterday.getTime())).toBe(false);
  });

  it("handles start and end of current day boundaries", () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    const nextDay = endOfDay + 1;

    expect(isTimestampToday(startOfDay)).toBe(true);
    expect(isTimestampToday(endOfDay)).toBe(true);
    expect(isTimestampToday(nextDay)).toBe(false);
  });

});
