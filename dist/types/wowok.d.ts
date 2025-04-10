import { TxbObject, PermissionObject, RepositoryAddress } from './protocol.js';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export declare class Wowok {
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock): Wowok;
    register_grantor(name: string, grantee_permission: PermissionObject): void;
    grantor_time_expand_1year(grantor: string): void;
    grantor_rename(new_name: string): void;
    mint(amount: string, recipient: string): void;
    oracle(description: string, permission: PermissionObject): RepositoryAddress;
}
//# sourceMappingURL=wowok.d.ts.map