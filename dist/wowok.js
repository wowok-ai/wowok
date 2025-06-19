import { Protocol } from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, IsValidU64, } from './utils.js';
import { ERROR, Errors } from './exception.js';
export class Wowok {
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb) {
        let r = new Wowok(txb);
        r.object = Protocol.TXB_OBJECT(txb, Protocol.Instance().objectWowok());
        return r;
    }
    register_grantor(name, grantee_permission) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'register_grantor');
        if (!Protocol.IsValidObjects([grantee_permission]))
            ERROR(Errors.IsValidObjects, 'register_grantor');
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        this.txb.moveCall({
            target: Protocol.Instance().wowokFn('grantor_register'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), this.txb.object(clock),
                Protocol.TXB_OBJECT(this.txb, grantee_permission)]
        });
    }
    grantor_time_expand_1year(grantor) {
        if (!IsValidAddress(grantor))
            ERROR(Errors.IsValidAddress, 'grantor_time_expand_1year');
        this.txb.moveCall({
            target: Protocol.Instance().wowokFn('grantor_time_expand_1year'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(grantor)]
        });
    }
    grantor_rename(new_name) {
        if (!IsValidName(new_name))
            ERROR(Errors.IsValidName, 'grantor_rename');
        this.txb.moveCall({
            target: Protocol.Instance().wowokFn('grantor_time_expand_1year'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(new_name)]
        });
    }
    mint(amount, recipient) {
        if (!IsValidAddress(recipient))
            ERROR(Errors.IsValidAddress, 'mint');
        if (!IsValidU64(amount))
            ERROR(Errors.IsValidU64, 'mint');
        this.txb.moveCall({
            target: Protocol.Instance().baseWowokFn('mint'), //@ base package
            arguments: [Protocol.TXB_OBJECT(this.txb, Protocol.Instance().objectTreasuryCap()), this.txb.pure.u64(amount),
                this.txb.pure.address(recipient)]
        });
    }
    oracle(description, permission) {
        if (!IsValidDesription(description))
            ERROR(Errors.IsValidDesription, 'oracle.description');
        if (!Protocol.IsValidObjects([permission]))
            ERROR(Errors.IsValidObjects, 'oracle.permission');
        return this.txb.moveCall({
            target: Protocol.Instance().wowokFn('oracle_repository'), //@ base package
            arguments: [Protocol.TXB_OBJECT(this.txb, Protocol.Instance().objectOracle()), this.txb.pure.string(description),
                Protocol.TXB_OBJECT(this.txb, permission)]
        });
    }
}
//# sourceMappingURL=wowok.js.map