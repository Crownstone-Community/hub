
type map = { [proptype: string] : boolean } | {}
type numberMap = { [proptype: string] : number } | {}
type stringMap = { [proptype: string] : string } | {}


type PromiseCallback = (any) => Promise<any>