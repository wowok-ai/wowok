import { Protocol } from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidArray, } from './utils.js';
import { ERROR, Errors } from './exception.js';
export const PAYMENT_MAX_RECEIVER_COUNT = 200;
export function create_payment(txb, pay_token_type, param) {
    if (!pay_token_type)
        ERROR(Errors.InvalidParam, 'Payment.New.pay_token_type');
    if (param.receiver.length > PAYMENT_MAX_RECEIVER_COUNT) {
        ERROR(Errors.InvalidParam, 'Payment.New.param.receiver');
    }
    if (!IsValidArray(param.receiver, (item) => { return IsValidAddress(item.address) && Protocol.IsValidObjects([item.coin]); })) {
        ERROR(Errors.IsValidArray, 'Payment.New.param.receiver');
    }
    if (param?.for_object && !IsValidAddress(param.for_object)) {
        ERROR(Errors.IsValidAddress, 'Payment.New.param.for_object');
    }
    if (param?.for_guard && !IsValidAddress(param.for_guard)) {
        ERROR(Errors.IsValidAddress, 'Payment.New.param.for_guard');
    }
    if (param?.business_remark && !IsValidDesription(param?.business_remark)) {
        ERROR(Errors.IsValidDesription, 'Payment.New.param.business_remark');
    }
    let obj = txb.pure.option('address', param.for_object ? param.for_object : undefined);
    const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
    if (param.for_guard) {
        return txb.moveCall({
            target: Protocol.Instance().paymentFn('create_withGuard'),
            arguments: [txb.pure.vector('address', param.receiver.map((i) => i.address)), txb.makeMoveVec({ elements: param.receiver.map((i) => i.coin) }),
                obj, txb.object(param.for_guard), txb.pure.u64(param.business_index), txb.pure.string(param.business_remark), txb.object(clock)],
            typeArguments: [pay_token_type],
        });
    }
    else {
        return txb.moveCall({
            target: Protocol.Instance().paymentFn('create'),
            arguments: [txb.pure.vector('address', param.receiver.map((i) => i.address)), txb.makeMoveVec({ elements: param.receiver.map((i) => i.coin) }),
                obj, txb.pure.u64(param.business_index), txb.pure.string(param.business_remark), txb.object(clock)],
            typeArguments: [pay_token_type],
        });
    }
}
//# sourceMappingURL=payment.js.map