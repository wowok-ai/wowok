import { TxbObject, TxbAddress } from './protocol.js';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
export interface Tags {
    address: string;
    name?: string;
    tags: string[];
}
export interface TagData {
    tag: string;
    address: string[];
}
export declare enum TagName {
    Like = "like",
    Dislike = "dislike",
    Launch = "launch",
    Order = "order",
    Payment = "payment",
    Progress = "progress"
}
export declare class Resource {
    static MAX_ADDRESS_COUNT_FOR_TAG: number;
    static MAX_TAG_COUNT_FOR_ADDRESS: number;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, object: TxbObject): Resource;
    launch(): TxbAddress;
    private resolve_add;
    add(address: TransactionResult | string, tags: string[], name?: string): void;
    remove(address: TransactionResult | string, tags: string[]): void;
    removeall(address: TxbAddress): void;
    static TagData(tags: Tags[], innerTag?: boolean): TagData[];
    static Tags(data: TagData): Tags[];
}
//# sourceMappingURL=resource.d.ts.map