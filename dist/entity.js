import { Protocol } from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, Bcs, } from './utils.js';
import { ERROR, Errors } from './exception.js';
export class Entity {
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb) {
        let r = new Entity(txb);
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
        if (info?.name && !IsValidName(info.name))
            ERROR(Errors.IsValidName, 'update');
        if (info?.description && !IsValidDesription(info.description))
            ERROR(Errors.IsValidDesription, 'update');
        if (info?.avatar && !isValidHttpUrl(info.avatar))
            ERROR(Errors.isValidHttpUrl, 'update:avatar');
        if (info?.twitter && !IsValidName(info.twitter))
            ERROR(Errors.IsValidName, 'update:twitter');
        if (info?.homepage && !isValidHttpUrl(info.homepage))
            ERROR(Errors.isValidHttpUrl, 'update:homepage');
        if (info?.discord && !IsValidName(info.discord))
            ERROR(Errors.IsValidName, 'update:discord');
        const bytes = Bcs.getInstance().bcs.ser('PersonalInfo', {
            name: info.name ? new TextEncoder().encode(info.name) : '',
            description: info?.description ? new TextEncoder().encode(info.description) : '',
            avatar: info?.avatar ?? '',
            twitter: info?.twitter ?? '',
            discord: info?.discord ?? '',
            homepage: info?.homepage ?? '',
        }).toBytes();
        this.txb.moveCall({
            target: Protocol.Instance().entityFn('avatar_update'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('u8', [].slice.call(bytes))]
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
    query_ent(address_queried) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_ent');
        }
        this.txb.moveCall({
            target: Protocol.Instance().entityFn('QueryEnt'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        });
    }
}
//# sourceMappingURL=entity.js.map