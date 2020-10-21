
interface map       { [key: string]: boolean }
interface numberMap { [key: string]: number }
interface stringMap { [key: string]: string }


type PromiseCallback = (any?) => Promise<any>

interface UartInterface {
  uart     : CrownstoneUart;
  ready    : boolean
}

interface CrownstoneHub {
  uart     : UartInterface;
}

interface SwitchPair {
  crownstoneId: number,
  switchState: number
}

interface HubStatus {
  initialized: boolean,
  loggedIntoCloud: boolean,
  loggedIntoSSE: boolean,
  syncedWithCloud: boolean,
  uartReady: boolean,
  belongsToSphere: string,
  uptime?: number
}

interface IntervalData {
  sampleIntervalMs: number,
  interpolationThreshold: number,
  isOnSamplePoint:        (timestamp: number) => boolean,
  getPreviousSamplePoint: (timestamp: number) => number,
  targetInterval: string,
  basedOnInterval: string,
}

type Interval = '1m' | '5m' | '10m' | '15m' | '30m' | '1h' | '3h' | '6h' | '12h' | '1d' | '1w'