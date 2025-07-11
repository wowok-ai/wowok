import { CoinObject, FnCallType, PaymentAddress, Protocol, TxbObject} from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidArray, } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Transaction as TransactionBlock} from '@mysten/sui/transactions';

export interface Payment_Receiver {
    address: string;
    coin: CoinObject;
}

export interface PaymentParam {
    receiver: Payment_Receiver[];
    business_index: bigint;
    business_remark: string;
    for_object?: string;
    for_guard?: string;
}

export const  PAYMENT_MAX_RECEIVER_COUNT = 200;
export function create_payment(txb:TransactionBlock, pay_token_type:string, param:PaymentParam) : PaymentAddress {
    if (!pay_token_type) ERROR(Errors.InvalidParam, 'Payment.New.pay_token_type');

    if (param.receiver.length > PAYMENT_MAX_RECEIVER_COUNT)  {
        ERROR(Errors.InvalidParam, 'Payment.New.param.receiver');
    }

    if (!IsValidArray(param.receiver, (item:Payment_Receiver) => { return IsValidAddress(item.address) && Protocol.IsValidObjects([item.coin])})) {
        ERROR(Errors.IsValidArray, 'Payment.New.param.receiver');
    }

    if (param?.for_object && !IsValidAddress(param.for_object)) {
        ERROR(Errors.IsValidAddress, 'Payment.New.param.for_object')
    }
    if (param?.for_guard && !IsValidAddress(param.for_guard)) {
        ERROR(Errors.IsValidAddress, 'Payment.New.param.for_guard')
    }
    if (param?.business_remark && !IsValidDesription(param?.business_remark)) {
        ERROR(Errors.IsValidDesription, 'Payment.New.param.business_remark')
    }
    
    let obj = txb.pure.option('address', param.for_object ?  param.for_object : undefined);
    const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

    if (param.for_guard) {
        return txb.moveCall({
            target:Protocol.Instance().paymentFn('create_withGuard') as FnCallType,
            arguments:[txb.pure.vector('address', param.receiver.map((i)=>i.address)), txb.makeMoveVec({elements:param.receiver.map((i)=>{ return (i.coin as any)})}), 
                obj, txb.object(param.for_guard), txb.pure.u64(param.business_index), txb.pure.string(param.business_remark), txb.object(clock)],
            typeArguments:[pay_token_type],
        })                
    } else {
        return txb.moveCall({
            target:Protocol.Instance().paymentFn('create') as FnCallType,
            arguments:[txb.pure.vector('address', param.receiver.map((i)=>i.address)), txb.makeMoveVec({elements:param.receiver.map((i)=>{ return (i.coin as any)})}), 
                obj, txb.pure.u64(param.business_index), txb.pure.string(param.business_remark), txb.object(clock)],
            typeArguments:[pay_token_type],
        })                
    }
}

export interface ReceivedBalanceObject {
    id: string; // object received.
    type: string; // coin object type.
    balance: string; // balance.
    payment: string; // payment object.
}

export interface ReceivedBalance {
    balance?: string; // total balance if toekn_type specified.
    token_type?: string; // token type for querying.
    received: ReceivedBalanceObject[];
}

// receive coins for Order, Treasury, etc...
export const GetRecievedBalanceObject = async (object_address:string, token_type?:string | undefined) : Promise<ReceivedBalance|undefined> => {
    const type = token_type ? Protocol.Instance().package('wowok')+'::payment::CoinWrapper<'+token_type+'>' : undefined;
    const r = await Protocol.Client().getOwnedObjects({owner:object_address, 
        filter:type ? {StructType: type} : undefined, options:{showContent:true, showType:true}});
    try {
        let receive = BigInt(0);
        const res: ReceivedBalanceObject[] = r.data.map((v:any) => {
            const i = v?.data?.content?.fields;
            receive += BigInt(i?.coin?.fields?.balance);
            return {payment:i?.payment, balance:i?.coin?.fields?.balance, id:v?.data?.objectId, type: i?.coin?.type} 
        });

        return {balance: token_type ? receive.toString() : undefined, received:res, token_type:token_type};
    } catch (e) {
        //console.log(e)
    }
}


    
