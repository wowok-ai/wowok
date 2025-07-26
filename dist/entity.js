var _a;
import { Protocol } from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, IsValidStringLength } from './utils.js';
import { ERROR, Errors } from './exception.js';
export var EntityInfo_Default;
(function (EntityInfo_Default) {
    EntityInfo_Default["name"] = "name";
    EntityInfo_Default["avatar"] = "avatar";
    EntityInfo_Default["x"] = "x";
    EntityInfo_Default["discord"] = "discord";
    EntityInfo_Default["location"] = "location";
    EntityInfo_Default["homepage"] = "homepage";
})(EntityInfo_Default || (EntityInfo_Default = {}));
export class Entity {
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb) {
        let r = new _a(txb);
        r.object = Protocol.TXB_OBJECT(txb, Protocol.Instance().objectEntity());
        return r;
    }
    mark(resource, address, like) {
        if (typeof (address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, like);
        }
        this.txb.moveCall({
            target: Protocol.Instance().entityFn(like),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()),
                typeof (address) === 'string' ? this.txb.pure.address(address) : address]
        });
    }
    update(info) {
        if (info.size === 0) {
            return;
        }
        if (info.size > _a.MAX_INFO_LENGTH) {
            ERROR(Errors.IsValidValue, `Entity.update: info size too long ${info.size}`);
        }
        info.forEach((v, k) => {
            if (!IsValidName(k)) {
                ERROR(Errors.IsValidName, `Entity.update: ${k} key too long `);
            }
            if (!IsValidStringLength(v, _a.MAX_INFO_VALUE_LENGTH)) {
                ERROR(Errors.IsValidValue, `Entity.update: ${k} value too long`);
            }
        });
        const keys = Array.from(info.keys()).map(v => v.toLocaleLowerCase());
        const values = Array.from(info.values());
        this.txb.moveCall({
            target: Protocol.Instance().entityFn('info_update'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                this.txb.pure.vector('string', keys),
                this.txb.pure.vector('string', values)]
        });
    }
    create_resource() {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    create_resource2() {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_create2'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    set_description(description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'Entity.set_description');
        }
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('description_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description)]
        });
    }
    destroy_resource(resource) {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_destroy'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        });
    }
    use_resource(resource) {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_use'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        });
    }
    transfer_resource(resource, new_address) {
        if (!IsValidAddress(new_address))
            ERROR(Errors.IsValidAddress, 'transfer_resource');
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_transfer'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()),
                this.txb.pure.address(new_address)]
        });
    }
}
_a = Entity;
Entity.EntityData = async (address) => {
    if (IsValidAddress(address)) {
        const res = await Protocol.Client().getDynamicFieldObject({
            parentId: Protocol.Instance().objectEntity(), name: { type: 'address', value: address }
        });
        const content = res?.data?.content?.fields;
        const info = new Map();
        content?.value?.fields?.info?.fields?.contents?.forEach((v) => {
            info.set(v?.fields?.key, v?.fields?.value);
        });
        return { like: content?.value?.fields?.like, dislike: content?.value?.fields?.dislike, address: address,
            resource_object: content?.value?.fields?.resource, lastActive_digest: res?.data?.previousTransaction ?? '',
            info: info, description: content?.value?.fields?.description };
    }
};
Entity.MAX_INFO_LENGTH = 32;
Entity.MAX_INFO_VALUE_LENGTH = 256; // The max length of each info value.
//# sourceMappingURL=entity.js.map