import { SuiObjectResponse, DynamicFieldPage } from '@mysten/sui/client';
import { RepositoryValueType, ValueType, ContextType } from './protocol.js';
export declare const MAX_U8: bigint;
export declare const MAX_U64: bigint;
export declare const MAX_U128: bigint;
export declare const MAX_U256: bigint;
export declare const OPTION_NONE = 0;
export declare const ValueTypeConvert: (type: ValueType | null | undefined) => RepositoryValueType | number;
export declare const readOption: (arr: number[], de: ValueType) => {
    bNone: boolean;
    value: any;
};
export declare const readOptionString: (arr: number[]) => {
    bNone: boolean;
    value: any;
};
export declare const ulebDecode: (arr: Uint8Array) => {
    value: number;
    length: number;
};
export declare const readVec: (arr: any[], cb: (arr: any[], i: number, length: number) => any) => any[];
export declare const cb_U8: (arr: any[], i: number, length: number) => any;
export declare const cb_U64: (arr: any[], i: number, length: number) => any;
export declare const cb_U128: (arr: any[], i: number, length: number) => any;
export declare const cb_U256: (arr: any[], i: number, length: number) => any;
export declare const concatenate: (resultConstructor: any, ...arrays: any[]) => any;
export declare const parseObjectType: (chain_type: string | null | undefined, header?: string) => string;
export declare const array_equal: (arr1: any[], arr2: any[]) => boolean;
export declare const array_unique: (arr: any[]) => any[];
export declare function capitalize(s: string): string;
export declare function parse_object_type(object_data: string): string[];
export interface Entity_Info {
    name: string;
    description?: string;
    avatar?: string;
    twitter?: string;
    discord?: string;
    homepage?: string;
}
export declare class Bcs {
    private static _instance;
    private EntStruct;
    private TagStruct;
    private PersonalInfo;
    private Guards;
    private Perm;
    private Perms;
    private constructor();
    static getInstance(): Bcs;
    ser_option_u32(data: Uint8Array | any): Uint8Array;
    ser(type: ValueType | ContextType, data: Uint8Array | any): Uint8Array;
    de(type: ValueType, data: Uint8Array | any): any;
    de_ent(data: Uint8Array | undefined): any | undefined;
    se_entInfo(info: Entity_Info): Uint8Array<ArrayBufferLike>;
    de_entInfo(data: Uint8Array | undefined): any | undefined;
    de_tags(data: Uint8Array | undefined): any | undefined;
    de_perms(data: Uint8Array | undefined): any | undefined;
}
export declare function stringToUint8Array(str: string): Uint8Array<ArrayBufferLike>;
export declare function numToUint8Array(num: number): Uint8Array;
export declare const isArr: (origin: any) => boolean;
export declare const deepClone: <T>(origin: T, target?: Record<string, any> | T) => T;
export declare const MAX_DESCRIPTION_LENGTH = 4000;
export declare const MAX_LOCATION_LENGTH = 256;
export declare const MAX_NAME_LENGTH = 64;
export declare const MAX_ENDPOINT_LENGTH = 1024;
export declare const IsValidStringLength: (str: string, max_len: number) => boolean;
export declare const IsValidDesription: (description: string) => boolean;
export declare const IsValidLocation: (location: string) => boolean;
export declare const IsValidName: (name?: string) => boolean;
export declare const IsValidName_AllowEmpty: (name: string) => boolean;
export declare const IsValidEndpoint: (endpoint: string) => boolean;
export declare const IsValidAddress: (addr: string | undefined | null) => boolean;
export declare const IsValidCoinType: (coin_type?: string | null) => boolean;
export declare const getUTCDayStartByDivision: (interval?: number) => number;
export declare const IsValidBigint: (value: string | number | undefined | bigint, max?: bigint, min?: bigint) => boolean;
export declare const IsValidU8: (value: string | number | undefined | bigint, min?: number) => boolean;
export declare const IsValidU64: (value: string | number | undefined | bigint, min?: number) => boolean;
export declare const IsValidU128: (value: string | number | undefined | bigint, min?: number) => boolean;
export declare const IsValidU256: (value: string | number | undefined | bigint, min?: number) => boolean;
export declare const IsValidTokenType: (argType?: string) => boolean;
export declare const IsValidArgType: (argType?: string) => boolean;
export declare const IsValidInt: (value: number | string) => boolean;
export declare const IsValidPercent: (value: number | string | bigint) => boolean;
export declare const IsValidArray: (arr: any, validFunc: any) => boolean;
export declare const ResolveU64: (value: bigint) => bigint;
export declare const ResolveBalance: (balance: string, decimals: number) => string;
export type ArgType = {
    isCoin: boolean;
    coin: string;
    token: string;
};
export declare const ParseType: (type: string) => ArgType;
export declare function insertAtHead(array: Uint8Array, value: number): Uint8Array<ArrayBuffer>;
export declare function toFixed(x: number): string;
export declare function isValidHttpUrl(url: string): boolean;
export interface query_object_param {
    id: string;
    onBegin?: (id: string) => void;
    onObjectRes?: (id: string, res: SuiObjectResponse) => void;
    onDynamicRes?: (id: string, res: DynamicFieldPage) => void;
    onFieldsRes?: (id: string, fields_res: SuiObjectResponse[]) => void;
    onObjectErr?: (id: string, err: any) => void;
    onDynamicErr?: (id: string, err: any) => void;
    onFieldsErr?: (id: string, err: any) => void;
}
export declare const uint2address: (value: number | bigint) => string;
export declare const query_object: (param: query_object_param) => void;
export declare const FirstLetterUppercase: (str: string | undefined | null) => string;
export declare function hasDuplicates<T>(array: T[]): boolean;
//# sourceMappingURL=utils.d.ts.map