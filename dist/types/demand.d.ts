import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject, ServiceObject } from './protocol.js';
export declare class Demand {
    protected bounty_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_bounty_type(): string;
    get_object(): TxbObject;
    static From(txb: TransactionBlock, bounty_type: string, permission: PermissionObject, object: TxbObject): Demand;
    private constructor();
    static New(txb: TransactionBlock, bounty_type: string, ms_expand: boolean, time: number, permission: PermissionObject, description: string, passport?: PassportObject): Demand;
    launch(): DemandAddress;
    refund(passport?: PassportObject): void;
    expand_time(minutes_duration: boolean, time: number, passport?: PassportObject): void;
    set_guard(guard?: GuardObject, service_identifier?: number, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    yes(service_address: string, passport?: PassportObject): void;
    deposit(bounty: TxbObject): void;
    present(service: ServiceObject | number, service_pay_type: string, tips: string, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static parseObjectType: (chain_type?: string | null) => string;
    static MAX_BOUNTY_COUNT: number;
    static MAX_PRESENTERS_COUNT: number;
}
//# sourceMappingURL=demand.d.ts.map