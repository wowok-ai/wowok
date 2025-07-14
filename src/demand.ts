import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { FnCallType, Protocol, PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject, ServiceObject } from './protocol.js';
import { IsValidDesription, IsValidAddress, IsValidArgType, IsValidU64, parseObjectType, IsValidU8 } from './utils.js'
import { Errors, ERROR}  from './exception.js'

export class Demand {
    protected bounty_type;
    protected permission ;
    protected object : TxbObject;
    protected txb;

    get_bounty_type() {  return this.bounty_type }
    get_object() { return this.object }

    static From(txb:TransactionBlock, bounty_type:string, permission:PermissionObject, object:TxbObject) : Demand {
        let d = new Demand(txb,  bounty_type, permission)
        d.object = Protocol.TXB_OBJECT(txb, object)
        return d
    }   

    private constructor(txb:TransactionBlock, bounty_type:string, permission:PermissionObject) {
        this.bounty_type = bounty_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    static New(txb:TransactionBlock, bounty_type:string, ms_expand:boolean, time:number, permission:PermissionObject, description:string, 
        passport?:PassportObject) : Demand {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        } 
        if (!IsValidArgType(bounty_type)) {
            ERROR(Errors.IsValidArgType, bounty_type);
        }
        if (!IsValidU64(time)) {
            ERROR(Errors.IsValidUint, 'time')
        }
        
        let  d = new Demand(txb, bounty_type, permission);
        const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            d.object = txb.moveCall({
                target:Protocol.Instance().demandFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.pure.bool(ms_expand), txb.pure.u64(time), 
                    txb.object(clock), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[bounty_type],
            })        
        } else {
            d.object = txb.moveCall({
                target:Protocol.Instance().demandFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.pure.bool(ms_expand), txb.pure.u64(time), 
                    txb.object(clock), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[bounty_type],
            })        
        }
        return d
    }

    launch() : DemandAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().demandFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.bounty_type],
        })
    }
    
    refund(passport?:PassportObject)  {
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('refund_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })            
        }
    }
    
    // minutes_duration TRUE , time is minutes count; otherwise, the deadline time
    expand_time(minutes_duration:boolean, time: number, passport?:PassportObject) {
        if (!IsValidU64(time)) {
            ERROR(Errors.IsValidUint, `expand_time.time ${time}`);
        }
        if (minutes_duration) time = time * 1000 * 60; //@ duration minutes

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('time_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(minutes_duration),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('time_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object),  this.txb.pure.bool(minutes_duration),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })          
        }
    }
    
   set_guard(guard?:GuardObject, service_identifier?:number, passport?:PassportObject)  {  
        if (guard && !Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'guard');
        }
        if (service_identifier !== undefined && !IsValidU8(service_identifier)) {
            ERROR(Errors.InvalidParam, 'set_guard.service_identifier');
        }
        let id =  this.txb.pure.option('u8', service_identifier !== undefined ? service_identifier : undefined);

        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), id, 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })               
            }
        } else {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), id, 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.bounty_type],
                })               
            }        
        }
    }
    
    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
    
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        }
    }
    
    yes(service_address:string, passport?:PassportObject) {
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress)
        }
    
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('yes_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(service_address), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().demandFn('yes') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(service_address), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.bounty_type],
            })    
        }
    }
    
    deposit(bounty:TxbObject)  {
        if (!Protocol.IsValidObjects([bounty])) {
            ERROR(Errors.IsValidObjects)
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().demandFn('deposit') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, bounty)],
            typeArguments:[this.bounty_type],
        })    
    }
    
    present(service: ServiceObject | number, service_pay_type?:string | null, tips?:string, passport?:PassportObject) {
        tips = tips ?? '';
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'present.tips')
        }
        if (service_pay_type && !IsValidArgType(service_pay_type)) {
            ERROR(Errors.IsValidArgType, 'service_pay_type')
        }
        if (typeof(service) === 'number') {
            if (!IsValidU8(service) || !passport) {
                ERROR(Errors.IsValidU8, 'present.service or present.passport')
            }
        } else {
            if (!Protocol.IsValidObjects([service])) {
                ERROR(Errors.IsValidObjects, 'present.service')
            }
        }

        if (passport) {
            if (typeof(service) === 'number') {
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('present_with_passport2') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(tips)],
                    typeArguments:[this.bounty_type],
                })  
            } else {
                if (!service_pay_type) {
                    ERROR(Errors.InvalidParam, 'present.service_pay_type')  
                }
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('present_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, service), 
                        this.txb.pure.string(tips)],
                    typeArguments:[this.bounty_type, service_pay_type!],
                })  
            }
 
        } else {
            if (typeof(service) !== 'number') {
                if(!service_pay_type) {
                    ERROR(Errors.InvalidParam, 'present.service_pay_type')  
                }
                this.txb.moveCall({
                    target:Protocol.Instance().demandFn('present') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, service), 
                        this.txb.pure.string(tips)],
                    typeArguments:[this.bounty_type, service_pay_type!],
                })                   
            }
        } 
    }
    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
    
        this.txb.moveCall({
            target:Protocol.Instance().demandFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.bounty_type]            
        })    
        this.permission = new_permission
    }
    static parseObjectType = (chain_type?:string | null) : string =>  {
        return parseObjectType(chain_type, 'demand::Demand<')
    }

    static MAX_BOUNTY_COUNT = 300;
    static MAX_PRESENTERS_COUNT = 200;
}

