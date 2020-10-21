"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalData = void 0;
let MINUTES_MS = 60 * 1000;
let HOUR_MS = 60 * MINUTES_MS;
let DAY_MS = 24 * HOUR_MS;
let WEEK_MS = 7 * DAY_MS;
function getMinuteData(minuteCount, targetInterval, basedOnInterval, threshold) {
    return {
        sampleIntervalMs: minuteCount * MINUTES_MS,
        interpolationThreshold: threshold,
        targetInterval, basedOnInterval,
        isOnSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            return minutes % minuteCount === 0;
        },
        getPreviousSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            return timestamp - MINUTES_MS * (minutes % minuteCount);
        }
    };
}
function getHourData(hourCount, targetInterval, basedOnInterval, threshold) {
    return {
        sampleIntervalMs: hourCount * HOUR_MS,
        interpolationThreshold: threshold,
        targetInterval, basedOnInterval,
        isOnSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            let hours = new Date(timestamp).getHours();
            return minutes === 0 && hours % hourCount === 0;
        },
        getPreviousSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            let hours = new Date(timestamp).getHours();
            return timestamp - MINUTES_MS * (minutes) - HOUR_MS * (hours % hourCount);
        }
    };
}
function getDayData(targetInterval, basedOnInterval, threshold) {
    return {
        sampleIntervalMs: DAY_MS,
        interpolationThreshold: threshold,
        targetInterval, basedOnInterval,
        isOnSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            let hours = new Date(timestamp).getHours();
            return minutes === 0 && hours === 0;
        },
        getPreviousSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            let hours = new Date(timestamp).getHours();
            return timestamp - MINUTES_MS * (minutes) - HOUR_MS * (hours);
        }
    };
}
function getWeekData(targetInterval, basedOnInterval, threshold) {
    return {
        sampleIntervalMs: WEEK_MS,
        interpolationThreshold: threshold,
        targetInterval, basedOnInterval,
        isOnSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            let hours = new Date(timestamp).getHours();
            let day = new Date(timestamp).getDay(); // 0 = sunday
            return minutes === 0 && hours === 0 && day === 1; // 00:00 on Monday morning
        },
        getPreviousSamplePoint: function (timestamp) {
            let minutes = new Date(timestamp).getMinutes();
            let hours = new Date(timestamp).getHours();
            let day = new Date(timestamp).getDay(); // 0 = sunday
            let mondayOffset = (day + 6) % 7; // this maps sunday = 6, monday 0, tuesday 1, ...
            return timestamp - MINUTES_MS * (minutes) - HOUR_MS * (hours) - DAY_MS * (mondayOffset);
        }
    };
}
exports.IntervalData = {
    '5m': getMinuteData(5, '5m', '1m', 4),
    '10m': getMinuteData(10, '10m', '5m', 4),
    '15m': getMinuteData(15, '15m', '5m', 4),
    '30m': getMinuteData(30, '30m', '15m', 4),
    '1h': getMinuteData(60, '1h', '30m', 4),
    '3h': getHourData(3, '3h', '1h', 4),
    '6h': getHourData(6, '6h', '3h', 4),
    '12h': getHourData(12, '12h', '6h', 4),
    '1d': getDayData('1d', '12h', 4),
    '1w': getWeekData('1w', '1d', 4),
};
//# sourceMappingURL=IntervalData.js.map