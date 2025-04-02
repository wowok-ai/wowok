import { TxbObject, PermissionAddress, GuardObject } from './protocol';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export declare enum PermissionIndex {
    repository = 100,
    repository_description = 101,
    repository_mode = 102,
    repository_policies = 103,
    repository_reference = 104,
    service = 200,
    service_description = 201,
    service_sales = 202,
    service_payee = 203,
    service_repository = 204,
    service_withdraw_guards = 205,
    service_refund_guards = 206,
    service_discount_transfer = 207,
    service_withdraw = 208,
    service_buyer_guard = 209,
    service_machine = 210,
    service_endpoint = 211,
    service_publish = 212,
    service_clone = 213,
    service_customer_required = 214,
    service_pause = 215,
    service_treasury = 216,
    service_arbitration = 217,
    demand = 260,
    demand_refund = 261,
    demand_expand_time = 262,
    demand_guard = 263,
    demand_description = 264,
    demand_yes = 265,
    machine = 600,
    machine_description = 601,
    machine_repository = 602,
    machine_clone = 604,
    machine_node = 606,
    machine_endpoint = 608,
    machine_pause = 609,
    machine_publish = 610,
    progress = 650,
    progress_namedOperator = 651,
    progress_bind_task = 652,
    progress_context_repository = 653,
    progress_unhold = 654,
    progress_parent = 655,
    treasury = 700,
    treasury_receive = 701,
    treasury_deposit = 702,
    treasury_withdraw = 703,
    treasury_descritption = 704,
    treasury_deposit_guard = 705,
    treasury_withdraw_mode = 706,
    treasury_withdraw_guard = 707,
    arbitration = 800,
    arbitration_description = 801,
    arbitration_fee = 802,
    arbitration_voting_guard = 803,
    arbitration_endpoint = 804,
    arbitration_guard = 805,
    arbitration_pause = 806,
    arbitration_vote = 807,
    arbitration_arbitration = 808,
    arbitration_withdraw = 809,
    arbitration_treasury = 810,
    user_defined_start = 1000
}
export interface PermissionInfoType {
    index: number;
    name: string;
    description: string;
    module: string;
    guard?: string;
}
export declare const PermissionInfo: PermissionInfoType[];
export interface PermissionAnswer {
    who: string;
    owner?: boolean;
    admin?: boolean;
    items?: PermissionAnswerItem[];
    object: string;
}
export interface PermissionAnswerItem {
    query: PermissionIndexType;
    permission: boolean;
    guard?: string;
}
export type OnPermissionAnswer = (answer: PermissionAnswer) => void;
export type PermissionIndexType = PermissionIndex | number;
export interface Permission_Entity_Permission {
    index: PermissionIndexType;
    guard?: TxbObject;
}
export interface Permission_Entity {
    address: string;
    permissions: Permission_Entity_Permission[];
}
export interface Permission_Index_Entity {
    address: string;
    guard?: TxbObject;
}
export interface Permission_Index {
    index: PermissionIndexType;
    entities: Permission_Index_Entity[];
}
export interface BizPermission {
    index: PermissionIndexType;
    name: string;
}
export declare class Permission {
    protected txb: TransactionBlock;
    protected object: TxbObject;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, object: TxbObject): Permission;
    static New(txb: TransactionBlock, description: string): Permission;
    launch(): PermissionAddress;
    add_bizPermission(index: number, name: string): void;
    remove_bizPermission(index: number): void;
    transfer_permission(old_entity: string, new_entity: string): void;
    add_entity2(entities: string[], index?: PermissionIndexType): void;
    add_entity3(entities: Permission_Index[]): void;
    add_entity(entities: Permission_Entity[]): void;
    set_guard(address: string, index: PermissionIndexType, guard?: GuardObject): void;
    remove_index(address: string, index: PermissionIndexType[]): void;
    remove_entity(address: string[]): void;
    set_description(description: string): void;
    add_admin(admin: string[]): void;
    remove_admin(admin: string[], removeall?: boolean): void;
    change_owner(new_owner: string): void;
    query_permissions_all(address_queried: string): void;
    QueryPermissions(permission: string, address_queried: string, onPermissionAnswer: OnPermissionAnswer, sender?: string): void;
    static HasPermission(answer: PermissionAnswer | undefined, index: PermissionIndexType, bStrict?: boolean): {
        has: boolean;
        guard?: string;
        owner?: boolean;
    } | undefined;
    static MAX_ADMIN_COUNT: number;
    static MAX_ENTITY_COUNT: number;
    static MAX_PERMISSION_INDEX_COUNT: number;
    static MAX_PERSONAL_PERMISSION_COUNT: number;
    static PERMISSION_NORMAL: number;
    static PERMISSION_OWNER: number;
    static PERMISSION_ADMIN: number;
    static PERMISSION_OWNER_AND_ADMIN: number;
    static BUSINESS_PERMISSIONS_START: PermissionIndex;
    static IsValidBizPermissionIndex: (index: number) => boolean;
    static IsValidPermissionIndex: (index: PermissionIndexType) => boolean;
}
//# sourceMappingURL=permission.d.ts.map