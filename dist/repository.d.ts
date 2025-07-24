import { ValueType, RepositoryValueType, RepositoryAddress, PermissionObject, PassportObject, TxbObject, GuardObject } from './protocol.js';
import { PermissionIndexType } from './permission.js';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export declare enum Repository_Policy_Mode {
    POLICY_MODE_FREE = 0,
    POLICY_MODE_STRICT = 1
}
export declare enum Repository_Type {
    NORMAL = 0,
    WOWOK_GRANTEE = 1,
    WOWOK_ORACLE = 2
}
export interface RepData {
    id: string;
    name: string;
    dataType: RepositoryValueType;
    data: string | string[];
    object: string;
}
export interface Repository_Policy {
    key: string;
    description: string;
    dataType: RepositoryValueType;
    permissionIndex?: PermissionIndexType | null;
}
export interface Repository_Policy_Data {
    key: string;
    data: Repository_Value[];
    value_type?: ValueType;
}
export interface Repository_Value {
    address: string;
    bcsBytes: Uint8Array;
}
export interface Repository_Value2 {
    key: string;
    bcsBytes: Uint8Array;
}
export interface Repository_Policy_Data2 {
    address: string;
    data: Repository_Value2[];
    value_type?: ValueType;
}
export interface Repository_Policy_Data_Remove {
    key: string;
    address: string;
}
export declare class Repository {
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, permission: PermissionObject, object: TxbObject): Repository;
    static New(txb: TransactionBlock, permission: PermissionObject, description: string, policy_mode?: Repository_Policy_Mode, passport?: PassportObject): Repository;
    launch(): RepositoryAddress;
    add_data(data: Repository_Policy_Data, passport?: PassportObject): void;
    add_data2(data: Repository_Policy_Data2, passport?: PassportObject): void;
    remove(address: string, key: string, passport?: PassportObject): void;
    add_reference(references: string[], passport?: PassportObject): void;
    remove_reference(references: string[], removeall?: boolean, passport?: PassportObject): void;
    add_policies(policies: Repository_Policy[], passport?: PassportObject): void;
    remove_policies(policy_keys: string[], removeall?: boolean, passport?: PassportObject): void;
    rename_policy(policy_key: string, new_policy_key: string, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    set_policy_mode(policy_mode: Repository_Policy_Mode, passport?: PassportObject): void;
    set_guard(guard?: GuardObject | null, passport?: PassportObject): void;
    set_policy_description(policy: string, description: string, passport?: PassportObject): void;
    set_policy_permission(policy: string, permission_index?: number, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static MAX_POLICY_COUNT: number;
    static MAX_KEY_LENGTH: number;
    static MAX_VALUE_LENGTH: number;
    static MAX_REFERENCE_COUNT: number;
    static MAX_POLICY_DESRIPTION_LENGTH: number;
    static IsValidName: (key: string) => boolean;
    static IsValidPolicyDescription(description: string): boolean;
    static IsValidValue: (value: Uint8Array) => boolean;
    static rpc_de_data(fields: any): RepData[];
    static DataType2ValueType(data: string | number | bigint): ValueType | undefined;
    static ResolveRepositoryData: (dataType: RepositoryValueType, data: bigint | string | boolean | number | string[] | number[]) => {
        type: ValueType;
        data: Uint8Array;
    } | undefined;
}
//# sourceMappingURL=repository.d.ts.map