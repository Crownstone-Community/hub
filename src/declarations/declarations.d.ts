
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
