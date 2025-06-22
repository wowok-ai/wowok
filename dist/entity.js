var _a;
import { Protocol } from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, Bcs } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
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
        const bytes = Bcs.getInstance().se_entInfo(info);
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
_a = Entity;
Entity.EntityData = async (address) => {
    if (IsValidAddress(address)) {
        const txb = new TransactionBlock();
        txb.moveCall({
            target: Protocol.Instance().entityFn('QueryEnt'),
            arguments: [Protocol.TXB_OBJECT(txb, Protocol.Instance().objectEntity()),
                txb.pure.address(address)]
        });
        const res = await Protocol.Client().devInspectTransactionBlock({ sender: address, transactionBlock: txb });
        if (res.results?.length === 1 && res.results[0].returnValues?.length === 1) {
            const r1 = Bcs.getInstance().de_ent(Uint8Array.from(res.results[0].returnValues[0][0]));
            return { info: Bcs.getInstance().de_entInfo(Uint8Array.from(r1.avatar)),
                resource_object: r1.resource?.some ?? undefined,
                like: r1.like, dislike: r1.dislike, address: address };
        }
    }
};
//# sourceMappingURL=entity.js.map