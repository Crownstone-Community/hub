import { HubDataParser } from "./HubData";
import { DataStepper } from "crownstone-core";
export declare function parseHubSetup(dataRef: HubDataParser, stepper: DataStepper): void;
export declare function parseRequestData(dataRef: HubDataParser, stepper: DataStepper): void;
export declare function parseFactoryResetData(dataRef: HubDataParser, stepper: DataStepper): void;
export declare function parseFactoryResetHubOnlyData(dataRef: HubDataParser, stepper: DataStepper): void;
