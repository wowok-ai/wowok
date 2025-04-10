import { Protocol, MODULES } from './protocol.js';
import { array_unique, IsValidAddress, IsValidArray, IsValidDesription, Bcs, IsValidName, IsValidU64 } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { BCS } from '@mysten/bcs';
export var PermissionIndex;
(function (PermissionIndex) {
    PermissionIndex[PermissionIndex["repository"] = 100] = "repository";
    PermissionIndex[PermissionIndex["repository_description"] = 101] = "repository_description";
    PermissionIndex[PermissionIndex["repository_mode"] = 102] = "repository_mode";
    PermissionIndex[PermissionIndex["repository_policies"] = 103] = "repository_policies";
    PermissionIndex[PermissionIndex["repository_reference"] = 104] = "repository_reference";
    PermissionIndex[PermissionIndex["service"] = 200] = "service";
    PermissionIndex[PermissionIndex["service_description"] = 201] = "service_description";
    PermissionIndex[PermissionIndex["service_sales"] = 202] = "service_sales";
    PermissionIndex[PermissionIndex["service_payee"] = 203] = "service_payee";
    PermissionIndex[PermissionIndex["service_repository"] = 204] = "service_repository";
    PermissionIndex[PermissionIndex["service_withdraw_guards"] = 205] = "service_withdraw_guards";
    PermissionIndex[PermissionIndex["service_refund_guards"] = 206] = "service_refund_guards";
    PermissionIndex[PermissionIndex["service_discount_transfer"] = 207] = "service_discount_transfer";
    PermissionIndex[PermissionIndex["service_withdraw"] = 208] = "service_withdraw";
    PermissionIndex[PermissionIndex["service_buyer_guard"] = 209] = "service_buyer_guard";
    PermissionIndex[PermissionIndex["service_machine"] = 210] = "service_machine";
    PermissionIndex[PermissionIndex["service_endpoint"] = 211] = "service_endpoint";
    PermissionIndex[PermissionIndex["service_publish"] = 212] = "service_publish";
    PermissionIndex[PermissionIndex["service_clone"] = 213] = "service_clone";
    PermissionIndex[PermissionIndex["service_customer_required"] = 214] = "service_customer_required";
    PermissionIndex[PermissionIndex["service_pause"] = 215] = "service_pause";
    PermissionIndex[PermissionIndex["service_treasury"] = 216] = "service_treasury";
    PermissionIndex[PermissionIndex["service_arbitration"] = 217] = "service_arbitration";
    PermissionIndex[PermissionIndex["demand"] = 260] = "demand";
    PermissionIndex[PermissionIndex["demand_refund"] = 261] = "demand_refund";
    PermissionIndex[PermissionIndex["demand_expand_time"] = 262] = "demand_expand_time";
    PermissionIndex[PermissionIndex["demand_guard"] = 263] = "demand_guard";
    PermissionIndex[PermissionIndex["demand_description"] = 264] = "demand_description";
    PermissionIndex[PermissionIndex["demand_yes"] = 265] = "demand_yes";
    PermissionIndex[PermissionIndex["machine"] = 600] = "machine";
    PermissionIndex[PermissionIndex["machine_description"] = 601] = "machine_description";
    PermissionIndex[PermissionIndex["machine_repository"] = 602] = "machine_repository";
    PermissionIndex[PermissionIndex["machine_clone"] = 604] = "machine_clone";
    PermissionIndex[PermissionIndex["machine_node"] = 606] = "machine_node";
    PermissionIndex[PermissionIndex["machine_endpoint"] = 608] = "machine_endpoint";
    PermissionIndex[PermissionIndex["machine_pause"] = 609] = "machine_pause";
    PermissionIndex[PermissionIndex["machine_publish"] = 610] = "machine_publish";
    PermissionIndex[PermissionIndex["progress"] = 650] = "progress";
    PermissionIndex[PermissionIndex["progress_namedOperator"] = 651] = "progress_namedOperator";
    PermissionIndex[PermissionIndex["progress_bind_task"] = 652] = "progress_bind_task";
    PermissionIndex[PermissionIndex["progress_context_repository"] = 653] = "progress_context_repository";
    PermissionIndex[PermissionIndex["progress_unhold"] = 654] = "progress_unhold";
    PermissionIndex[PermissionIndex["progress_parent"] = 655] = "progress_parent";
    PermissionIndex[PermissionIndex["treasury"] = 700] = "treasury";
    PermissionIndex[PermissionIndex["treasury_receive"] = 701] = "treasury_receive";
    PermissionIndex[PermissionIndex["treasury_deposit"] = 702] = "treasury_deposit";
    PermissionIndex[PermissionIndex["treasury_withdraw"] = 703] = "treasury_withdraw";
    PermissionIndex[PermissionIndex["treasury_descritption"] = 704] = "treasury_descritption";
    PermissionIndex[PermissionIndex["treasury_deposit_guard"] = 705] = "treasury_deposit_guard";
    PermissionIndex[PermissionIndex["treasury_withdraw_mode"] = 706] = "treasury_withdraw_mode";
    PermissionIndex[PermissionIndex["treasury_withdraw_guard"] = 707] = "treasury_withdraw_guard";
    PermissionIndex[PermissionIndex["arbitration"] = 800] = "arbitration";
    PermissionIndex[PermissionIndex["arbitration_description"] = 801] = "arbitration_description";
    PermissionIndex[PermissionIndex["arbitration_fee"] = 802] = "arbitration_fee";
    PermissionIndex[PermissionIndex["arbitration_voting_guard"] = 803] = "arbitration_voting_guard";
    PermissionIndex[PermissionIndex["arbitration_endpoint"] = 804] = "arbitration_endpoint";
    PermissionIndex[PermissionIndex["arbitration_guard"] = 805] = "arbitration_guard";
    PermissionIndex[PermissionIndex["arbitration_pause"] = 806] = "arbitration_pause";
    PermissionIndex[PermissionIndex["arbitration_vote"] = 807] = "arbitration_vote";
    PermissionIndex[PermissionIndex["arbitration_arbitration"] = 808] = "arbitration_arbitration";
    PermissionIndex[PermissionIndex["arbitration_withdraw"] = 809] = "arbitration_withdraw";
    PermissionIndex[PermissionIndex["arbitration_treasury"] = 810] = "arbitration_treasury";
    PermissionIndex[PermissionIndex["user_defined_start"] = 1000] = "user_defined_start";
})(PermissionIndex || (PermissionIndex = {}));
export const PermissionInfo = [
    { index: PermissionIndex.repository, name: 'Repository', description: 'Launch new Repository', module: MODULES.repository },
    { index: PermissionIndex.repository_description, name: 'Description', description: 'Set Repository description', module: MODULES.repository },
    { index: PermissionIndex.repository_mode, name: 'Policy mode', description: 'Set Repository mode', module: MODULES.repository },
    { index: PermissionIndex.repository_policies, name: 'Policy', description: 'Set Repository policies', module: MODULES.repository },
    { index: PermissionIndex.repository_reference, name: 'Reference', description: 'Set Repository reference', module: MODULES.repository },
    { index: PermissionIndex.service, name: 'Service', description: 'Launch new Service', module: MODULES.service },
    { index: PermissionIndex.service_description, name: 'Description', description: 'Set Service description', module: MODULES.service },
    { index: PermissionIndex.service_sales, name: 'Sales', description: 'Set Service sales items', module: MODULES.service },
    { index: PermissionIndex.service_payee, name: 'Payee', description: 'Set Service payee', module: MODULES.service },
    { index: PermissionIndex.service_repository, name: 'Repository', description: 'Set Service repositories', module: MODULES.service },
    { index: PermissionIndex.service_withdraw_guards, name: 'Withdraw Guard', description: 'Set Service withdraw guards', module: MODULES.service },
    { index: PermissionIndex.service_refund_guards, name: 'Refund Guard', description: 'Set Service refund guards', module: MODULES.service },
    { index: PermissionIndex.service_discount_transfer, name: 'Discount', description: 'Launch discounts for Service', module: MODULES.service },
    { index: PermissionIndex.service_buyer_guard, name: 'Buyer Guard', description: 'Set Guard of buying for Service', module: MODULES.service },
    { index: PermissionIndex.service_machine, name: 'Machine', description: 'Set Machine for Service', module: MODULES.service },
    { index: PermissionIndex.service_endpoint, name: 'Endpoint', description: 'Set Service endpoint', module: MODULES.service },
    { index: PermissionIndex.service_publish, name: 'Publish', description: 'Allowing the creation of Order', module: MODULES.service },
    { index: PermissionIndex.service_clone, name: 'Clone', description: 'Clone Service', module: MODULES.service },
    { index: PermissionIndex.service_customer_required, name: 'Buyer info', description: 'Set Service buyer info required', module: MODULES.service },
    { index: PermissionIndex.service_pause, name: 'Pause', description: 'Pause/Unpause Service', module: MODULES.service },
    { index: PermissionIndex.service_treasury, name: 'Treasury', description: 'Externally withdrawable treasury for compensation or rewards', module: MODULES.service },
    { index: PermissionIndex.service_arbitration, name: 'Arbitration', description: 'Add/Remove arbitration that allows refunds from orders at any time based on arbitration results', module: MODULES.service },
    { index: PermissionIndex.demand, name: 'Demand', description: 'Launch new Demand', module: MODULES.demand },
    { index: PermissionIndex.demand_refund, name: 'Refund', description: 'Refund from Demand', module: MODULES.demand },
    { index: PermissionIndex.demand_expand_time, name: 'Expand deadline', description: 'Expand Demand deadline', module: MODULES.demand },
    { index: PermissionIndex.demand_guard, name: 'Guard', description: 'Set Demand guard', module: MODULES.demand },
    { index: PermissionIndex.demand_description, name: 'Description', description: 'Set Demand description', module: MODULES.demand },
    { index: PermissionIndex.demand_yes, name: 'Yes', description: 'Pick the Deamand serice', module: MODULES.demand },
    { index: PermissionIndex.machine, name: 'Machine', description: 'Launch new Machine', module: MODULES.machine },
    { index: PermissionIndex.machine_description, name: 'Description', description: 'Set Machine description', module: MODULES.machine },
    { index: PermissionIndex.machine_repository, name: 'Repository', description: 'Set Machine repository', module: MODULES.machine },
    { index: PermissionIndex.machine_clone, name: 'Clone', description: 'Clone Machine', module: MODULES.machine },
    { index: PermissionIndex.machine_node, name: 'Node', description: 'Set Machine nodes', module: MODULES.machine },
    { index: PermissionIndex.machine_endpoint, name: 'Endpoint', description: 'Set Machine endpoint', module: MODULES.machine },
    { index: PermissionIndex.machine_pause, name: 'Pause', description: 'Pause/Unpause Machine', module: MODULES.machine },
    { index: PermissionIndex.machine_publish, name: 'Publish', description: 'Allowing the creation of Progress', module: MODULES.machine },
    { index: PermissionIndex.progress, name: 'Progress', description: 'Launch new Progress', module: MODULES.progress },
    { index: PermissionIndex.progress_namedOperator, name: 'Operator', description: 'Set Progress operators', module: MODULES.progress },
    { index: PermissionIndex.progress_bind_task, name: 'Bind', description: 'Set Progress task', module: MODULES.progress },
    { index: PermissionIndex.progress_context_repository, name: 'Repository', description: 'Set Progress repository', module: MODULES.progress },
    { index: PermissionIndex.progress_unhold, name: 'Unhold', description: 'Release Progress holdings', module: MODULES.progress },
    { index: PermissionIndex.progress_parent, name: 'Parent', description: 'Set Progress parent', module: MODULES.progress },
    { index: PermissionIndex.treasury, name: 'Treasury', description: 'Launch new Treasury', module: MODULES.treasury },
    { index: PermissionIndex.treasury_deposit, name: 'Deposit', description: 'Deposit coins', module: MODULES.treasury },
    { index: PermissionIndex.treasury_receive, name: 'Receive', description: 'Receive coins from some address sent', module: MODULES.treasury },
    { index: PermissionIndex.treasury_withdraw, name: 'Withdraw', description: 'Withdraw coins', module: MODULES.treasury },
    { index: PermissionIndex.treasury_withdraw_guard, name: 'Withdraw Guard', description: 'Add/Remove Treasury withdraw guard', module: MODULES.treasury },
    { index: PermissionIndex.treasury_withdraw_mode, name: 'Withdraw mode', description: 'Set Treasury withdraw mode', module: MODULES.treasury },
    { index: PermissionIndex.treasury_deposit_guard, name: 'Deposit Guard', description: 'Set Treasury deposit guard', module: MODULES.treasury },
    { index: PermissionIndex.treasury_descritption, name: 'Description', description: 'Set Treasury description', module: MODULES.treasury },
    { index: PermissionIndex.arbitration, name: 'Arbitration', description: 'Launch new Arbitration', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_description, name: 'Description', description: 'Set Arbitration description', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_endpoint, name: 'Endpoint', description: 'Set Arbitration endpoint', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_fee, name: 'Fee', description: 'Set Arbitration fee', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_guard, name: 'Guard', description: 'Set Guard to apply for arbitration', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_arbitration, name: 'Arbitrate', description: 'Determine the outcome of arbitration', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_pause, name: 'Pause', description: 'Allowing/forbidding the creation of Arb', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_voting_guard, name: 'Voting Guard', description: 'Add/Remove voting Guard', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_vote, name: 'Vote', description: 'Vote on the application for arbitration', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_withdraw, name: 'Withdraw', description: 'Withdraw the arbitration fee', module: MODULES.arbitration },
    { index: PermissionIndex.arbitration_treasury, name: 'Withdraw', description: 'Set Treasury that fees was collected at the time of withdrawal', module: MODULES.arbitration },
];
export class Permission {
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb, object) {
        let p = new Permission(txb);
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p;
    }
    static New(txb, description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let p = new Permission(txb);
        p.object = txb.moveCall({
            target: Protocol.Instance().permissionFn('new'),
            arguments: [txb.pure.string(description)]
        });
        return p;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().permissionFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    add_bizPermission(index, name) {
        if (!Permission.IsValidBizPermissionIndex(index)) {
            ERROR(Errors.IsValidBizPermissionIndex, 'add_bizPermission');
        }
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'add_bizPermission');
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('user_define_add'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index), this.txb.pure.string(name)]
        });
    }
    remove_bizPermission(index) {
        if (!Permission.IsValidBizPermissionIndex(index)) {
            ERROR(Errors.IsValidBizPermissionIndex, 'remove_bizPermission');
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('user_define_remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index)]
        });
    }
    transfer_permission(old_entity, new_entity) {
        if (!IsValidAddress(old_entity) || !IsValidAddress(new_entity)) {
            ERROR(Errors.IsValidAddress, 'transfer_permission');
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('change_entity'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(old_entity),
                this.txb.pure.address(new_entity)]
        });
    }
    add_entity2(entities, index) {
        if (entities.length === 0)
            return;
        if (!IsValidArray(entities, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_entity2');
        }
        if (index !== undefined) {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('add_with_index'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index),
                    this.txb.pure.vector('address', array_unique(entities))]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(entities))]
            });
        }
    }
    add_entity3(entities) {
        if (entities.length === 0)
            return;
        const e = [];
        entities.forEach((v) => {
            v.entities.forEach((p) => {
                const f = e.find((i) => i.address === p.address);
                if (f) {
                    const t = f.permissions.find((k) => k.index === v.index);
                    if (t) {
                        t.guard = p.guard;
                    }
                    else {
                        f.permissions.push({ guard: p.guard, index: v.index });
                    }
                }
                else {
                    e.push({ address: p.address, permissions: [{ guard: p.guard, index: v.index }] });
                }
            });
        });
        this.add_entity(e);
    }
    add_entity(entities) {
        if (entities.length === 0)
            return;
        let bValid = true;
        entities.forEach((v) => {
            if (!IsValidAddress(v.address))
                bValid = false;
            v.permissions.forEach((p) => {
                if (!Permission.IsValidPermissionIndex(p.index))
                    bValid = false;
                if (p?.guard && !Protocol.IsValidObjects([p.guard]))
                    bValid = false;
            });
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'add_entity.entities');
        }
        let guards = [];
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let indexes = [];
            for (let j = 0; j < entity.permissions.length; j++) {
                let index = entity.permissions[j];
                if (!Permission.IsValidPermissionIndex(index.index)) {
                    continue;
                }
                if (!indexes.includes(index.index)) {
                    indexes.push(index.index);
                    if (index?.guard) {
                        guards.push({ address: entity.address, index: index.index, guard: index.guard });
                    }
                }
            }
            if (indexes.length > 0) {
                this.txb.moveCall({
                    target: Protocol.Instance().permissionFn('add_batch'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity.address),
                        this.txb.pure.vector('u64', indexes)]
                });
            }
        }
        // set guards
        guards.forEach(({ address, index, guard }) => {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('guard_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address),
                    this.txb.pure.u64(index), Protocol.TXB_OBJECT(this.txb, guard)]
            });
        });
    }
    // guard: undefine to set none
    set_guard(address, index, guard) {
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'address');
        }
        if (!Permission.IsValidPermissionIndex(index) && !Permission.IsValidBizPermissionIndex(index)) {
            ERROR(Errors.IsValidPermissionIndex, 'index');
        }
        if (guard) {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('guard_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address),
                    this.txb.pure.u64(index), Protocol.TXB_OBJECT(this.txb, guard)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('guard_none'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address),
                    this.txb.pure.u64(index)]
            });
        }
        ;
    }
    remove_index(address, index) {
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress);
        }
        if (index.length === 0)
            return;
        if (!(IsValidArray(index, Permission.IsValidPermissionIndex))) {
            ERROR(Errors.InvalidParam, 'index');
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('remove_index'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address),
                this.txb.pure.vector('u64', array_unique(index))]
        });
    }
    remove_entity(address) {
        if (address.length === 0)
            return;
        if (!IsValidArray(address, IsValidAddress)) {
            ERROR(Errors.IsValidArray);
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(address))]
        });
    }
    set_description(description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('description_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description)]
        });
    }
    add_admin(admin) {
        if (admin.length === 0)
            return;
        if (!IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray);
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('admin_add_batch'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(admin))]
        });
    }
    remove_admin(admin, removeall) {
        if (!removeall && admin.length === 0)
            return;
        if (!IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'admin');
        }
        if (removeall) {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('admins_clear'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
            });
        }
        else if (admin) {
            this.txb.moveCall({
                target: Protocol.Instance().permissionFn('admin_remove_batch'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(admin))]
            });
        }
    }
    change_owner(new_owner) {
        if (!IsValidAddress(new_owner)) {
            ERROR(Errors.IsValidAddress);
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('builder_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(new_owner)]
        });
    }
    // query all permissions for address
    query_permissions_all(address_queried) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_permissions');
        }
        this.txb.moveCall({
            target: Protocol.Instance().permissionFn('query_permissions_all'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        });
    }
    QueryPermissions(permission, address_queried, onPermissionAnswer, sender) {
        //@ be the same txb
        this.query_permissions_all(address_queried);
        //console.log(address_queried)
        Protocol.Client().devInspectTransactionBlock({ sender: sender ?? address_queried, transactionBlock: this.txb }).then((res) => {
            if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 2) {
                onPermissionAnswer({ who: address_queried, object: permission });
                return;
            }
            const perm = Bcs.getInstance().de(BCS.U8, Uint8Array.from(res.results[0].returnValues[0][0]));
            if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
                onPermissionAnswer({ who: address_queried, admin: true, owner: perm % 2 === 1, items: [], object: permission });
            }
            else {
                const perms = Bcs.getInstance().de_perms(Uint8Array.from(res.results[0].returnValues[1][0]));
                onPermissionAnswer({ who: address_queried, admin: false, owner: perm % 2 === 1, items: perms.map((v) => {
                        return { query: v?.index, permission: true, guard: v?.guard };
                    }), object: permission });
            }
        }).catch((e) => {
            console.log(e);
            onPermissionAnswer({ who: address_queried, object: permission });
        });
    }
    static HasPermission(answer, index, bStrict = false) {
        if (answer) {
            if (answer.admin)
                return { has: true, owner: answer.owner }; // admin
            let i = answer.items?.find((v) => v.query == index); // index maybe string, so ==
            if (i) {
                return { has: i.permission, guard: i.guard, owner: answer.owner };
            }
            else {
                return { has: false, guard: undefined, owner: answer?.owner };
            }
        }
        if (bStrict) {
            return { has: false, guard: undefined, owner: false };
        }
        return undefined; // basic: !== false ; otherwise: !
    }
}
Permission.MAX_ADMIN_COUNT = 64;
Permission.MAX_ENTITY_COUNT = 2000;
Permission.MAX_PERMISSION_INDEX_COUNT = 200;
Permission.MAX_PERSONAL_PERMISSION_COUNT = 200;
Permission.PERMISSION_NORMAL = 0;
Permission.PERMISSION_OWNER = 1;
Permission.PERMISSION_ADMIN = 2;
Permission.PERMISSION_OWNER_AND_ADMIN = 3;
Permission.BUSINESS_PERMISSIONS_START = PermissionIndex.user_defined_start;
Permission.IsValidBizPermissionIndex = (index) => {
    return index >= Permission.BUSINESS_PERMISSIONS_START && IsValidU64(index);
};
Permission.IsValidPermissionIndex = (index) => {
    //console.log(index)
    if (Object.values(PermissionIndex).includes(index)) {
        return true;
    }
    //console.log(Object.keys(PermissionIndex))
    return Permission.IsValidBizPermissionIndex(index);
};
//# sourceMappingURL=permission.js.map