import { Protocol, FnCallType, TxbObject, ResourceAddress, ResourceObject} from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, Bcs, Entity_Info} from './utils.js';
import { ERROR, Errors } from './exception.js';
import { TagName, Resource } from './resource.js';
import { Transaction as TransactionBlock, TransactionResult } from '@mysten/sui/transactions';




export interface EntityData {
    info?: Entity_Info
    resource_object?: string,
    like?: number,
    dislike?: number,
    address?:string,
}
export class Entity {
    protected object:TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object = '';
    }

    static From(txb:TransactionBlock) : Entity {
        let r = new Entity(txb);
        r.object = Protocol.TXB_OBJECT(txb, Protocol.Instance().objectEntity());
        return r
    }

    mark(resource:Resource, address:string | TransactionResult, like:TagName.Like | TagName.Dislike) {
        if (typeof(address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, like);
        }

        this.txb.moveCall({
            target:Protocol.Instance().entityFn(like) as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()), 
                typeof(address) === 'string' ? this.txb.pure.address(address) : address]
        })
    }

    update(info: Entity_Info) {
        if (info?.name && !IsValidName(info.name)) ERROR(Errors.IsValidName, 'update');
        if (info?.description && !IsValidDesription(info.description)) ERROR(Errors.IsValidDesription, 'update');
        if (info?.avatar && !isValidHttpUrl(info.avatar)) ERROR(Errors.isValidHttpUrl, 'update:avatar');
        if (info?.twitter && !IsValidName(info.twitter)) ERROR(Errors.IsValidName, 'update:twitter');
        if (info?.homepage && !isValidHttpUrl(info.homepage)) ERROR(Errors.isValidHttpUrl, 'update:homepage');
        if (info?.discord && !IsValidName(info.discord)) ERROR(Errors.IsValidName, 'update:discord');
        
        const bytes = Bcs.getInstance().se_entInfo(info);
        this.txb.moveCall({
            target:Protocol.Instance().entityFn('avatar_update') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('u8', [].slice.call(bytes))]
        })
    }

    create_resource() : ResourceAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        })
    }

    create_resource2(): ResourceObject {
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_create2') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        }) 
    }
    
    destroy_resource(resource:Resource) { // Resource must self-owned.
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_destroy') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        })
    }

    use_resource(resource:Resource) { // Resource must self-owned.
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_use') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        })
    }

    transfer_resource(resource:Resource, new_address:string) { // Resource must self-owned.
        if (!IsValidAddress(new_address)) ERROR(Errors.IsValidAddress, 'transfer_resource');
        
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_transfer') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()), 
                this.txb.pure.address(new_address)]
        })   
    }
    query_ent(address_queried:string) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_ent');    
        }

        this.txb.moveCall({
            target:Protocol.Instance().entityFn('QueryEnt') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        })   
    }

    static EntityData = async (address:string) : Promise<EntityData|undefined>=> {
        if (IsValidAddress(address)) {
            const txb = new TransactionBlock(); 
            txb.moveCall({
                target:Protocol.Instance().entityFn('QueryEnt') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, Protocol.Instance().objectEntity()), 
                    txb.pure.address(address)]
            }) ;

            const res = await Protocol.Client().devInspectTransactionBlock({sender:address, transactionBlock:txb});
            if (res.results?.length === 1 && res.results[0].returnValues?.length === 1 )  {
                const r1 = Bcs.getInstance().de_ent(Uint8Array.from(res.results[0].returnValues[0][0]));
                return {info: Bcs.getInstance().de_entInfo(Uint8Array.from(r1.avatar)),
                    resource_object: r1.resource?.some ?? undefined, 
                    like: r1.like, dislike:r1.dislike, address:address};
            }
        }
  } 
}