import { GuardObject, PassportObject, PermissionObject, CoinObject, TxbObject, ArbitrationAddress, OrderObject, ArbObject, PaymentAddress, TreasuryObject, ArbAddress } from './protocol.js';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export interface VotingGuard {
    guard: GuardObject;
    voting_weight: string | number | bigint;
}
export interface Vote {
    arb: ArbObject;
    voting_guard?: GuardObject;
    agrees: number[];
}
export interface Feedback {
    arb: ArbObject;
    feedback: string;
    indemnity?: string | number | bigint;
}
export interface Dispute {
    order: OrderObject;
    order_token_type: string;
    description: string;
    votable_proposition: string[];
    fee?: CoinObject;
}
export interface WithdrawFee {
    treasury: TreasuryObject;
    index: bigint | string | number;
    remark: string;
    for_object?: string;
    for_guard?: GuardObject;
}
export declare class Arbitration {
    protected pay_token_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_pay_type(): string;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, token_type: string, permission: PermissionObject, object: TxbObject): Arbitration;
    static New(txb: TransactionBlock, token_type: string, permission: PermissionObject, description: string, fee: bigint | number | string, withdrawTreasury: TreasuryObject, passport?: PassportObject): Arbitration;
    launch(): ArbitrationAddress;
    set_description(description: string, passport?: PassportObject): void;
    set_fee(fee: bigint, passport?: PassportObject): void;
    set_endpoint(endpoint?: string, passport?: PassportObject): void;
    add_voting_guard(guard: VotingGuard[], passport?: PassportObject): void;
    remove_voting_guard(guard: string[], removeall?: boolean, passport?: PassportObject): void;
    set_guard(apply_guard?: string, passport?: PassportObject): void;
    pause(pause: boolean, passport?: PassportObject): void;
    vote(param: Vote, passport?: PassportObject): void;
    arbitration(param: Feedback, passport?: PassportObject): void;
    withdraw_fee(arb: ArbObject, param: WithdrawFee, passport?: PassportObject): PaymentAddress;
    set_withdrawTreasury(treasury: TreasuryObject, passport?: PassportObject): void;
    arb(param: Dispute, passport?: PassportObject): ArbObject;
    arb_launch(arb: ArbObject): ArbAddress;
    dispute(param: Dispute, passport?: PassportObject): ArbAddress;
    change_permission(new_permission: PermissionObject): void;
    static parseObjectType: (chain_type: string | undefined | null) => string;
    static parseArbObjectType: (chain_type: string | undefined | null) => string;
    static queryArbVoted: () => void;
    static MAX_PROPOSITION_COUNT: number;
    static MAX_VOTING_GUARD_COUNT: number;
}
//# sourceMappingURL=arbitration.d.ts.map