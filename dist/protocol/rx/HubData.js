"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubDataParser = void 0;
const crownstone_core_1 = require("crownstone-core");
const hubProtocol_1 = require("../hubProtocol");
const HubDataParsers_1 = require("./HubDataParsers");
class HubDataParser {
    constructor(data) {
        this.valid = true;
        this.raw = data;
        this.parse();
    }
    parse() {
        let stepper = new crownstone_core_1.DataStepper(this.raw);
        this.protocol = stepper.getUInt8();
        this.dataType = stepper.getUInt16();
        switch (this.dataType) {
            case hubProtocol_1.HubDataType.SETUP:
                return HubDataParsers_1.parseHubSetup(this, stepper);
            case hubProtocol_1.HubDataType.REQUEST_DATA:
                return HubDataParsers_1.parseRequestData(this, stepper);
        }
    }
}
exports.HubDataParser = HubDataParser;
//# sourceMappingURL=HubData.js.map