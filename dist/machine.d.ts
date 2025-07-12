import { Transaction as TransactionBlock, type TransactionResult } from '@mysten/sui/transactions';
import { PermissionObject, RepositoryObject, PassportObject, MachineObject, MachineAddress, GuardObject, TxbObject, ServiceObject } from './protocol.js';
import { PermissionIndexType } from './permission.js';
export interface ServiceWrap {
    object: ServiceObject;
    pay_token_type: string;
    bRequired?: boolean;
}
export interface Machine_Forward {
    name: string;
    namedOperator?: string;
    permission?: PermissionIndexType;
    weight?: number;
    guard?: GuardObject;
    suppliers?: ServiceWrap[];
}
export interface Machine_Node_Pair {
    prior_node: string;
    forwards: Machine_Forward[];
    threshold?: number;
}
export interface Machine_Node {
    name: string;
    pairs: Machine_Node_Pair[];
}
export interface QueryGuardParam {
    node: string;
    prior_node: string;
    forward: string;
    txb: TransactionBlock;
    guard: string | null;
}
export type OnQueryGuard = (param: QueryGuardParam) => void;
export declare class Machine {
    protected txb: TransactionBlock;
    protected object: TxbObject;
    protected permission: TxbObject;
    get_object(): TxbObject;
    static From(txb: TransactionBlock, permission: PermissionObject, object: TxbObject): Machine;
    private constructor();
    static New(txb: TransactionBlock, permission: PermissionObject, description: string, endpoint?: string | null | undefined, passport?: PassportObject): Machine;
    add_node(nodes: Machine_Node[], passport?: PassportObject): void;
    forward(forward: Machine_Forward): TransactionResult;
    add_node2(nodes: TxbObject[], passport?: PassportObject): void;
    fetch_node(node_name: string, passport?: PassportObject): TxbObject;
    rename_node(node_name: string, new_name: string, passport?: PassportObject): void;
    remove_node(nodes_name: string[], bTransferMyself?: boolean, passport?: PassportObject): void;
    launch(): MachineAddress;
    set_description(description: string, passport?: PassportObject): void;
    add_repository(repository: RepositoryObject, passport?: PassportObject): void;
    remove_repository(repositories: string[], removeall?: boolean, passport?: PassportObject): void;
    clone(bLaunch?: boolean, passport?: PassportObject): MachineObject | MachineAddress;
    set_endpoint(endpoint?: string | null | undefined, passport?: PassportObject): void;
    pause(bPaused: boolean, passport?: PassportObject): void;
    publish(passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    add_forward(node_prior: string, node_name: string, foward: Machine_Forward, threshold?: number, old_forward_name?: string, passport?: PassportObject): void;
    remove_pair(node_prior: string, node_name: string, passport?: PassportObject): void;
    remove_forward(node_prior: string, node_name: string, foward_name: string, passport?: PassportObject): void;
    static rpc_de_nodes(fields: any): Machine_Node[];
    static rpc_de_pair(data: any): Machine_Node_Pair[];
    static namedOperators(nodes: Machine_Node[]): string[];
    static checkValidForward(forward: Machine_Forward): void;
    static INITIAL_NODE_NAME: string;
    static OPERATOR_ORDER_PAYER: string;
}
//# sourceMappingURL=machine.d.ts.map