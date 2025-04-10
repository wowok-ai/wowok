import { Protocol, FnCallType, TxbObject, ResourceAddress, PermissionObject, RepositoryAddress} from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidName, IsValidArray, IsValidU64,  } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Transaction as TransactionBlock} from '@mysten/sui/transactions';

export class Wowok {

    protected object:TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object = '';
    }

    static From(txb:TransactionBlock) : Wowok {
        let r = new Wowok(txb);
        r.object = Protocol.TXB_OBJECT(txb, Protocol.Instance().objectWowok());
        return r
    }

    register_grantor(name:string, grantee_permission:PermissionObject) {
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'register_grantor');
        if (!Protocol.IsValidObjects([grantee_permission])) ERROR(Errors.IsValidObjects, 'register_grantor');
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        
        this.txb.moveCall({
            target:Protocol.Instance().wowokFn('grantor_register') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), this.txb.object(clock), 
                Protocol.TXB_OBJECT(this.txb, grantee_permission)]
        })
    }

    grantor_time_expand_1year(grantor:string) {
        if (!IsValidAddress(grantor)) ERROR(Errors.IsValidAddress, 'grantor_time_expand_1year');
        this.txb.moveCall({
            target:Protocol.Instance().wowokFn('grantor_time_expand_1year') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(grantor)]
        })
    }

    grantor_rename(new_name:string) {
        if (!IsValidName(new_name)) ERROR(Errors.IsValidName, 'grantor_rename');
        this.txb.moveCall({
            target:Protocol.Instance().wowokFn('grantor_time_expand_1year') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(new_name)]
        })
    }

    mint(amount: string, recipient: string) {
        if (!IsValidAddress(recipient)) ERROR(Errors.IsValidAddress, 'mint');
        if (!IsValidU64(amount)) ERROR(Errors.IsValidU64, 'mint');
        this.txb.moveCall({
            target:Protocol.Instance().baseWowokFn('mint') as FnCallType, //@ base package
            arguments:[Protocol.TXB_OBJECT(this.txb, Protocol.Instance().objectTreasuryCap()), this.txb.pure.u64(amount), 
                this.txb.pure.address(recipient)]
        })
    }
    oracle(description: string, permission: PermissionObject) : RepositoryAddress  {
        if (!IsValidDesription(description)) ERROR(Errors.IsValidDesription, 'oracle.description');
        if (!Protocol.IsValidObjects([permission])) ERROR(Errors.IsValidObjects, 'oracle.permission');
        return this.txb.moveCall({
            target:Protocol.Instance().wowokFn('oracle_repository') as FnCallType, //@ base package
            arguments:[Protocol.TXB_OBJECT(this.txb, Protocol.Instance().objectOracle()), this.txb.pure.string(description), 
                this.txb.object(permission)]
        })
    }
}

