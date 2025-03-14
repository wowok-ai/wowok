import { GuardAddress, Data_Type, MODULES, ContextType, ValueType, OperatorType, TxbObject, GuardObject } from './protocol';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export type GuardConstant = Map<number, Guard_Variable>;
export interface Guard_Variable {
    type: ValueType;
    value?: Uint8Array;
    bWitness: boolean;
}
export interface Guard_Options {
    from: 'query' | 'type';
    name: string;
    value: number;
    group?: string;
}
export interface GuardAnswer {
    txb: TransactionBlock;
    err?: string;
    identifiers: number[];
}
export type OnQueryAnswer = (answer: GuardAnswer) => void;
export declare const GUARD_QUERIES: any[];
export declare class Guard {
    static MAX_INPUT_LENGTH: number;
    protected txb: TransactionBlock;
    protected object: TxbObject;
    get_object(): TxbObject;
    static From(txb: TransactionBlock, object: TxbObject): Guard;
    private constructor();
    static New(txb: TransactionBlock, description: string, maker: GuardMaker): Guard;
    launch(): GuardAddress;
    static everyone_guard(txb: TransactionBlock): GuardAddress;
    static QueryAddressIdentifiers(guard: GuardObject, onQueryAnswer: OnQueryAnswer, sender: string): void;
    static BoolCmd: any[];
    static IsBoolCmd: (cmd: number) => boolean;
    static CmdFilter: (retType: ValueType) => any[];
    static GetCmd: (cmd: number | undefined) => any;
    static GetCmdOption: (cmd: number) => Guard_Options | undefined;
    static GetInputParams: (cmd: number) => ValueType[];
    static GetModuleName: (cmd: number) => string;
    static NumberOptions: () => Guard_Options[];
    static Signer: Guard_Options;
    static Time: Guard_Options;
    static Guard: Guard_Options;
    static Logics: () => Guard_Options[];
    static Crunchings: Guard_Options[];
    static CommonOptions: (retType: ValueType) => Guard_Options[];
    static AllOptions: () => Guard_Options[];
    static StringOptions: () => Guard_Options[];
    static BoolOptions: () => Guard_Options[];
    static AddressOptions: () => Guard_Options[];
    static Options: (ret_type: ValueType | "number" | "any") => Guard_Options[];
}
export declare const IsValidGuardIdentifier: (identifier: number | undefined) => boolean;
export declare class GuardMaker {
    protected data: Uint8Array[];
    protected type_validator: Data_Type[];
    protected constant: GuardConstant;
    private static _witness_index;
    private static _const_index;
    private static GetWitnessIndex;
    private static getConstIndex;
    static IsValidIndentifier: (identifier: number) => boolean;
    constructor();
    add_constant(type: ValueType, value?: any, identifier?: number, bNeedSerialize?: boolean): number;
    add_param(type: ValueType | ContextType, param?: any): GuardMaker;
    add_query(module: MODULES, query_name: string, object_address_from: string | number): GuardMaker;
    add_logic(type: OperatorType, logic_count?: number): GuardMaker;
    hasIdentifier(id: number): boolean;
    build(bNot?: boolean): GuardMaker;
    IsReady(): boolean;
    combine(otherBuilt: GuardMaker, bAnd?: boolean, bCombinConstant?: boolean): GuardMaker;
    get_constant(): GuardConstant;
    get_input(): Uint8Array<ArrayBufferLike>[];
    static input_combine(input1: Uint8Array, input2: Uint8Array, bAnd?: boolean): Uint8Array;
    static input_not(input: Uint8Array): Uint8Array;
    static match_u256(type: number): boolean;
    static is_multi_input_op(type: number): boolean;
}
//# sourceMappingURL=guard.d.ts.map