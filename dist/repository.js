import { Protocol, ValueType, RepositoryValueType, } from './protocol.js';
import { Permission } from './permission.js';
import { Bcs, array_unique, IsValidDesription, IsValidAddress, IsValidArray, IsValidName, ValueTypeConvert } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { MAX_U8, MAX_U128, MAX_U256, MAX_U64 } from './utils.js';
export var Repository_Policy_Mode;
(function (Repository_Policy_Mode) {
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_FREE"] = 0] = "POLICY_MODE_FREE";
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_STRICT"] = 1] = "POLICY_MODE_STRICT";
})(Repository_Policy_Mode || (Repository_Policy_Mode = {}));
export var Repository_Type;
(function (Repository_Type) {
    Repository_Type[Repository_Type["NORMAL"] = 0] = "NORMAL";
    Repository_Type[Repository_Type["WOWOK_GRANTEE"] = 1] = "WOWOK_GRANTEE";
    Repository_Type[Repository_Type["WOWOK_ORACLE"] = 2] = "WOWOK_ORACLE";
})(Repository_Type || (Repository_Type = {}));
export class Repository {
    get_object() { return this.object; }
    constructor(txb, permission) {
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    static From(txb, permission, object) {
        let r = new Repository(txb, permission);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return r;
    }
    static New(txb, permission, description, policy_mode = Repository_Policy_Mode.POLICY_MODE_FREE, passport) {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let r = new Repository(txb, permission);
        if (passport) {
            r.object = txb.moveCall({
                target: Protocol.Instance().repositoryFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            r.object = txb.moveCall({
                target: Protocol.Instance().repositoryFn('new'),
                arguments: [txb.pure.string(description), txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return r;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().repositoryFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    }
    add_data(data) {
        if (!Repository.IsValidName(data.key)) {
            ERROR(Errors.IsValidName, 'add_data');
        }
        let bValid = true;
        data.data.forEach((value) => {
            if (!IsValidAddress(value.address))
                bValid = false;
            if (!Repository.IsValidValue(value.bcsBytes))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'add_data');
        }
        if (data?.value_type !== undefined) {
            data.data.forEach((d) => this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(d.address),
                    this.txb.pure.string(data.key),
                    this.txb.pure.u8(data.value_type),
                    this.txb.pure.vector('u8', [...d.bcsBytes]),
                    Protocol.TXB_OBJECT(this.txb, this.permission),],
            }));
        }
        else {
            data.data.forEach((d) => this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('add_typed_data'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(d.address),
                    this.txb.pure.string(data.key),
                    this.txb.pure.vector('u8', [...d.bcsBytes]),
                    Protocol.TXB_OBJECT(this.txb, this.permission),
                ],
            }));
        }
    }
    add_data2(data) {
        if (!IsValidAddress(data.address)) {
            ERROR(Errors.IsValidAddress, 'add_data2');
        }
        let bValid = true;
        data.data.forEach((value) => {
            if (!Repository.IsValidName(value.key))
                bValid = false;
            if (!Repository.IsValidValue(value.bcsBytes))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'add_data2');
        }
        if (data?.value_type !== undefined) {
            data.data.forEach((d) => this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(data.address),
                    this.txb.pure.string(d.key),
                    this.txb.pure.u8(data.value_type),
                    this.txb.pure.vector('u8', [...d.bcsBytes]),
                    Protocol.TXB_OBJECT(this.txb, this.permission),],
            }));
        }
        else {
            data.data.forEach((d) => this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('add_typed_data'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(data.address),
                    this.txb.pure.string(d.key),
                    this.txb.pure.vector('u8', [...d.bcsBytes]),
                    Protocol.TXB_OBJECT(this.txb, this.permission),
                ],
            }));
        }
    }
    remove(address, key) {
        if (!Repository.IsValidName(key)) {
            ERROR(Errors.IsValidName);
        }
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress);
        }
        this.txb.moveCall({
            target: Protocol.Instance().repositoryFn('remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                this.txb.pure.address(address),
                this.txb.pure.string(key),
                Protocol.TXB_OBJECT(this.txb, this.permission),
            ],
        });
    }
    add_reference(references, passport) {
        if (references.length === 0)
            return;
        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_reference');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('reference_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('address', array_unique(references)),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('reference_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('address', array_unique(references)),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    remove_reference(references, removeall, passport) {
        if (references.length === 0 && !removeall)
            return;
        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_reference');
        }
        if (removeall) {
            if (passport) {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('reference_removeall_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('reference_removeall'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        }
        else {
            if (passport) {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('reference_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.vector('address', array_unique(references)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('reference_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.vector('address', array_unique(references)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        }
    }
    // add or modify the old 
    add_policies(policies, passport) {
        if (policies.length === 0)
            return;
        let bValid = true;
        policies.forEach((p) => {
            if (!IsValidDesription(p.description) || !Repository.IsValidName(p.key)) {
                bValid = false;
            }
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'policies');
        }
        policies.forEach((policy) => {
            let permission_index = this.txb.pure.option('u64', policy?.permissionIndex ? policy?.permissionIndex : undefined);
            if (passport) {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('policy_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.string(policy.key),
                        this.txb.pure.string(policy.description),
                        permission_index, this.txb.pure.u8(policy.dataType),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('policy_add'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.string(policy.key),
                        this.txb.pure.string(policy.description),
                        permission_index, this.txb.pure.u8(policy.dataType),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        });
    }
    remove_policies(policy_keys, removeall, passport) {
        if (policy_keys.length === 0)
            return;
        if (!IsValidArray(policy_keys, Repository.IsValidName)) {
            ERROR(Errors.InvalidParam, 'policy_keys');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('policy_removeall_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('policy_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.vector('string', array_unique(policy_keys)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('policy_removeall'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().repositoryFn('policy_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.vector('string', array_unique(policy_keys)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        }
    }
    rename_policy(policy_key, new_policy_key, passport) {
        if (!IsValidName(policy_key) || !IsValidName(new_policy_key)) {
            ERROR(Errors.IsValidName, 'change_policy');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('policy_rename_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(policy_key), this.txb.pure.string(new_policy_key),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('policy_rename'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(policy_key), this.txb.pure.string(new_policy_key),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    // PermissionIndex.description_set
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    set_policy_mode(policy_mode, passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('mode_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('mode_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    set_policy_description(policy, description, passport) {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('policy_description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(policy), this.txb.pure.string(description),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('policy_description_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(policy), this.txb.pure.string(description),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    set_policy_permission(policy, permission_index, passport) {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy');
        }
        let index = this.txb.pure.option('u64', undefined);
        if (permission_index !== undefined) {
            if (!Permission.IsValidPermissionIndex(permission_index)) {
                ERROR(Errors.IsValidPermissionIndex);
            }
            index = this.txb.pure.option('u64', permission_index);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('policy_permission_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), index, Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().repositoryFn('policy_permission_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), index, Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: Protocol.Instance().repositoryFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: []
        });
        this.permission = new_permission;
    }
    static rpc_de_data(fields) {
        const rep = fields?.map((v) => {
            const value = new Uint8Array(v?.data?.content?.fields?.value);
            const type = value?.length > 0 ? value[0] : null;
            var d = value.length > 0 ? value.slice(1) : Uint8Array.from([]);
            if (type === ValueType.TYPE_STRING) {
                d = Bcs.getInstance().de(ValueType.TYPE_VEC_U8, d);
                d = new TextDecoder().decode(Uint8Array.from(d));
            }
            else if (type === ValueType.TYPE_VEC_STRING) {
                d = Bcs.getInstance().de(ValueType.TYPE_VEC_VEC_U8, d);
                d = d.map((i) => {
                    return new TextDecoder().decode(Uint8Array.from(i));
                });
            }
            else {
                d = Bcs.getInstance().de(value[0], d);
                if (type === ValueType.TYPE_ADDRESS) {
                    d = '0x' + d;
                }
                else if (type === ValueType.TYPE_VEC_ADDRESS) {
                    d = d.map((v) => { return ('0x' + v); });
                }
                else if (type === ValueType.TYPE_BOOL) {
                    d = d ? 'True' : 'False';
                }
            }
            ;
            return { object: v?.data?.content?.fields?.id?.id, id: v?.data?.content?.fields?.name?.fields?.id,
                name: v?.data?.content?.fields?.name?.fields?.key,
                data: d, dataType: ValueTypeConvert(type) };
        });
        return rep;
    }
    static DataType2ValueType(data) {
        try {
            const value = BigInt(data);
            var t = ValueType.TYPE_U8;
            if (value <= MAX_U8) {
            }
            else if (value <= MAX_U64) {
                t = ValueType.TYPE_U64;
            }
            else if (value <= MAX_U128) {
                t = ValueType.TYPE_U128;
            }
            else if (value <= MAX_U256) {
                t = ValueType.TYPE_U256;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            console.log(e);
        }
        return undefined;
    }
}
Repository.MAX_POLICY_COUNT = 120;
Repository.MAX_KEY_LENGTH = 128;
Repository.MAX_VALUE_LENGTH = 204800;
Repository.MAX_REFERENCE_COUNT = 100;
Repository.IsValidName = (key) => {
    return key.length <= Repository.MAX_KEY_LENGTH && key.length != 0;
};
Repository.IsValidValue = (value) => {
    return value.length < Repository.MAX_VALUE_LENGTH;
};
Repository.ResolveRepositoryData = (dataType, data) => {
    if (dataType === RepositoryValueType.String) {
        return { type: ValueType.TYPE_STRING, data: Bcs.getInstance().ser(ValueType.TYPE_VEC_U8, new TextEncoder().encode(data.toString())) };
    }
    else if (dataType === RepositoryValueType.PositiveNumber) {
        const t = Repository.DataType2ValueType(data);
        if (!t)
            return undefined;
        return { type: t, data: Bcs.getInstance().ser(t, data) };
    }
    else if (dataType === RepositoryValueType.Address) {
        if (!IsValidAddress(data))
            return undefined;
        return { type: ValueType.TYPE_ADDRESS, data: Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, data) };
    }
    else if (dataType === RepositoryValueType.Address_Vec) {
        for (let i = 0; i < data.length; ++i) {
            if (!IsValidAddress(data[i]))
                return undefined;
        }
        return { type: ValueType.TYPE_VEC_ADDRESS, data: Bcs.getInstance().ser(ValueType.TYPE_VEC_ADDRESS, data) };
    }
    else if (dataType === RepositoryValueType.PositiveNumber_Vec) {
        let type = ValueType.TYPE_U8;
        for (let i = 0; i < data.length; ++i) {
            const t = Repository.DataType2ValueType(data);
            if (!t)
                return undefined;
            if (t > type)
                type = t;
        }
        if (type === ValueType.TYPE_U8) {
            type = ValueType.TYPE_VEC_U8;
        }
        else if (type === ValueType.TYPE_U64) {
            type = ValueType.TYPE_VEC_U64;
        }
        else if (type === ValueType.TYPE_U128) {
            type = ValueType.TYPE_VEC_U128;
        }
        else {
            type = ValueType.TYPE_VEC_U256;
        }
        return { type: type, data: Bcs.getInstance().ser(type, data) };
    }
    else if (dataType === RepositoryValueType.String_Vec) {
        const r = data.map((v) => {
            return new TextEncoder().encode(v);
        });
        return { type: ValueType.TYPE_VEC_STRING, data: Bcs.getInstance().ser(ValueType.TYPE_VEC_VEC_U8, r) };
    }
    else if (dataType === RepositoryValueType.Bool) {
        if (typeof (data) !== 'boolean')
            return undefined;
        return { type: ValueType.TYPE_BOOL, data: Bcs.getInstance().ser(ValueType.TYPE_BOOL, data) };
    }
    return undefined;
};
//# sourceMappingURL=repository.js.map