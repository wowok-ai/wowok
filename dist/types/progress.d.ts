import { PermissionObject, RepositoryObject, PassportObject, MachineObject, ProgressObject, ProgressAddress, TxbObject, OrderObject } from './protocol.js';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
export interface OrderWrap {
    object: OrderObject;
    pay_token_type: string;
}
export interface Deliverable {
    msg: string;
    orders: OrderWrap[];
}
export type ProgressNext = {
    next_node_name: string;
    forward: string;
};
export type ParentProgress = {
    parent_id: string;
    parent_session_id: number;
    operation: ProgressNext;
};
export type CurrentSessionId = TransactionResult;
export interface Holder {
    forward: string;
    who?: string;
    deliverable: Deliverable;
    accomplished: boolean;
    time: string;
}
export interface Session {
    id?: number;
    next_node: string;
    holders: Holder[];
    weights: number;
    threshold: number;
    node?: string;
    bComplete?: boolean;
}
export interface History {
    id: number;
    node: string;
    next_node: string;
    time: string;
    sessions: Session[];
}
export declare class Progress {
    protected permission: PermissionObject;
    protected machine: MachineObject;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, machine: MachineObject, permission: PermissionObject, object: TxbObject): Progress;
    static New(txb: TransactionBlock, machine: MachineObject, permission: PermissionObject, task?: string | null, passport?: PassportObject): Progress;
    launch(): ProgressAddress;
    set_namedOperator(name: string, addresses: string[], passport?: PassportObject): void;
    bind_task(task_address: string, passport?: PassportObject): void;
    set_context_repository(repository?: RepositoryObject, passport?: PassportObject): void;
    unhold(next: ProgressNext, passport?: PassportObject): void;
    parent_none(passport?: PassportObject): void;
    parent(parent: ParentProgress, passport?: PassportObject): void;
    private deliverable;
    next(next: ProgressNext, deliverable: Deliverable, passport?: PassportObject): CurrentSessionId;
    hold(next: ProgressNext, hold: boolean): CurrentSessionId;
    static QueryForwardGuard: (progress: ProgressObject, machine: MachineObject, sender: string, next_node: string, forward: string) => Promise<string | undefined>;
    static DeSessions: (session: any) => Session[];
    static DeHistories: (fields: any) => History[];
    static DeHistory: (data: any) => History;
    static MAX_NAMED_OPERATOR_COUNT: number;
    static MAX_DELEVERABLE_ORDER_COUNT: number;
    static IsValidProgressNext: (next: ProgressNext) => boolean;
}
//# sourceMappingURL=progress.d.ts.map