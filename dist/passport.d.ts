import { type TransactionObjectInput, Transaction as TransactionBlock, TransactionResult } from '@mysten/sui/transactions';
import { FnCallType, Protocol, ValueType } from './protocol.js';
export type Guard_Query_Object = {
    target: FnCallType;
    object: TransactionObjectInput | string;
    types: string[];
    id: string;
};
interface GuardInfo {
    id: string;
    digest?: string;
    version?: string | number;
    input: DeGuardInput[];
    constant: DeGuardConstant[];
}
export interface DeGuardConstant {
    type: number;
    value: any;
    bWitness: boolean;
    identifier: number;
}
export interface DeGuardInput {
    type: number;
    value?: any;
    identifier?: number;
    cmd?: number;
}
export interface DeGuardData extends DeGuardInput {
    child: DeGuardData[];
    ret_type?: number;
}
export interface WitnessFill {
    guard: string;
    witness?: any;
    cmd: number[];
    cited: number;
    type: ValueType;
    identifier: number;
}
export interface PassportQuery {
    query: Guard_Query_Object[];
    info: GuardInfo[];
}
export declare class GuardParser {
    protected guard_list: GuardInfo[];
    protected guards: string[];
    private constructor();
    guardlist: () => GuardInfo[];
    static DeGuardObject_FromData: (guard_constants: any, guard_input_bytes: any) => {
        object: DeGuardData;
        constant: DeGuardConstant[];
    };
    static DeGuardObject: (protocol: Protocol, guard: string) => Promise<{
        object: DeGuardData;
        constant: DeGuardConstant[];
    }>;
    static ResolveData: (constants: DeGuardConstant[], stack: DeGuardData[], current: DeGuardData) => void;
    private static Parse_Guard_Helper;
    static Create: (guards: string[], onGuardInfo?: ((parser: GuardParser | undefined) => void) | undefined) => Promise<GuardParser | undefined>;
    future_fills: () => WitnessFill[];
    static parse_constant: (constants: any) => DeGuardConstant[];
    static parse_bcs: (constants: DeGuardConstant[], chain_bytes: Uint8Array) => DeGuardInput[];
    done: (fill?: WitnessFill[], onPassportQueryReady?: ((passport: PassportQuery | undefined) => void) | undefined) => Promise<PassportQuery | undefined>;
    private done_helper;
    private object_query;
}
export declare class Passport {
    static MAX_GUARD_COUNT: number;
    protected passport: TransactionResult;
    protected txb: TransactionBlock;
    get_object(): TransactionResult;
    constructor(txb: TransactionBlock, query: PassportQuery);
    destroy(): void;
    freeze(): void;
    query_result(sender: string, handleResult: OnQueryPassportResult): void;
    query_result_async: (sender: string) => Promise<QueryPassportResult | undefined>;
    private static ResolveQueryRes;
}
export interface QueryPassportResult {
    txb: TransactionBlock;
    result: boolean;
    guards: string[];
}
export type OnQueryPassportResult = (result: QueryPassportResult) => void;
export {};
//# sourceMappingURL=passport.d.ts.map