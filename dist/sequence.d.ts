import { FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, Send, SequenceHandler } from '@loopback/rest';
import { AuthenticateFn } from '@loopback/authentication';
export declare class CrownstoneSequence implements SequenceHandler {
    protected findRoute: FindRoute;
    protected parseParams: ParseParams;
    protected authenticateRequest: AuthenticateFn;
    protected invoke: InvokeMethod;
    send: Send;
    reject: Reject;
    constructor(findRoute: FindRoute, parseParams: ParseParams, authenticateRequest: AuthenticateFn, invoke: InvokeMethod, send: Send, reject: Reject);
    handle(context: RequestContext): Promise<void>;
}
