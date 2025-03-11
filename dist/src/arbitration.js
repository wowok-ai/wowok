import { IsValidArray, array_unique, IsValidTokenType, IsValidDesription, parseObjectType, IsValidAddress, IsValidEndpoint, IsValidU64, IsValidName, } from './utils';
import { Protocol } from './protocol';
import { ERROR, Errors } from './exception';
export class Arbitration {
    pay_token_type;
    permission;
    object;
    txb;
    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};
    get_pay_type() { return this.pay_token_type; }
    get_object() { return this.object; }
    constructor(txb, pay_token_type, permission) {
        this.pay_token_type = pay_token_type;
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    static From(txb, token_type, permission, object) {
        let s = new Arbitration(txb, token_type, permission);
        s.object = Protocol.TXB_OBJECT(txb, object);
        return s;
    }
    static New(txb, token_type, permission, description, fee, withdrawTreasury, passport) {
        if (!Protocol.IsValidObjects([permission, withdrawTreasury])) {
            ERROR(Errors.IsValidObjects);
        }
        if (!IsValidTokenType(token_type)) {
            ERROR(Errors.IsValidTokenType, 'New.token_type');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (!IsValidU64(fee)) {
            ERROR(Errors.IsValidU64, 'New.fee');
        }
        let pay_token_type = token_type;
        let obj = new Arbitration(txb, pay_token_type, permission);
        if (passport) {
            obj.object = txb.moveCall({
                target: Protocol.Instance().arbitrationFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), txb.pure.u64(fee), txb.object(withdrawTreasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        else {
            obj.object = txb.moveCall({
                target: Protocol.Instance().arbitrationFn('new'),
                arguments: [txb.pure.string(description), txb.pure.u64(fee), txb.object(withdrawTreasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        return obj;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().arbitrationFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.pay_token_type]
        });
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'set_description.description');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_fee(fee, passport) {
        if (!IsValidU64(fee)) {
            ERROR(Errors.IsValidU64, 'set_fee.fee');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('fee_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('fee_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_endpoint(endpoint, passport) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint, 'set_endpoint.endpoint');
        }
        if (passport) {
            if (endpoint) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('endpoint_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('endpoint_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (endpoint) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('endpoint_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('endpoint_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    add_voting_guard(guard, passport) {
        if (guard.length === 0)
            return;
        if (!IsValidArray(guard, (g) => Protocol.IsValidObjects([g.guard]) && IsValidU64(g.voting_weight))) {
            ERROR(Errors.IsValidArray, 'add_voting_guard.guard');
        }
        if (passport) {
            guard.forEach(v => {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('voting_guard_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(v.guard),
                        this.txb.pure.u64(v.voting_weight), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            });
        }
        else {
            guard.forEach(v => {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('voting_guard_add'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(v.guard),
                        this.txb.pure.u64(v.voting_weight), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            });
        }
    }
    remove_voting_guard(guard, removeall, passport) {
        if (!removeall && guard.length === 0)
            return;
        if (!IsValidArray(guard, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_voting_guard.guard');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('voting_guard_removeall_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('voting_guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('voting_guard_removeall'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('voting_guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    set_guard(apply_guard, passport) {
        if (apply_guard && !IsValidAddress(apply_guard)) {
            ERROR(Errors.IsValidAddress, 'set_guard.apply_guard');
        }
        if (passport) {
            if (apply_guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('usage_guard_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('usage_guard_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (apply_guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('usage_guard_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('usage_guard_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    pause(pause, passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('pause_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('pause'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    vote(param, passport) {
        if (param.voting_guard && !Protocol.IsValidObjects([param.voting_guard])) {
            ERROR(Errors.IsValidObjects, 'vote.param.voting_guard');
        }
        if (!IsValidArray(param.agrees, (v) => IsValidU64(v) && v < Arbitration.MAX_PROPOSITION_COUNT)) {
            ERROR(Errors.IsValidArray, 'vote.param.agrees');
        }
        if (!Protocol.IsValidObjects([param.arb])) {
            ERROR(Errors.IsValidObjects, 'vote.param.arb');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.voting_guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('vote_with_passport'),
                    arguments: [passport, this.txb.object(param.voting_guard), Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('vote2_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('vote'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    arbitration(param, passport) {
        if (!IsValidDesription(param.feedback)) {
            ERROR(Errors.IsValidDesription, 'arbitration.param.feedback');
        }
        if (!Protocol.IsValidObjects([param.arb])) {
            ERROR(Errors.IsValidObjects, 'arbitration.param.arb');
        }
        if (param.indemnity && !IsValidU64(param.indemnity)) {
            ERROR(Errors.IsValidU64, 'arbitration.param.indemnity');
        }
        let ind = this.txb.pure.option('u64', param.indemnity ? param.indemnity : undefined);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('arbitration_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(param.arb), this.txb.pure.string(param.feedback), ind, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('arbitration'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(param.arb), this.txb.pure.string(param.feedback), ind, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    withdraw_fee(arb, param, passport) {
        if (!Protocol.IsValidObjects([arb, param.treasury])) {
            ERROR(Errors.IsValidObjects, 'withdraw_fee.arb or treasury');
        }
        if (param?.for_guard && !Protocol.IsValidObjects([param.for_guard])) {
            ERROR(Errors.IsValidObjects, 'withdraw_fee.param.for_guard');
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw_fee.param.for_object');
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw_fee.param.remark');
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw_fee.param.index');
        }
        const for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('withdraw_forGuard_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.object(param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('withdraw_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('withdraw_forGuard'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.object(param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('withdraw'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    set_withdrawTreasury(treasury, passport) {
        if (!Protocol.IsValidObjects([treasury])) {
            ERROR(Errors.IsValidObjects, 'set_withdrawTreasury.treasury');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('withdraw_treasury_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().arbitrationFn('withdraw_treasury_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    dispute(param, passport) {
        if (!Protocol.IsValidObjects([param.order])) {
            ERROR(Errors.IsValidObjects, 'dispute.param.order');
        }
        if (!IsValidTokenType(param.order_token_type)) {
            ERROR(Errors.IsValidTokenType, 'dispute.param.order_token_type');
        }
        if (!IsValidDesription(param.description)) {
            ERROR(Errors.IsValidDesription, 'dispute.param.description');
        }
        if (!IsValidArray(param.votable_proposition, IsValidName)) {
            ERROR(Errors.IsValidArray, 'dispute.param.votable_proposition');
        }
        if (passport) {
            if (param.fee) {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('dispute_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', array_unique(param.votable_proposition)), this.txb.object(param.fee)],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('free_dispute_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', array_unique(param.votable_proposition))],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
        }
        else {
            if (param.fee) {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('dispute'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', array_unique(param.votable_proposition)), this.txb.object(param.fee)],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().arbitrationFn('free_dispute'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', array_unique(param.votable_proposition))],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: Protocol.Instance().arbitrationFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.pay_token_type]
        });
        this.permission = new_permission;
    }
    static parseObjectType = (chain_type) => {
        return parseObjectType(chain_type, 'arbitration::Arbitration<');
    };
    static parseArbObjectType = (chain_type) => {
        return parseObjectType(chain_type, 'arb::Arb<');
    };
    static queryArbVoted = () => {
    };
    static MAX_PROPOSITION_COUNT = 16;
    static MAX_VOTING_GUARD_COUNT = 16;
}
