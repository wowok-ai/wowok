import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, } from './utils';
import { ERROR, Errors } from './exception';
export class Entity {
    object;
    protocol;
    get_object() { return this.object; }
    constructor(protocol) {
        this.protocol = protocol;
        this.object = '';
    }
    static From(protocol) {
        let r = new Entity(protocol);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), protocol.EntityObject());
        return r;
    }
    mark(resource, address, like) {
        if (!IsValidAddress(address))
            ERROR(Errors.IsValidAddress, like);
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.EntityFn(like),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, resource.get_object()), txb.pure(address, BCS.ADDRESS)]
        });
    }
    update(info) {
        if (!IsValidName(info.name))
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
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.EntityFn('avatar_update'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(JSON.stringify(info), BCS.STRING)]
        });
    }
    create_resource(description) {
        if (!IsValidDesription(description))
            ERROR(Errors.IsValidDesription, 'create_resource');
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.EntityFn('resource_create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description, BCS.STRING)]
        });
    }
    destroy_resource(resource) {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.EntityFn('resource_destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, resource.get_object())]
        });
    }
    transfer_resource(resource, new_address) {
        if (!IsValidAddress(new_address))
            ERROR(Errors.IsValidAddress, 'transfer_resource');
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.EntityFn('resource_transfer'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, resource.get_object()), txb.pure(new_address, BCS.ADDRESS)]
        });
    }
}
