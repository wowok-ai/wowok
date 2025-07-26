import { TxbObject, ResourceAddress, ResourceObject } from './protocol.js';
import { TagName, Resource } from './resource.js';
import { Transaction as TransactionBlock, TransactionResult } from '@mysten/sui/transactions';
export interface EntityData {
    info?: Map<string, string>;
    resource_object?: string;
    like?: number;
    dislike?: number;
    address?: string;
    description?: string;
    lastActive_digest?: string;
}
export declare enum EntityInfo_Default {
    name = "name",
    avatar = "avatar",
    x = "x",
    discord = "discord",
    location = "location",
    homepage = "homepage"
}
export declare class Entity {
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock): Entity;
    mark(resource: Resource, address: string | TransactionResult, like: TagName.Like | TagName.Dislike): void;
    update(info: Map<string, string>): void;
    create_resource(): ResourceAddress;
    create_resource2(): ResourceObject;
    set_description(description: string): TransactionResult;
    destroy_resource(resource: Resource): TransactionResult;
    use_resource(resource: Resource): TransactionResult;
    transfer_resource(resource: Resource, new_address: string): TransactionResult;
    static EntityData: (address: string) => Promise<EntityData | undefined>;
    static MAX_INFO_LENGTH: number;
    static MAX_INFO_VALUE_LENGTH: number;
}
//# sourceMappingURL=entity.d.ts.map