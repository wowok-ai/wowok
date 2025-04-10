import { Protocol } from './protocol.js';
import { IsValidDesription, IsValidU64, IsValidAddress, IsValidArgType, IsValidArray, parseObjectType } from './utils.js';
import { Errors, ERROR } from './exception.js';
export var Treasury_WithdrawMode;
(function (Treasury_WithdrawMode) {
    Treasury_WithdrawMode[Treasury_WithdrawMode["PERMISSION"] = 0] = "PERMISSION";
    Treasury_WithdrawMode[Treasury_WithdrawMode["GUARD_ONLY_AND_IMMUTABLE"] = 1] = "GUARD_ONLY_AND_IMMUTABLE";
    Treasury_WithdrawMode[Treasury_WithdrawMode["BOTH_PERMISSION_AND_GUARD"] = 2] = "BOTH_PERMISSION_AND_GUARD";
})(Treasury_WithdrawMode || (Treasury_WithdrawMode = {}));
export var Treasury_Operation;
(function (Treasury_Operation) {
    Treasury_Operation[Treasury_Operation["WITHDRAW"] = 1] = "WITHDRAW";
    Treasury_Operation[Treasury_Operation["DEPOSIT"] = 2] = "DEPOSIT";
    Treasury_Operation[Treasury_Operation["RECEIVE"] = 4] = "RECEIVE";
})(Treasury_Operation || (Treasury_Operation = {}));
export class Treasury {
    get_token_type() { return this.token_type; }
    get_object() { return this.object; }
    static From(txb, token_type, permission, object) {
        let d = new Treasury(txb, token_type, permission);
        d.object = Protocol.TXB_OBJECT(txb, object);
        return d;
    }
    constructor(txb, token_type, permission) {
        this.token_type = token_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    static New(txb, token_type, permission, description, passport) {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'Treasury.New permission, bounty');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'Treasury.New.description');
        }
        if (!IsValidArgType(token_type)) {
            ERROR(Errors.IsValidArgType, token_type);
        }
        let d = new Treasury(txb, token_type, permission);
        if (passport) {
            d.object = txb.moveCall({
                target: Protocol.Instance().treasuryFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [token_type],
            });
        }
        else {
            d.object = txb.moveCall({
                target: Protocol.Instance().treasuryFn('new'),
                arguments: [txb.pure.string(description), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [token_type],
            });
        }
        return d;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().treasuryFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.token_type],
        });
    }
    set_deposit_guard(guard, passport) {
        if (guard && !IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress, 'set_deposit_guard.guard');
        }
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_guard_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.object(guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_guard_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_guard_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.object(guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_guard_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
    }
    // return payment address
    deposit(param, passport) {
        if (!Protocol.IsValidObjects([param.coin])) {
            ERROR(Errors.IsValidObjects, 'deposit.param.coin');
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'deposit.param.remark');
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'deposit.param.for_object');
        }
        if (param?.for_guard && !IsValidAddress(param.for_guard)) {
            ERROR(Errors.IsValidAddress, 'deposit.param.for_guard');
        }
        if (param.index !== undefined && !IsValidU64(param.index)) {
            ERROR(Errors.InvalidParam, 'deposit.param.index');
        }
        const for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_forGuard_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit_forGuard'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('deposit'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
    }
    // return current balance
    receive(payment, received, passport) {
        if (!Protocol.IsValidObjects([payment, received])) {
            ERROR(Errors.IsValidArray, 'receive.payment&received');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('receive_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            return this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('receive'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    }
    // return payment address
    withdraw(param, passport) {
        if (param.items.length === 0)
            return undefined;
        if (!IsValidArray(param.items, (item) => IsValidU64(item.amount) && IsValidAddress(item.address))) {
            ERROR(Errors.IsValidArray, 'withdraw.param.items');
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw.param.remark');
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw.param.index');
        }
        if (param?.for_guard && !IsValidAddress(param.for_guard)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_guard');
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_object');
        }
        if (param?.withdraw_guard && !IsValidAddress(param.withdraw_guard)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.withdraw_guard');
        }
        if (param?.withdraw_guard && !passport) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.withdraw_guard');
        }
        const for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (param.withdraw_guard && passport) { //@ dont need passport, use withdraw guard!
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('withdraw_useGuard_forGuard'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v => v.address)),
                        this.txb.pure.vector('u64', param.items.map(v => v.amount)), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                        for_obj, this.txb.object(param.for_guard), this.txb.object(clock), this.txb.object(param.withdraw_guard)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                return this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('withdraw_useGuard'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v => v.address)),
                        this.txb.pure.vector('u64', param.items.map(v => v.amount)), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                        for_obj, this.txb.object(clock), this.txb.object(param.withdraw_guard)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (passport) {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target: Protocol.Instance().treasuryFn('withdraw_forGuard_with_passport'),
                        arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v => v.address)),
                            this.txb.pure.vector('u64', param.items.map(v => v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
                else {
                    return this.txb.moveCall({
                        target: Protocol.Instance().treasuryFn('withdraw_with_passport'),
                        arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v => v.address)),
                            this.txb.pure.vector('u64', param.items.map(v => v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
            }
            else {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target: Protocol.Instance().treasuryFn('withdraw_forGuard'),
                        arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v => v.address)),
                            this.txb.pure.vector('u64', param.items.map(v => v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
                else {
                    return this.txb.moveCall({
                        target: Protocol.Instance().treasuryFn('withdraw'),
                        arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v => v.address)),
                            this.txb.pure.vector('u64', param.items.map(v => v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
            }
        }
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'set_description.description');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    }
    set_withdraw_mode(mode, passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('withdraw_mode_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(mode), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('withdraw_mode_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(mode), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    }
    add_withdraw_guard(guard, amount, passport) {
        if (!IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress, 'add_withdraw_guard.guard');
        }
        if (!IsValidU64(amount)) {
            ERROR(Errors.IsValidU64, 'add_withdraw_guard.amount');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('withdraw_guard_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.pure.u64(amount),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().treasuryFn('withdraw_guard_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.pure.u64(amount),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    }
    remove_withdraw_guard(guard, removeall, passport) {
        if (guard.length === 0 && !removeall)
            return;
        if (!IsValidArray(guard, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_withdraw_guard.guard');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('withdraw_guard_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('withdraw_guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('withdraw_guard_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().treasuryFn('withdraw_guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects, 'change_permission.new_permission');
        }
        this.txb.moveCall({
            target: Protocol.Instance().treasuryFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.token_type]
        });
        this.permission = new_permission;
    }
}
Treasury.parseObjectType = (chain_type) => {
    return parseObjectType(chain_type, 'treasury::Treasury<');
};
Treasury.MAX_WITHDRAW_GUARD_COUNT = 16;
//# sourceMappingURL=treasury.js.map