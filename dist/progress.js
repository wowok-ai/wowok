var _a;
import { Protocol } from './protocol.js';
import { Machine } from './machine.js';
import { array_unique, IsValidName, IsValidAddress, IsValidArray, IsValidInt, IsValidDesription, IsValidTokenType } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Transaction as TransactionBlock, } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
export class Progress {
    get_object() { return this.object; }
    constructor(txb, machine, permission) {
        this.permission = permission;
        this.txb = txb;
        this.machine = machine;
        this.object = '';
    }
    static From(txb, machine, permission, object) {
        let p = new _a(txb, machine, permission);
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p;
    }
    static New(txb, machine, permission, task, passport) {
        if (!Protocol.IsValidObjects([machine, permission])) {
            ERROR(Errors.IsValidObjects, 'machine & permission');
        }
        let p = new _a(txb, machine, permission);
        let t = txb.pure.option('address', task ? task : undefined);
        if (passport) {
            p.object = txb.moveCall({
                target: Protocol.Instance().progressFn('new_with_passport'),
                arguments: [passport, t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            p.object = txb.moveCall({
                target: Protocol.Instance().progressFn('new'),
                arguments: [t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return p;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().progressFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    }
    set_namedOperator(name, addresses, passport) {
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'name');
        }
        if (name === Machine.OPERATOR_ORDER_PAYER) {
            ERROR(Errors.InvalidParam, 'name cannot be ' + Machine.OPERATOR_ORDER_PAYER);
        }
        if (addresses.length > _a.MAX_NAMED_OPERATOR_COUNT || !IsValidArray(addresses, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'addresses');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('namedOperator_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', array_unique(addresses)),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('namedOperator_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', array_unique(addresses)),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    bind_task(task_address, passport) {
        if (!IsValidAddress(task_address)) {
            ERROR(Errors.IsValidAddress);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('task_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(task_address), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('task_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(task_address),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    set_context_repository(repository, passport) {
        if (repository && !Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository');
        }
        if (passport) {
            if (repository) {
                this.txb.moveCall({
                    target: Protocol.Instance().progressFn('context_repository_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository),
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().progressFn('context_repository_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
        else {
            if (repository) {
                this.txb.moveCall({
                    target: Protocol.Instance().progressFn('context_repository_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository),
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().progressFn('context_repository_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
    }
    unhold(next, passport) {
        if (!_a.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'unhold');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('unhold_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('unhold'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.pure.string(next.next_node_name), this.txb.pure.string(next.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
    }
    parent_none(passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('parent_none_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('parent_none'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    parent(parent, passport) {
        if (!IsValidAddress(parent.parent_id) || !IsValidInt(parent.parent_session_id)) {
            ERROR(Errors.InvalidParam, 'parent');
        }
        if (!parent.operation.next_node_name || !parent.operation.forward) {
            ERROR(Errors.InvalidParam, 'parent');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('parent_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.object(parent.parent_id),
                    this.txb.pure.u64(parent.parent_session_id),
                    this.txb.pure.string(parent.operation.next_node_name),
                    this.txb.pure.string(parent.operation.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().progressFn('parent_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.object(parent.parent_id),
                    this.txb.pure.u64(parent.parent_session_id),
                    this.txb.pure.string(parent.operation.next_node_name),
                    this.txb.pure.string(parent.operation.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    deliverable(deliverable) {
        if (!IsValidDesription(deliverable.msg)) {
            ERROR(Errors.IsValidDesription, 'deliverable.msg');
        }
        if (deliverable.orders.length > 0 && !Protocol.IsValidObjects(deliverable.orders.map(v => v.object))) {
            ERROR(Errors.IsValidObjects, 'deliverable.orders');
        }
        const d = this.txb.moveCall({
            target: Protocol.Instance().progressFn('deliverable_new'),
            arguments: [this.txb.pure.string(deliverable.msg)],
        });
        deliverable.orders.forEach(v => {
            if (!IsValidTokenType(v.pay_token_type)) {
                ERROR(Errors.IsValidTokenType, 'deliverable.orders:' + v.object);
            }
            this.txb.moveCall({
                target: Protocol.Instance().orderFn('as_deliverable'),
                arguments: [Protocol.TXB_OBJECT(this.txb, v.object), d],
                typeArguments: [v.pay_token_type]
            });
        });
        return d;
    }
    next(next, deliverable, passport) {
        if (!_a.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next');
        }
        const d = this.deliverable(deliverable);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target: Protocol.Instance().progressFn('next_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), d,
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
        else {
            return this.txb.moveCall({
                target: Protocol.Instance().progressFn('next'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), d, Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
    }
    hold(next, hold) {
        if (!_a.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'hold');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        return this.txb.moveCall({
            target: Protocol.Instance().progressFn('hold'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                this.txb.pure.string(next.forward), this.txb.pure.bool(hold), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
        });
    }
}
_a = Progress;
Progress.QueryForwardGuard = async (progress, machine, sender, next_node, forward) => {
    if (!progress || !machine || !next_node || !forward) { // prior_node maybe ''
        ERROR(Errors.InvalidParam, 'QueryForwardGuard');
        return;
    }
    const txb = new TransactionBlock();
    txb.moveCall({
        target: Protocol.Instance().progressFn('query_guard'),
        arguments: [Protocol.TXB_OBJECT(txb, progress), Protocol.TXB_OBJECT(txb, machine),
            txb.pure.string(next_node), txb.pure.string(forward)],
    });
    const res = await Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: txb });
    if (res.results?.length === 1 && res.results[0].returnValues?.length === 1) {
        const guard = bcs.option(bcs.Address).parse(Uint8Array.from(res.results[0].returnValues[0][0]));
        return guard ?? undefined;
    }
};
Progress.DeSessions = (session) => {
    let sessions = [];
    session?.fields?.contents?.forEach((v) => {
        var s = { next_node: v.fields.key, holders: [], weights: v.fields.value.fields.weights, threshold: v.fields.value.fields.threshold };
        v.fields.value.fields.forwards.fields.contents.forEach((i) => {
            s.holders.push({ forward: i.fields.key, accomplished: i.fields.value.fields.accomplished, time: i.fields.value.fields.time,
                who: i.fields.value.fields.who, deliverable: { msg: i.fields.value.fields.msg, orders: i.fields.value.fields.orders ?? [] },
            });
        });
        sessions.push(s);
    });
    return sessions;
};
Progress.DeHistories = (fields) => {
    return fields?.map((v) => {
        return _a.DeHistory(v?.data?.content?.fields);
    });
};
Progress.DeHistory = (data) => {
    return { id: parseInt(data?.name), node: data?.value?.fields?.node, next_node: data?.value?.fields?.next_node,
        sessions: _a.DeSessions(data?.value.fields?.session), time: data?.value?.fields?.time
    };
};
Progress.MAX_NAMED_OPERATOR_COUNT = 20;
Progress.MAX_DELEVERABLE_ORDER_COUNT = 20;
Progress.IsValidProgressNext = (next) => {
    return IsValidName(next.forward) && IsValidName(next.next_node_name);
};
//# sourceMappingURL=progress.js.map