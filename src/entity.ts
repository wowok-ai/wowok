import { Protocol, FnCallType, TxbObject, ResourceAddress, ResourceObject} from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, Bcs, IsValidStringLength} from './utils.js';
import { ERROR, Errors } from './exception.js';
import { TagName, Resource } from './resource.js';
import { Transaction as TransactionBlock, TransactionResult } from '@mysten/sui/transactions';

export interface EntityData {
    info?: Map<string, string>,
    resource_object?: string,
    like?: number,
    dislike?: number,
    address?:string,
    description?: string,
    lastActive_digest?: string,
}

export enum EntityInfo_Default {
    name = 'name',
    avatar = 'avatar',
    x = 'x',
    discord = 'discord',
    location = 'location',
    homepage = 'homepage'
}

export interface EntityInfo {
    title: string;
    value: string;
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

    add_info(info: Map<string, string>) {
        if (info.size === 0)  return ;

        if (info.size > Entity.MAX_INFO_LENGTH) {
            ERROR(Errors.IsValidValue, `Entity.update: info size too long ${info.size}`);
        }

        info.forEach((v, k) => {
            if (!IsValidName(k)) {
                ERROR(Errors.IsValidName, `Entity.update: ${k} key too long `);
            }
            if (!IsValidStringLength(v, Entity.MAX_INFO_VALUE_LENGTH)) {
                ERROR(Errors.IsValidValue, `Entity.update: ${k} value too long`);
            }   
        })

        const keys = Array.from(info.keys()).map(v => v.toLocaleLowerCase());
        const values = Array.from(info.values());
        
        this.txb.moveCall({
            target:Protocol.Instance().entityFn('info_add') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                this.txb.pure.vector('string', keys),
                this.txb.pure.vector('string', values)]
        })
    }

    remove_info(titles:string[]) {
        if (titles.length === 0) return ;
        const t = titles.map(v => v.toLowerCase());
        this.txb.moveCall({
            target:Protocol.Instance().entityFn('info_remove') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                this.txb.pure.vector('string', t)]
        })
    }

    removeall_info() {
        this.txb.moveCall({
            target:Protocol.Instance().entityFn('info_removeall') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
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
    
    set_description(description:string) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'Entity.set_description');
        }

        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('description_set') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description)]
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

    static EntityData = async (address:string) : Promise<EntityData|undefined>=> {
        if (IsValidAddress(address)) {
            const res = await Protocol.Client().getDynamicFieldObject({
                parentId:Protocol.Instance().objectEntity(), name:{type:'address', value:address}});

            const content = (res?.data?.content as any)?.fields;
            const info = new Map<string, string>();
            (content?.value?.fields?.info?.fields?.contents as any)?.forEach((v:any) => {
                info.set(v?.fields?.key, v?.fields?.value)
            })

            return {like:content?.value?.fields?.like, dislike:content?.value?.fields?.dislike, address: address,
                resource_object: content?.value?.fields?.resource, lastActive_digest: res?.data?.previousTransaction ?? '', 
                info : info, description:content?.value?.fields?.description}
        }
  } 
  static MAX_INFO_LENGTH = 32;
  static MAX_INFO_VALUE_LENGTH = 256; // The max length of each info value.
}