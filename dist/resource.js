import { Protocol } from './protocol.js';
import { IsValidAddress, IsValidName, } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Entity } from './entity.js';
export var TagName;
(function (TagName) {
    TagName["Like"] = "like";
    TagName["Dislike"] = "dislike";
    TagName["Launch"] = "launch";
    TagName["Order"] = "order";
    TagName["Payment"] = "payment";
    //Account = 'account',
})(TagName || (TagName = {}));
export class Resource {
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb, object) {
        let r = new Resource(txb);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return r;
    }
    launch() {
        if (!this.object)
            ERROR(Errors.Fail, 'launch object Invalid');
        return this.txb.moveCall({
            target: Protocol.Instance().resourceFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    resolve_add(address, tags) {
        if (tags.find(v => v === TagName.Like)) {
            Entity.From(this.txb).mark(this, address, TagName.Like);
        }
        if (tags.find(v => v === TagName.Dislike)) {
            Entity.From(this.txb).mark(this, address, TagName.Dislike);
        }
        return (tags.filter(v => v !== TagName.Like && v !== TagName.Dislike && IsValidName(v)));
    }
    add(address, tags, name) {
        if (typeof (address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'Resource: add.address');
        }
        var realtags = this.resolve_add(address, tags);
        if (!name && realtags.length === 0)
            return;
        if (name && !IsValidName(name))
            ERROR(Errors.IsValidName, 'Resource: add.name');
        if (realtags.length > Resource.MAX_TAG_COUNT_FOR_ADDRESS) {
            realtags = realtags.slice(0, Resource.MAX_TAG_COUNT_FOR_ADDRESS);
        }
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('add'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                typeof (address) === 'string' ? this.txb.pure.address(address) : address,
                this.txb.pure.option('string', name),
                this.txb.pure.vector('string', realtags)
            ]
        });
    }
    remove(address, tags) {
        if (typeof (address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'Resource: remove.address');
        }
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                typeof (address) === 'string' ? this.txb.pure.address(address) : address,
                this.txb.pure.vector('string', tags)
            ]
        });
    }
    removeall(address) {
        if (typeof (address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'Resource: removeall.address');
        }
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('removeall'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                typeof (address) === 'string' ? this.txb.pure.address(address) : address,
            ]
        });
    }
    static TagData(tags, innerTag = true) {
        const data = [];
        tags.forEach(v => {
            v.tags.forEach(i => {
                const f = data.find(k => k.tag === i);
                if (f) {
                    if (!f.address.find(k => k === v.address)) { // add address
                        f.address.push(v.address);
                    }
                }
                else {
                    data.push({ tag: i, address: [v.address] }); // add tag
                }
            });
        });
        if (innerTag) {
            Object.keys(TagName).forEach(i => {
                if (!data.find(v => v.tag === TagName[i])) {
                    data.push({ tag: TagName[i], address: [] });
                }
            });
        }
        return data;
    }
    static Tags(data) {
        const tags = [];
        data.address.forEach(v => {
            const f = tags.find(i => i.address === v);
            if (f) {
                if (!f.tags.find(k => k === data.tag)) {
                    f.tags.push(data.tag);
                }
            }
            else {
                tags.push({ address: v, tags: [data.tag] });
            }
        });
        return tags;
    }
}
Resource.MAX_ADDRESS_COUNT_FOR_TAG = 1000; // max address count
Resource.MAX_TAG_COUNT_FOR_ADDRESS = 64; // max tag count for an address
//# sourceMappingURL=resource.js.map