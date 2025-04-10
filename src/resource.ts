import { Protocol, FnCallType, TxbObject, TxbAddress} from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, IsValidArray,  } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { Entity } from './entity.js';

export interface Tags { // tag am address
    address: string; // address to tag
    name?: string; //  named address
    tags: string[]; // tags for address
}

export interface TagData { 
    tag: string; // tag name
    address: string[]; // objects in folder
} 
export enum TagName {
    Like = "like",
    Dislike = "dislike",
    Launch = 'launch',
    Order = 'order',
    Payment = 'payment'
}

export class Resource {
    static MAX_ADDRESS_COUNT_FOR_TAG = 1000; // max address count
    static MAX_TAG_COUNT_FOR_ADDRESS = 64; // max tag count for an address
    //static MAX_ADDRESS_COUNT_FOR_MARK = 200; // max address count for a mark
    //static MAX_MARK_COUNT = 600; // max mark count

    protected object:TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object = '';
    }

    static From(txb:TransactionBlock, object:TxbObject) : Resource {
        let r = new Resource(txb);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return r
    }

    launch() : TxbAddress{
        if (!this.object) ERROR(Errors.Fail, 'launch object Invalid');
        return this.txb.moveCall({
            target:Protocol.Instance().resourceFn('create')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }

    private resolve_add(address:TransactionResult | string, tags:string[]) {
        if (tags.find(v => v===TagName.Like)) {
            Entity.From(this.txb).mark(this, address, TagName.Like);
        }
        if (tags.find(v => v===TagName.Dislike)) {
            Entity.From(this.txb).mark(this, address, TagName.Dislike);
        }  
        return (tags.filter(v => v !== TagName.Like && v !== TagName.Dislike && IsValidName(v)));
    }

    add(address:TransactionResult | string, tags:string[], name?:string) { 
        if (typeof(address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'Resource: add.address');
        }   

        var realtags = this.resolve_add(address, tags);
        if (!name && realtags.length === 0) return;

        if (name && !IsValidName(name)) ERROR(Errors.IsValidName, 'Resource: add.name');
        if (realtags.length > Resource.MAX_TAG_COUNT_FOR_ADDRESS) {
            realtags = realtags.slice(0, Resource.MAX_TAG_COUNT_FOR_ADDRESS)
        }

        this.txb.moveCall({
            target:Protocol.Instance().resourceFn('add')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                typeof(address) === 'string' ? this.txb.pure.address(address) : address, 
                this.txb.pure.option('string', name),
                this.txb.pure.vector('string', realtags)
            ]
        });
    }

    remove(address:TransactionResult | string, tags:string[]) { 
        if (typeof(address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'Resource: remove.address');
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().resourceFn('remove')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                typeof(address) === 'string' ? this.txb.pure.address(address) : address, 
                this.txb.pure.vector('string', tags)
            ]
        });
    }

    removeall(address: TxbAddress) {
        if (typeof(address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'Resource: removeall.address');
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().resourceFn('removeall')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                typeof(address) === 'string' ? this.txb.pure.address(address) : address, 
            ]
        });
    }

    static TagData(tags: Tags[], innerTag:boolean=true) : TagData[] {
        const data : TagData[] = [];
        tags.forEach(v => {
          v.tags.forEach(i => {
            const f = data.find(k => k.tag === i);
            if (f) {
              if (!f.address.find(k => k === v.address)) { // add address
                f.address.push(v.address)
              } 
            } else {
                data.push({tag:i, address:[v.address]}); // add tag
            }
          })
        })
        if (innerTag) {
            (Object.keys(TagName) as Array<keyof typeof TagName>).forEach(i => {
                if (!data.find(v => v.tag === TagName[i])) {
                    data.push({tag:TagName[i], address:[]})
                }                
            })
        }
        return data;
    }

    static Tags(data: TagData) : Tags[] {
        const tags : Tags[] = [];
        data.address.forEach(v => {
            const f = tags.find(i => i.address === v);
            if (f) {
                if (!f.tags.find(k => k === data.tag)) {
                    f.tags.push(data.tag)
                }
            } else {
                tags.push({address:v, tags:[data.tag]})
            }
        })
        return tags;
    }
}

