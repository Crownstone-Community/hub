
interface map       { [key: string]: boolean }
interface numberMap { [key: string]: number }
interface stringMap { [key: string]: string }


type PromiseCallback = (any?) => Promise<any>

interface UartInterface {
  connection : CrownstoneUart;
  ready      : boolean
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


interface Edge {
  to: number,
  from: number,
  rssi: {37: number, 38: number, 39: number},
  lastSeen: number,
}

interface LossStatistics {
  lastUpdate: number,
  messageNumber: number,
  received: number,
  lost: number
}

interface Crownstone {
  name: string,
  uid: number,
  macAddress: string,
  type: string,
  switchState: number | null,
  locked: boolean,
  dimming: boolean,
  switchcraft: boolean,
  tapToToggle: boolean,
  cloudId: string,
  locationCloudId: string,
  updatedAt: number,
}

interface Location_t {
  name: string,
  uid:  number,
  icon: string,
  cloudId: string,
  updatedAt: number
}
