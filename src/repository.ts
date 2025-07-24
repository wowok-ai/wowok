import { Protocol, FnCallType, ValueType, RepositoryValueType, RepositoryAddress, PermissionObject, PassportObject, TxbObject, GuardObject, } from './protocol.js';
import { PermissionIndexType, Permission } from './permission.js'
import { Bcs, array_unique, IsValidDesription, IsValidAddress, IsValidArray, IsValidName,  ValueTypeConvert, IsValidStringLength, uint2address} from './utils.js';
import { ERROR, Errors } from './exception.js';
import { MAX_U8, MAX_U128, MAX_U256, MAX_U64, parseObjectType } from './utils.js';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';

export enum Repository_Policy_Mode {
    POLICY_MODE_FREE = 0,
    POLICY_MODE_STRICT = 1,
}

export enum Repository_Type {
    NORMAL = 0,
    WOWOK_GRANTEE = 1,
    WOWOK_ORACLE = 2
}
export interface RepData {
    id: string;
    name: string;
    dataType: RepositoryValueType;
    data: string | string[];
    object: string;
}

export interface Repository_Policy {
    key:string;
    description: string;
    dataType: RepositoryValueType;
    permissionIndex?: PermissionIndexType | null; // PermissionIndex like, must be geater than 1000
}
export interface Repository_Policy_Data {
    key: string;
    data: Repository_Value[];  
    value_type?: ValueType; // Specifies a data type prefix; If the data prefix is already included in the data byte stream, there is no need to specify it.
}
export interface Repository_Value {
    address: string; // UID: address or objectid
    bcsBytes: Uint8Array; // BCS contents. Notice that: First Byte be the Type by caller, or specify type with 'Repository_Policy_Data.value_type' field.
}
export interface Repository_Value2 {
    key: string;
    bcsBytes: Uint8Array;
}

export interface Repository_Policy_Data2 {
    address: string;
    data: Repository_Value2[];
    value_type?: ValueType;
}

export interface Repository_Policy_Data_Remove {
    key: string;
    address: string;
}
export class Repository {
    protected permission ;
    protected object:TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock, permission:PermissionObject) {
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    static From(txb:TransactionBlock, permission:PermissionObject, object:TxbObject) : Repository {
        let r = new Repository(txb, permission);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return r
    }
    static New(txb:TransactionBlock, permission:PermissionObject, description:string, 
        policy_mode: Repository_Policy_Mode=Repository_Policy_Mode.POLICY_MODE_FREE, passport?:PassportObject) : Repository {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let r = new Repository(txb, permission);

        if (passport) {
            r.object = txb.moveCall({
                target:Protocol.Instance().repositoryFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(txb, permission)],
            })
        } else {
            r.object = txb.moveCall({
                target:Protocol.Instance().repositoryFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(txb, permission)],
            })
        }
        return r
    }

    launch() : RepositoryAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().repositoryFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
        })    
    }

    add_data(data:Repository_Policy_Data, passport?:PassportObject)  {
        if (!Repository.IsValidName(data.key)) {
            ERROR(Errors.IsValidName, 'add_data')
        }

        data.data.forEach((value) => {
            if (!IsValidAddress(value.address)) ERROR(Errors.IsValidAddress, `add_data.data.data.address ${value}` )
            if (!Repository.IsValidValue(value.bcsBytes)) ERROR(Errors.IsValidValue, `add_data.data.data.bcsBytes ${value}` )
        });
        
        if (data?.value_type !== undefined) {
            data.data.forEach((d) => {
                if (passport) {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(d.address),
                            this.txb.pure.string(data.key), 
                            this.txb.pure.u8(data.value_type!),
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })     
                } else {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(d.address),
                            this.txb.pure.string(data.key), 
                            this.txb.pure.u8(data.value_type!),
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })                    
                }
            })       
        } else {
            data.data.forEach((d) => {
                if (passport)   {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add_typed_data_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(d.address),
                            this.txb.pure.string(data.key), 
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })    
                } else {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add_typed_data') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(d.address),
                            this.txb.pure.string(data.key), 
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })                
                }
                
        })   
        }
    }

    add_data2(data:Repository_Policy_Data2, passport?:PassportObject)  {
        if (!IsValidAddress(data.address)) {
            ERROR(Errors.IsValidAddress, `add_data2.data.address ${data}`)

        }

        data.data.forEach((value) => {
            if (!Repository.IsValidName(value.key)) ERROR(Errors.IsValidName, `add_data2.data.data.key ${value}`)
            if (!Repository.IsValidValue(value.bcsBytes)) ERROR(Errors.IsValidValue, `add_data2.data.data.bcsBytes ${value}`)
        });
        
        if (data?.value_type !== undefined) {
            data.data.forEach((d) => {
                if (passport)   {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(data.address),
                            this.txb.pure.string(d.key), 
                            this.txb.pure.u8(data.value_type!),
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })    
                } else {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(data.address),
                            this.txb.pure.string(d.key), 
                            this.txb.pure.u8(data.value_type!),
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })                    
                }
            })       
        } else {
            data.data.forEach((d) => {
                if (passport)   {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add_typed_data_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(data.address),
                            this.txb.pure.string(d.key), 
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })
                } else {
                    this.txb.moveCall({
                        target:Protocol.Instance().repositoryFn('add_typed_data') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                            this.txb.pure.address(data.address),
                            this.txb.pure.string(d.key), 
                            this.txb.pure.vector('u8', [...d.bcsBytes]),
                            Protocol.TXB_OBJECT(this.txb, this.permission),
                        ],
                    })
                }
            })   
        }
    }

    remove(address:string, key:string, passport?:PassportObject)  {
        if (!Repository.IsValidName(key)) {
            ERROR(Errors.IsValidName)
        } 
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress)
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('remove_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(address),
                    this.txb.pure.string(key), 
                    Protocol.TXB_OBJECT(this.txb, this.permission),
                ],
            })      
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(address),
                    this.txb.pure.string(key), 
                    Protocol.TXB_OBJECT(this.txb, this.permission),
                ],
            })  
        }
    }

    add_reference(references:string[], passport?:PassportObject) {
        if (references.length === 0)  return;
        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_reference')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('reference_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.vector('address', array_unique(references)),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            })      
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('reference_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.vector('address', array_unique(references)),
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            })  
        }
    }
    remove_reference(references:string[], removeall?:boolean, passport?:PassportObject) {
        if (references.length === 0 && !removeall)  return

        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_reference')
        }
        
        if (removeall) {
            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('reference_removeall_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })      
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('reference_removeall') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })  
            }            
        } else {
            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('reference_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('address', array_unique(references)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })      
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('reference_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('address', array_unique(references)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })  
            }  
        }
    }
    // add or modify the old 
    add_policies(policies:Repository_Policy[], passport?:PassportObject)  {
        if (policies.length === 0) return;

        policies.forEach((p) => {
            if (!IsValidDesription(p.description)) ERROR(Errors.IsValidDesription, `add_policies.policies.description ${p}`)
            if (!Repository.IsValidName(p.key)) ERROR(Errors.IsValidName, `add_policies.policies.key ${p}`)
        });

        policies.forEach((policy) => {
            let permission_index = this.txb.pure.option('u64', policy?.permissionIndex ? policy?.permissionIndex : undefined);
            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('policy_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.string(policy.key), 
                        this.txb.pure.string(policy.description),
                        permission_index, this.txb.pure.u8(policy.dataType),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })              
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('policy_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.string(policy.key), 
                        this.txb.pure.string(policy.description),
                        permission_index, this.txb.pure.u8(policy.dataType),
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })  
            }
        });    
    }

    remove_policies(policy_keys:string[], removeall?:boolean, passport?:PassportObject)  {
        if (policy_keys.length === 0) return ;
        if (!IsValidArray(policy_keys, Repository.IsValidName)){
            ERROR(Errors.InvalidParam, 'policy_keys')
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('policy_removeall_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })    
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('policy_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('string', array_unique(policy_keys)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })                  
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('policy_removeall') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })       
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('policy_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('string', array_unique(policy_keys)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })                         
            }
        }
    }
    rename_policy(policy_key:string, new_policy_key:string, passport?:PassportObject) {
        if (!IsValidName(policy_key) || !IsValidName(new_policy_key)) {
            ERROR(Errors.IsValidName, 'change_policy')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('policy_rename_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.string(policy_key), this.txb.pure.string(new_policy_key), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            })     
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('policy_rename') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.string(policy_key), this.txb.pure.string(new_policy_key), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            })       
        }
    }

    // PermissionIndex.description_set
    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)){
            ERROR(Errors.IsValidDesription)
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)]
            }) 
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)]
            }) 
        }        
        
    }

    set_policy_mode(policy_mode:Repository_Policy_Mode, passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('mode_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('mode_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(policy_mode), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })  
        }  
    }

    set_guard(guard?:GuardObject | null, passport?:PassportObject)  {
        if (guard && !Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, `set_guard.guard ${guard}`);
        }

        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })  
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })
            }
        } else {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })  
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().repositoryFn('guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })
            }
        }  
    }

    set_policy_description(policy:string, description:string, passport?:PassportObject)  {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('policy_description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(policy), this.txb.pure.string(description), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('policy_description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(policy), this.txb.pure.string(description), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } 
    }

    set_policy_permission(policy:string, permission_index?:number, passport?:PassportObject)  {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy')
        }

        let index = this.txb.pure.option('u64', undefined);
        if (permission_index !== undefined) {
            if(!Permission.IsValidPermissionIndex(permission_index)) {
                ERROR(Errors.IsValidPermissionIndex)
            }
            index = this.txb.pure.option('u64', permission_index);
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('policy_permission_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), index, Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().repositoryFn('policy_permission_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), index, Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        }     
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().repositoryFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[]            
        })  
        this.permission = new_permission  
    }

    static MAX_POLICY_COUNT = 120;
    static MAX_KEY_LENGTH = 128;
    static MAX_VALUE_LENGTH = 204800;
    static MAX_REFERENCE_COUNT = 100;
    static MAX_POLICY_DESRIPTION_LENGTH = 256;

    static IsValidName = (key:string)  => {
        return IsValidStringLength(key, Repository.MAX_KEY_LENGTH) && key.length != 0;
    }
    static IsValidPolicyDescription(description:string) {
        return IsValidStringLength(description, Repository.MAX_POLICY_DESRIPTION_LENGTH)

    }
    static IsValidValue = (value:Uint8Array)  => {
        return value.length < Repository.MAX_VALUE_LENGTH;
    }

    static rpc_de_data(fields:any) : RepData [] {
        const rep: RepData[] = fields?.map((v:any) => {
            const value = new Uint8Array((v?.data?.content?.fields as any)?.value);
            const type = value?.length > 0 ? value[0] as ValueType : null;
            var d : any = value.length > 0 ? value.slice(1) : Uint8Array.from([]);
            if (type === ValueType.TYPE_STRING) {
                d = Bcs.getInstance().de(ValueType.TYPE_VEC_U8, d);
                d = new TextDecoder().decode(Uint8Array.from(d));
            } else if (type === ValueType.TYPE_VEC_STRING) {
                d = Bcs.getInstance().de(ValueType.TYPE_VEC_VEC_U8, d) as [];
                d = d.map((i:any) => {
                    return new TextDecoder().decode(Uint8Array.from(i));
                })
            } else {
                d = Bcs.getInstance().de(value[0], d);
                if (type === ValueType.TYPE_ADDRESS) {
                    //d = '0x' + d;
                } else if (type === ValueType.TYPE_VEC_ADDRESS) {
                    //d = d.map((v:string) => { return ('0x' + v) } );
                } else if (type === ValueType.TYPE_BOOL) {
                    d = d ? 'True' : 'False'
                }
            };
            return {object:v?.data?.content?.fields?.id?.id, id:(v?.data?.content?.fields as any)?.name?.fields?.id, 
                name:(v?.data?.content?.fields as any)?.name?.fields?.key, 
                data:d, dataType: ValueTypeConvert(type)
            }
        });
        return rep;
    }

    static DataType2ValueType(data:string | number | bigint) : ValueType | undefined {
        try {
            const value = BigInt(data);
            if (value < 0n) return;

            if (value <= MAX_U8) {
                return ValueType.TYPE_U8
            } else if (value <= MAX_U64) {
                return ValueType.TYPE_U64;
            } else if (value <= MAX_U128) {
                return ValueType.TYPE_U128;
            } else if (value <= MAX_U256) {
                return ValueType.TYPE_U256;
            } 
        } catch (e) {
            //console.log(e)
        } 
    }

    static ResolveRepositoryData = (dataType:RepositoryValueType, data:bigint | string | boolean | number | string[] | number[])
        : {type:ValueType, data: Uint8Array} | undefined =>  {
        if (dataType === RepositoryValueType.String) { 
            if (data instanceof Array) {
                ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.String but array ${data}`);
            }
            return {type: ValueType.TYPE_STRING, data: Bcs.getInstance().ser(ValueType.TYPE_STRING, data.toString())}
        } else if (dataType === RepositoryValueType.PositiveNumber) {
            if (data instanceof Array) {
                ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.PositiveNumber but array ${data}`);
            }
            const t = Repository.DataType2ValueType(data as string);
            if (!t) ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.PositiveNumber ${data}`);

            return {type:t!, data:Bcs.getInstance().ser(t!, data)}
       } else if (dataType === RepositoryValueType.Address) {
            if (typeof(data) === 'boolean') {
                ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.Address but boolean ${data}`);
            }
            if (data instanceof Array) {
                ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.Address but array ${data}`);
            }
            let addr: string |  undefined ; 
            if (typeof data === 'string') {
                addr = data as string;
            } else {
                addr = uint2address(data as number | bigint);
            }
            
            if (!IsValidAddress(addr)) ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.Address ${data}`)
            return {type:ValueType.TYPE_ADDRESS, data:Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, addr)}
       } else if (dataType === RepositoryValueType.Address_Vec) {
            if (!(data instanceof Array)) {
                ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.Address_Vec but not array ${data}`);
            }
            const addrs = [];
            for(let i = 0; i < (data as string[]).length; ++i) {
                if (!IsValidAddress((data as string[])[i])) ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.Address_Vec ${data}`);
                addrs.push((data as string[])[i]);
            }
            return {type:ValueType.TYPE_VEC_ADDRESS, data:Bcs.getInstance().ser(ValueType.TYPE_VEC_ADDRESS, addrs)}
       } else if (dataType === RepositoryValueType.PositiveNumber_Vec) {
            if (!(data instanceof Array)) ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.PositiveNumber_Vec but not array ${data}`);

            let type = ValueType.TYPE_U8;
            for(let i = 0; i < (data as string[]).length; ++i) {
                const t = Repository.DataType2ValueType(data as string);
                if (!t) ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.PositiveNumber_Vec ${data}`);
                if (t! > type) type = t!;
            }
            if (type === ValueType.TYPE_U8) { 
                type  = ValueType.TYPE_VEC_U8;
            } else if (type === ValueType.TYPE_U64) {
                type = ValueType.TYPE_VEC_U64;
            } else if (type === ValueType.TYPE_U128) {
                type = ValueType.TYPE_VEC_U128;
            } else {
                type = ValueType.TYPE_VEC_U256;
            }
            return {type:type, data:Bcs.getInstance().ser(type, data)}
       } else if (dataType === RepositoryValueType.String_Vec) {
            if (!(data instanceof Array)) ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.String_Vec but not array ${data}`);
            return {type: ValueType.TYPE_VEC_STRING, data: Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, data)}
       } else if (dataType === RepositoryValueType.Bool) {
            if (typeof(data) !== 'boolean') ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType.Bool ${data}`);
            return {type:ValueType.TYPE_BOOL, data:Bcs.getInstance().ser(ValueType.TYPE_BOOL, data)}       
       }
       ERROR(Errors.Fail, `ResolveRepositoryData resolve RepositoryValueType ${dataType}`)
    }
}

