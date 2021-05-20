"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudUtil = void 0;
const tslib_1 = require("tslib");
const crypto = tslib_1.__importStar(require("crypto"));
const uuid = require('node-uuid');
exports.CloudUtil = {
    createKey: function () {
        return crypto.randomBytes(16).toString('hex');
    },
    createIBeaconUUID() {
        return uuid.v4();
    },
    createShortUID() {
        let rand = crypto.randomBytes(1);
        return rand.readUInt8(0);
    },
    createIBeaconMinor() {
        let rand = crypto.randomBytes(2);
        return rand.readUInt16LE(0);
    },
    createIBeaconMajor() {
        return exports.CloudUtil.createIBeaconMinor();
    },
    createToken: function () {
        return crypto.randomBytes(32).toString('hex');
    },
    createId: function (source) {
        return crypto.randomBytes(12).toString('hex');
    },
    getDate() {
        return new Date();
    },
    hashPassword(plaintextPassword) {
        let shasum = crypto.createHash('sha1');
        shasum.update(String(plaintextPassword));
        let hashedPassword = shasum.digest('hex');
        return hashedPassword;
    }
};
//# sourceMappingURL=CloudUtil.js.map