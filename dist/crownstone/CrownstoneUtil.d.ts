export declare class CrownstoneUtil {
    static checkLinkedStoneId(): Promise<void>;
    /**
     * @param partial | If true, the energy data will be retained. Once a new hub is setup and it belongs to a different sphere
     *                           the energy data will be cleared anyway. This is the default method.
  *                     If partial is false, the full database will be cleared.
     * @param hubOnly | If true, the uart dongle will also be placed back in setup mode. If false, only the hub snap will be reset
     */
    static deleteCrownstoneHub(partial?: boolean, hubOnly?: boolean): Promise<string>;
}
