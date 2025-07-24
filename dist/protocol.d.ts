import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Transaction as TransactionBlock, TransactionResult, TransactionArgument } from '@mysten/sui/transactions';
import { GuardConstant } from './guard.js';
export declare enum MODULES {
    machine = "machine",
    progress = "progress",
    repository = "repository",
    permission = "permission",
    passport = "passport",
    guard = "guard",
    demand = "demand",
    order = "order",
    service = "service",
    resource = "resource",
    entity = "entity",
    wowok = "wowok",
    treasury = "treasury",
    payment = "payment",
    arbitration = "arbitration",
    arb = "arb"
}
export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult | string | TransactionArgument;
export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult | string | TransactionArgument;
export type GuardAddress = TransactionResult;
export type GuardObject = TransactionResult | string | TransactionArgument;
export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult | string | TransactionArgument;
export type PassportObject = TransactionResult;
export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult | string | TransactionArgument;
export type ServiceObject = TransactionResult | string | TransactionArgument;
export type ServiceAddress = TransactionResult;
export type ArbitrationObject = TransactionResult | string | TransactionArgument;
export type ArbitrationAddress = TransactionResult;
export type ArbObject = TransactionResult | string | TransactionArgument;
export type ArbAddress = TransactionResult;
export type ProgressObject = TransactionResult | string | TransactionArgument;
export type ProgressAddress = TransactionResult;
export type TreasuryObject = TransactionResult | string | TransactionArgument;
export type TreasuryAddress = TransactionResult;
export type OrderObject = TransactionResult | string | TransactionArgument;
export type OrderAddress = TransactionResult;
export type DiscountObject = TransactionResult | string | TransactionArgument;
export type CoinObject = TransactionResult | string | TransactionArgument;
export type ResourceObject = TransactionResult | string | TransactionArgument;
export type ResourceAddress = TransactionResult;
export type EntityObject = TransactionResult | string | TransactionArgument;
export type EntityAddress = TransactionResult;
export type PaymentObject = TransactionResult | string | TransactionArgument;
export type PaymentAddress = TransactionResult;
export type ReceivedObject = TransactionResult | string | TransactionArgument;
export type CoinWrapperObject = TransactionResult;
export type TxbAddress = string | TransactionResult;
export type TxbObject = string | TransactionResult | TransactionArgument | GuardObject | RepositoryObject | PermissionObject | MachineObject | PassportObject | DemandObject | ServiceObject | OrderObject | DiscountObject | DemandObject | ResourceObject | EntityObject | ArbitrationObject | ArbObject | TreasuryObject;
export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;
export declare enum OperatorType {
    TYPE_QUERY = 1,// query wowok object
    TYPE_NUMBER_ADD = 2,
    TYPE_NUMBER_SUBTRACT = 3,
    TYPE_NUMBER_MULTIPLY = 4,
    TYPE_NUMBER_DEVIDE = 5,
    TYPE_NUMBER_MOD = 6,
    TYPE_NUMBER_ADDRESS = 7,
    TYPE_STRING_LOWERCASE = 8,// string to lowercase
    TYPE_LOGIC_AS_U256_GREATER = 11,
    TYPE_LOGIC_AS_U256_GREATER_EQUAL = 12,
    TYPE_LOGIC_AS_U256_LESSER = 13,
    TYPE_LOGIC_AS_U256_LESSER_EQUAL = 14,
    TYPE_LOGIC_AS_U256_EQUAL = 15,
    TYPE_LOGIC_EQUAL = 16,// TYPE&DATA(vector<u8>) MUST BE EQUAL
    TYPE_LOGIC_HAS_SUBSTRING = 17,// SUBSTRING
    TYPE_LOGIC_NOT = 18,// NOT
    TYPE_LOGIC_AND = 19,// AND
    TYPE_LOGIC_OR = 20
}
export declare const LogicsInfo: (string | OperatorType)[][];
export declare enum ValueType {
    TYPE_BOOL = 100,
    TYPE_ADDRESS = 101,
    TYPE_U8 = 102,
    TYPE_U64 = 103,
    TYPE_VEC_U8 = 104,
    TYPE_U128 = 105,
    TYPE_VEC_ADDRESS = 106,
    TYPE_VEC_BOOL = 107,
    TYPE_VEC_VEC_U8 = 108,
    TYPE_VEC_U64 = 109,
    TYPE_VEC_U128 = 110,
    TYPE_OPTION_ADDRESS = 111,
    TYPE_OPTION_BOOL = 112,
    TYPE_OPTION_U8 = 113,
    TYPE_OPTION_U64 = 114,
    TYPE_OPTION_U128 = 115,
    TYPE_OPTION_U256 = 116,
    TYPE_OPTION_STRING = 117,
    TYPE_OPTION_VEC_U8 = 118,
    TYPE_VEC_U256 = 119,
    TYPE_STRING = 120,
    TYPE_VEC_STRING = 121,
    TYPE_U256 = 122
}
export declare enum RepositoryValueType {
    Address = 200,
    Address_Vec = 201,
    PositiveNumber = 202,
    PositiveNumber_Vec = 203,
    String = 204,
    String_Vec = 205,
    Bool = 206
}
export declare const RepositoryValueTypeInfo: {
    type: RepositoryValueType;
    name: string;
    description: string;
}[];
export declare const OperatorTypeArray: number[];
export declare const ValueTypeArray: number[];
export declare const IsValidOperatorType: (type: number) => boolean;
export declare const IsValidValueType: (type: number) => boolean;
export declare const IsNumberType: (type: ValueType | any) => boolean;
export declare enum ContextType {
    TYPE_SIGNER = 60,// address type; the signer address on verifying
    TYPE_CLOCK = 61,// u64 type; On-chain time at validation
    TYPE_GUARD = 62,// address type; the address of the guard being verified
    TYPE_CONSTANT = 80
}
interface ValueTypeString {
    type: ValueType | ContextType;
    name: string;
    description: string;
    validator?: (value: any) => boolean;
}
export declare const SER_VALUE: ValueTypeString[];
export type Data_Type = ValueType | OperatorType | ContextType;
export declare enum ENTRYPOINT {
    mainnet = "mainnet",
    testnet = "testnet",
    devnet = "devnet",
    localnet = "localnet"
}
export interface CoinTypeInfo {
    symbol: string;
    type: string;
    decimals: number;
    alias?: boolean;
}
export declare class Protocol {
    protected network: string;
    protected packages: Map<string, string>;
    protected signer: string;
    protected wowok_object: string;
    protected entity_object: string;
    protected treasury_cap: string;
    protected oracle_object: string;
    protected txb: TransactionBlock | undefined;
    static _instance: any;
    constructor(network?: ENTRYPOINT);
    static Instance(): Protocol;
    static Client(): SuiClient;
    client(): SuiClient;
    use_network(network?: ENTRYPOINT): void;
    package(type: string): string;
    objectWowok(): string;
    objectEntity(): string;
    objectOracle(): string;
    objectTreasuryCap(): string;
    networkUrl(): string;
    machineFn: (fn: any) => string;
    progressFn: (fn: any) => string;
    repositoryFn: (fn: any) => string;
    permissionFn: (fn: any) => string;
    passportFn: (fn: any) => string;
    demandFn: (fn: any) => string;
    orderFn: (fn: any) => string;
    serviceFn: (fn: any) => string;
    resourceFn: (fn: any) => string;
    entityFn: (fn: any) => string;
    wowokFn: (fn: any) => string;
    treasuryFn: (fn: any) => string;
    paymentFn: (fn: any) => string;
    guardFn: (fn: any) => string;
    baseWowokFn: (fn: any) => string;
    arbitrationFn: (fn: any) => string;
    arbFn: (fn: any) => string;
    query: (objects: Query_Param[], options?: SuiObjectDataOptions) => Promise<SuiObjectResponse[]>;
    query_raw: (objects: string[], options?: SuiObjectDataOptions) => Promise<SuiObjectResponse[]>;
    new_session: () => TransactionBlock;
    sessionCurrent: () => TransactionBlock;
    sign_excute: (exes: ((protocol: Protocol, param: any) => void)[], priv_key: string, param?: any, options?: SuiTransactionBlockResponseOptions) => Promise<SuiTransactionBlockResponse>;
    static SUI_TOKEN_TYPE: string;
    static SUI_COIN_TYPE: string;
    WOWOK_TOKEN_TYPE: () => string;
    WOWOK_COIN_TYPE: () => string;
    COINS_TYPE: () => CoinTypeInfo[];
    update_coinType: (token_type: string, decimals: number, symbol: string) => void;
    explorerUrl: (objectid: string, type?: "object" | "txblock" | "account") => string;
    CoinTypes_Testnet: CoinTypeInfo[];
    CoinTypes_Mainnet: CoinTypeInfo[];
    coinTypeInfo: (token_type: string, handler: (info: CoinTypeInfo) => void) => CoinTypeInfo | "loading";
    static CLOCK_OBJECT: {
        objectId: string;
        mutable: boolean;
        initialSharedVersion: number;
    };
    static TXB_OBJECT(txb: TransactionBlock, arg: TxbObject): TransactionArgument;
    static IsValidObjects: (arr: TxbObject[]) => boolean;
    WOWOK_OBJECTS_TYPE: () => string[];
    WOWOK_OBJECTS_PREFIX_TYPE: () => string[];
    hasPackage(pack: string): boolean;
    object_name_from_type_repr: (type_repr: string) => string;
    module_object_name_from_type_repr: (type_repr: string) => string;
}
export declare class RpcResultParser {
    static Object_Type_Extra: () => string[];
    static objectids_from_response: (protocol: Protocol, response: SuiTransactionBlockResponse, concat_result?: Map<string, TxbObject[]>) => Map<string, TxbObject[]>;
}
export type Query_Param = {
    objectid: string;
    callback: (protocol: Protocol, response: SuiObjectResponse, param: Query_Param, option: SuiObjectDataOptions) => void;
    parser?: (result: any[], guardid: string, chain_sense_bsc: Uint8Array, constant?: GuardConstant) => boolean;
    data?: any;
    constants?: GuardConstant;
};
export {};
//# sourceMappingURL=protocol.d.ts.map