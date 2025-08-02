
import { IsValidArray,  array_unique, IsValidTokenType, IsValidDesription, parseObjectType,
    IsValidAddress, IsValidEndpoint, IsValidU64, IsValidName,
    IsValidLocation, } from './utils.js'
import { FnCallType, GuardObject, PassportObject, PermissionObject, CoinObject, Protocol,
    TxbObject, ArbitrationAddress, OrderObject, ArbObject, PaymentAddress, TreasuryObject,
    ArbAddress} from './protocol.js';
import { ERROR, Errors } from './exception.js';
import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';

export interface VotingGuard {
    guard: GuardObject,
    voting_weight:string | number | bigint, // bigint
}

export interface Vote {
    arb: ArbObject,
    voting_guard?: GuardObject,
    agrees: number[],
}

export interface Feedback {
    arb:ArbObject,
    feedback:string, 
    indemnity?:string | number | bigint | null,  // bigint
}

export interface Dispute {
    order: OrderObject,
    order_token_type: string,
    description: string,
    votable_proposition: string[],
    fee?: CoinObject,
}

export interface WithdrawFee {
    treasury: TreasuryObject,
    index: bigint | string | number,
    remark: string,
    for_object?: string,
    for_guard?: GuardObject,
}

export class Arbitration {
    protected pay_token_type;
    protected permission;
    protected object : TxbObject;
    protected txb;

    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};

    get_pay_type() {  return this.pay_token_type }
    get_object() { return this.object }
    private constructor(txb: TransactionBlock, pay_token_type:string, permission:PermissionObject) {
        this.pay_token_type = pay_token_type
        this.txb = txb
        this.permission = permission
        this.object = ''
    }
    static From(txb: TransactionBlock, token_type:string, permission:PermissionObject, object:TxbObject) : Arbitration {
        let s = new Arbitration(txb, token_type, permission);
        s.object = Protocol.TXB_OBJECT(txb, object);
        return s
    }
    static New(txb: TransactionBlock, token_type:string, permission:PermissionObject, description:string, 
        fee:bigint|number|string, withdrawTreasury:TreasuryObject, passport?:PassportObject) : Arbitration {
        if (!Protocol.IsValidObjects([permission, withdrawTreasury])) {
            ERROR(Errors.IsValidObjects)
        }
        if (!IsValidTokenType(token_type)) {
            ERROR(Errors.IsValidTokenType, 'New.token_type') 
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidU64(fee)) {
            ERROR(Errors.IsValidU64, 'New.fee')
        }

        let pay_token_type = token_type;
        let obj = new Arbitration(txb, pay_token_type, permission);

        if (passport) {
            obj.object = txb.moveCall({
                target:Protocol.Instance().arbitrationFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.pure.u64(fee), Protocol.TXB_OBJECT(txb, withdrawTreasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        } else {
            obj.object = txb.moveCall({
                target:Protocol.Instance().arbitrationFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.pure.u64(fee), Protocol.TXB_OBJECT(txb, withdrawTreasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        }
        return obj
    }

    launch() : ArbitrationAddress  {
        return this.txb.moveCall({
            target:Protocol.Instance().arbitrationFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.pay_token_type]
        })
    }

    set_location(location:string, passport?:PassportObject) {
        if (!IsValidLocation(location)) {
            ERROR(Errors.IsValidLocation, `Arbitration.set_location.location ${location}`)
        }
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('location_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(location), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('location_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(location), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'set_description.description')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    set_fee(fee:bigint, passport?:PassportObject)  {
        if (!IsValidU64(fee)) {
            ERROR(Errors.IsValidU64, 'set_fee.fee')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('fee_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('fee_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    set_endpoint(endpoint?:string|null, passport?:PassportObject)  {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint, 'set_endpoint.endpoint')
        }
        
        if (passport) {
            if (endpoint) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('endpoint_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('endpoint_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (endpoint) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('endpoint_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('endpoint_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }

    add_voting_guard(guard: VotingGuard[], passport?:PassportObject) {
        if (guard.length === 0) return ;
        if (!IsValidArray(guard, (g:VotingGuard) => Protocol.IsValidObjects([g.guard]) && IsValidU64(g.voting_weight))) {
            ERROR(Errors.IsValidArray, 'add_voting_guard.guard')
        }
        if (passport) {
            guard.forEach(v => {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('voting_guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, v.guard), 
                        this.txb.pure.u64(v.voting_weight), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            })
        } else {
            guard.forEach(v => {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('voting_guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, v.guard), 
                        this.txb.pure.u64(v.voting_weight), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            })
        }
    }
    remove_voting_guard(guard: string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && guard.length===0)  return;
        
        if (!IsValidArray(guard, IsValidAddress)) {
            ERROR(Errors.IsValidArray,  'remove_voting_guard.guard');
        }

        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('voting_guard_removeall_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('voting_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('voting_guard_removeall') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('voting_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }

    set_guard(apply_guard?:string, passport?:PassportObject) {
        if (apply_guard && !IsValidAddress(apply_guard)) {
            ERROR(Errors.IsValidAddress, 'set_guard.apply_guard')
        }
        
        if (passport) {
            if (apply_guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('usage_guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('usage_guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (apply_guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('usage_guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('usage_guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }
    pause(pause:boolean, passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('pause_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('pause') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    vote(param:Vote, passport?:PassportObject) {
        if (param.voting_guard && !Protocol.IsValidObjects([param.voting_guard])) {
            ERROR(Errors.IsValidObjects, 'vote.param.voting_guard')
        }
        if (!IsValidArray(param.agrees, (v:number)=> IsValidU64(v) && v < Arbitration.MAX_PROPOSITION_COUNT)) {
            ERROR(Errors.IsValidArray, 'vote.param.agrees')
        }
        if (!Protocol.IsValidObjects([param.arb])) {
            ERROR(Errors.IsValidObjects, 'vote.param.arb')
        }

        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.voting_guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('vote_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, param.voting_guard), Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('vote2_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('vote') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.arb), this.txb.pure.vector('u8', param.agrees),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    arbitration(param:Feedback, passport?:PassportObject) {
        if (!IsValidDesription(param.feedback)) {
            ERROR(Errors.IsValidDesription, 'arbitration.param.feedback')
        }
        if (!Protocol.IsValidObjects([param.arb])) {
            ERROR(Errors.IsValidObjects, 'arbitration.param.arb')
        }

        if (param.indemnity && !IsValidU64(param.indemnity)) {
            ERROR(Errors.IsValidU64, 'arbitration.param.indemnity')
        }
        let ind = this.txb.pure.option('u64', param.indemnity ? param.indemnity : undefined);

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('arbitration_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, param.arb), this.txb.pure.string(param.feedback), ind, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('arbitration') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, param.arb), this.txb.pure.string(param.feedback), ind, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    withdraw_fee(arb:ArbObject, param:WithdrawFee,  passport?:PassportObject) : PaymentAddress {
        if (!Protocol.IsValidObjects([arb, param.treasury])) {
            ERROR(Errors.IsValidObjects, 'withdraw_fee.arb or treasury')
        }
        if (param?.for_guard && !Protocol.IsValidObjects([param.for_guard])) {
            ERROR(Errors.IsValidObjects, 'withdraw_fee.param.for_guard')
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw_fee.param.for_object')
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw_fee.param.remark')
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw_fee.param.index')
        }
        const for_obj = this.txb.pure.option('address', param.for_object ?  param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('withdraw_forGuard_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arb), Protocol.TXB_OBJECT(this.txb, param.treasury),
                        for_obj, Protocol.TXB_OBJECT(this.txb, param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                }) 
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('withdraw_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arb), Protocol.TXB_OBJECT(this.txb, param.treasury),
                        for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                
            }
        } else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('withdraw_forGuard') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arb), Protocol.TXB_OBJECT(this.txb, param.treasury),
                        for_obj, Protocol.TXB_OBJECT(this.txb, param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                }) 
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().arbitrationFn('withdraw') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arb), Protocol.TXB_OBJECT(this.txb, param.treasury),
                        for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                
            }
        }
    }

    set_withdrawTreasury(treasury:TreasuryObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([treasury])) {
            ERROR(Errors.IsValidObjects, 'set_withdrawTreasury.treasury')
        }
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('withdraw_treasury_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('withdraw_treasury_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    arb(param:Dispute, passport?:PassportObject) : ArbObject {
        if (!Protocol.IsValidObjects([param.order])) {
            ERROR(Errors.IsValidObjects, 'arb.param.order')
        }
        if (!IsValidTokenType(param.order_token_type)) {
            ERROR(Errors.IsValidTokenType, 'arb.param.order_token_type')
        }
        if (!IsValidDesription(param.description)) {
            ERROR(Errors.IsValidDesription, 'arb.param.description')
        }
        if (!IsValidArray(param.votable_proposition, IsValidName)) {
            ERROR(Errors.IsValidArray, 'arb.param.votable_proposition')
        }

        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (!param.fee) { //@ zero coin
            param.fee = this.txb.moveCall({
                target:Protocol.Instance().baseWowokFn('zero_coin') as FnCallType,
                arguments:[],
                typeArguments:[this.pay_token_type]
            })
        };

        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('dispute_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.order), this.txb.pure.string(param.description),
                    this.txb.pure.vector('string', array_unique(param.votable_proposition)), Protocol.TXB_OBJECT(this.txb, param.fee), this.txb.object(clock)],
                typeArguments:[this.pay_token_type, param.order_token_type]
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().arbitrationFn('dispute') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.order), this.txb.pure.string(param.description),
                    this.txb.pure.vector('string', array_unique(param.votable_proposition)), Protocol.TXB_OBJECT(this.txb, param.fee), this.txb.object(clock)],
                typeArguments:[this.pay_token_type, param.order_token_type]
            })
        }
    }

    arb_launch(arb:ArbObject) : ArbAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().arbFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, arb)],
            typeArguments:[this.pay_token_type]
        })    
    }

    dispute(param:Dispute, passport?:PassportObject) : ArbAddress {
        const arb = this.arb(param, passport);
        return this.arb_launch(arb)
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }

        this.txb.moveCall({
            target:Protocol.Instance().arbitrationFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.pay_token_type]            
        })    
        this.permission = new_permission
    }

    static parseObjectType = (chain_type:string | undefined | null) : string =>  {
        return parseObjectType(chain_type, 'arbitration::Arbitration<')
    }

    static parseArbObjectType = (chain_type:string | undefined | null) : string =>  {
        return parseObjectType(chain_type, 'arb::Arb<')
    }

    static queryArbVoted = () => {
        
    }
    static MAX_PROPOSITION_COUNT = 16;
    static MAX_VOTING_GUARD_COUNT = 16;
}