import { CoinObject, PaymentAddress } from './protocol.js';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
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
export declare const PAYMENT_MAX_RECEIVER_COUNT = 200;
export declare function create_payment(txb: TransactionBlock, pay_token_type: string, param: PaymentParam): PaymentAddress;
//# sourceMappingURL=payment.d.ts.map