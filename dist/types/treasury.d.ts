import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { PassportObject, PermissionObject, TreasuryAddress, TxbObject, CoinObject, PaymentObject, ReceivedObject } from './protocol.js';
export declare enum Treasury_WithdrawMode {
    PERMISSION = 0,
    GUARD_ONLY_AND_IMMUTABLE = 1,
    BOTH_PERMISSION_AND_GUARD = 2
}
export declare enum Treasury_Operation {
    WITHDRAW = 1,
    DEPOSIT = 2,
    RECEIVE = 4
}
export interface DepositParam {
    coin: CoinObject;
    index: bigint;
    remark: string;
    for_object?: string;
    for_guard?: string;
}
export interface WithdrawItem {
    address: string;
    amount: bigint | number | string;
}
export interface WithdrawParam {
    items: WithdrawItem[];
    index: bigint | number | string;
    remark: string;
    for_object?: string;
    for_guard?: string;
    withdraw_guard?: string;
}
export declare class Treasury {
    protected token_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_token_type(): string;
    get_object(): TxbObject;
    static From(txb: TransactionBlock, token_type: string, permission: PermissionObject, object: TxbObject): Treasury;
    private constructor();
    static New(txb: TransactionBlock, token_type: string, permission: PermissionObject, description: string, passport?: PassportObject): Treasury;
    launch(): TreasuryAddress;
    set_deposit_guard(guard?: string, passport?: PassportObject): void;
    deposit(param: DepositParam, passport?: PassportObject): TransactionResult;
    receive(payment: PaymentObject, received: ReceivedObject, passport?: PassportObject): TransactionResult;
    withdraw(param: WithdrawParam, passport?: PassportObject): TransactionResult | undefined;
    set_description(description: string, passport?: PassportObject): void;
    set_withdraw_mode(mode: Treasury_WithdrawMode, passport?: PassportObject): void;
    add_withdraw_guard(guard: string, amount: bigint, passport?: PassportObject): void;
    remove_withdraw_guard(guard: string[], removeall?: boolean, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static parseObjectType: (chain_type?: string) => string;
    static MAX_WITHDRAW_GUARD_COUNT: number;
}
//# sourceMappingURL=treasury.d.ts.map