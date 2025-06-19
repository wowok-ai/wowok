import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { FnCallType, Protocol, PassportObject, PermissionObject, TreasuryAddress, TxbObject, CoinObject, PaymentObject,
    ReceivedObject } from './protocol.js';
import { IsValidDesription, IsValidU64, IsValidAddress, IsValidArgType, IsValidArray, parseObjectType} from './utils.js'
import { Errors, ERROR}  from './exception.js'

export enum Treasury_WithdrawMode {
    PERMISSION = 0,
    GUARD_ONLY_AND_IMMUTABLE = 1,
    BOTH_PERMISSION_AND_GUARD = 2,
}

export enum Treasury_Operation {
    WITHDRAW = 1,
    DEPOSIT = 2,
    RECEIVE = 4,
}
export interface DepositParam {
    coin: CoinObject,
    index: bigint,
    remark: string,
    for_object?: string,
    for_guard?: string,
}

export interface TreasuryReceivedObject {
    id: string;
    balance: string;
    payment: string;
}

export interface TreasuryReceived {
    balance: string;
    received: TreasuryReceivedObject[];
}

export interface WithdrawItem {
    address: string,
    amount: bigint | number | string,
}
export interface WithdrawParam {
    items: WithdrawItem[],
    index: bigint | number | string,
    remark: string,
    for_object?: string,
    for_guard?: string,
    withdraw_guard?: string,
}
export class Treasury {
    protected token_type;
    protected permission ;
    protected object : TxbObject;
    protected txb;

    get_token_type() {  return this.token_type }
    get_object() { return this.object }

    static From(txb:TransactionBlock, token_type:string, permission:PermissionObject, object:TxbObject) : Treasury {
        let d = new Treasury(txb,  token_type, permission)
        d.object = Protocol.TXB_OBJECT(txb, object)
        return d
    }   

    private constructor(txb:TransactionBlock, token_type:string, permission:PermissionObject) {
        this.token_type = token_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    static New(txb:TransactionBlock, token_type:string, permission:PermissionObject, description:string, passport?:PassportObject) : Treasury {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'Treasury.New permission, bounty');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'Treasury.New.description');
        } 
        if (!IsValidArgType(token_type)) {
            ERROR(Errors.IsValidArgType, token_type);
        }
        
        let  d = new Treasury(txb, token_type, permission);
        if (passport) {
            d.object = txb.moveCall({
                target:Protocol.Instance().treasuryFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description),  Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[token_type],
            })        
        } else {
            d.object = txb.moveCall({
                target:Protocol.Instance().treasuryFn('new') as FnCallType,
                arguments:[txb.pure.string(description),  Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[token_type],
            })        
        }
        return d
    }

    launch() : TreasuryAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().treasuryFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.token_type],
        })
    }
    
    set_deposit_guard(guard?:string, passport?:PassportObject)  {
        if (guard && !IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress, 'set_deposit_guard.guard')
        }

        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.object(guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })                
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })           
            }
        } else {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.object(guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })                
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })           
            }        
        }
    }
    
    // return payment address
    deposit(param:DepositParam, passport?:PassportObject) :TransactionResult {
        if (!Protocol.IsValidObjects([param.coin])) {
            ERROR(Errors.IsValidObjects, 'deposit.param.coin')
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'deposit.param.remark')
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'deposit.param.for_object')
        }
        if (param?.for_guard && !IsValidAddress(param.for_guard)) {
            ERROR(Errors.IsValidAddress, 'deposit.param.for_guard')
        }
        if (param.index !== undefined && !IsValidU64(param.index)) {
            ERROR(Errors.InvalidParam, 'deposit.param.index')
        }

        const for_obj = this.txb.pure.option('address', param.for_object ? param.for_object: undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_forGuard_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })  
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })  
            }
        } else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit_forGuard') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })  
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('deposit') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })  
            }
        }
        
    }

    // return current balance
    receive(payment:PaymentObject, received:ReceivedObject, passport?:PassportObject) : TransactionResult {
        if (!Protocol.IsValidObjects([payment, received])) {
            ERROR(Errors.IsValidArray, 'receive.payment&received');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('receive_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, received), Protocol.TXB_OBJECT(this.txb, payment), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('receive') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, received), Protocol.TXB_OBJECT(this.txb, payment), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        }
    }
    
    // return payment address
    withdraw(param:WithdrawParam, passport?:PassportObject) : TransactionResult | undefined {
        if (param.items.length === 0) return undefined;
        if (!IsValidArray(param.items, (item:WithdrawItem) => IsValidU64(item.amount) && IsValidAddress(item.address))) {
            ERROR(Errors.IsValidArray, 'withdraw.param.items')
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw.param.remark')
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw.param.index')
        }
        if (param?.for_guard && !IsValidAddress(param.for_guard)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_guard')
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_object')
        }
        if (param?.withdraw_guard && !IsValidAddress(param.withdraw_guard)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.withdraw_guard')
        }
        if (param?.withdraw_guard && !passport) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.withdraw_guard')
        }

        const for_obj = this.txb.pure.option('address', param.for_object ?  param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (param.withdraw_guard && passport) { //@ dont need passport, use withdraw guard!
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('withdraw_useGuard_forGuard') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                        this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), 
                        for_obj, this.txb.object(param.for_guard), this.txb.object(clock), this.txb.object(param.withdraw_guard)],
                    typeArguments:[this.token_type],
                })
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('withdraw_useGuard') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                        this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), 
                        for_obj, this.txb.object(clock), this.txb.object(param.withdraw_guard)],
                    typeArguments:[this.token_type],
                })
            }
        } else {
            if (passport) {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target:Protocol.Instance().treasuryFn('withdraw_forGuard_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                            this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })
                } else {
                    return this.txb.moveCall({
                        target:Protocol.Instance().treasuryFn('withdraw_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                            this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })
                }
            } else {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target:Protocol.Instance().treasuryFn('withdraw_forGuard') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                            this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })
                } else {
                    return this.txb.moveCall({
                        target:Protocol.Instance().treasuryFn('withdraw') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                            this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })
                }
            }            
        }
    }

    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'set_description.description');
        }
    
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })    
        }
    }
    
    set_withdraw_mode(mode: Treasury_WithdrawMode, passport?: PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('withdraw_mode_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(mode), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('withdraw_mode_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(mode), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })   
        }
    }

    add_withdraw_guard(guard:string, amount:bigint, passport?:PassportObject) {
        if (!IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress, 'add_withdraw_guard.guard')
        }

        if (!IsValidU64(amount)) {
            ERROR(Errors.IsValidU64, 'add_withdraw_guard.amount')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('withdraw_guard_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.pure.u64(amount),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().treasuryFn('withdraw_guard_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.pure.u64(amount),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })    
        }
    }

    remove_withdraw_guard(guard:string[], removeall?:boolean, passport?:PassportObject) {
        if (guard.length === 0 && !removeall) return ;

        if (!IsValidArray(guard, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_withdraw_guard.guard')
        }

        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('withdraw_guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })   
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('withdraw_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })   
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('withdraw_guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })   
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().treasuryFn('withdraw_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })   
            }
        }
    }

    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects, 'change_permission.new_permission')
        }
    
        this.txb.moveCall({
            target:Protocol.Instance().treasuryFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.token_type]            
        })    
        this.permission = new_permission
    }
    static parseObjectType = (chain_type?:string) : string =>  {
        return parseObjectType(chain_type, 'treasury::Treasury<')
    }
    
    static GetTreasuryRecievedObject = async (treasury_address:string, token_type:string) : Promise<TreasuryReceived|undefined> => {
        const type = Protocol.Instance().package('wowok')+'::payment::CoinWrapper<'+token_type+'>';
        const r = await Protocol.Client().getOwnedObjects({owner:treasury_address, filter:{StructType: type}, options:{showContent:true, showType:true}});
        try {
          let receive = BigInt(0);
          const res: TreasuryReceivedObject[] = r.data.map((v:any) => {
            const i = v?.data?.content?.fields;
            receive += BigInt(i?.coin?.fields?.balance);
            return {payment:i?.payment, balance:i?.coin?.fields?.balance, id:v?.data?.objectId} 
          });

          return {balance:receive.toString(), received:res};
        } catch (e) {
          //console.log(e)
        }
    }
    static MAX_WITHDRAW_GUARD_COUNT = 16;
}

