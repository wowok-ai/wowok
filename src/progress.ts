
import { FnCallType, PermissionObject, RepositoryObject, PassportObject, MachineObject, 
    ProgressObject, ProgressAddress, Protocol, TxbObject,
    OrderObject} from './protocol.js';
import { Machine } from './machine.js';
import { Bcs, array_unique,IsValidName, IsValidAddress, IsValidArray, IsValidInt, IsValidDesription, IsValidTokenType  } from './utils.js'
import { ERROR, Errors } from './exception.js';
import { type TransactionResult, Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs'

export interface OrderWrap {
    object: OrderObject;
    pay_token_type: string;
}

export interface Deliverable {
    msg: string;
    orders: OrderWrap[];
}

export type ProgressNext = {
    next_node_name: string;
    forward: string;
}

export type ParentProgress = {
    parent_id: string;
    parent_session_id: number;
    operation: ProgressNext;
}

export type CurrentSessionId = TransactionResult;
export interface Holder {
    forward: string;
    who?:string;
    deliverable: Deliverable;
    accomplished:boolean;
    time: string;
}
export interface Session {
    id?: number; // sid
    next_node: string;
    holders: Holder[];
    weights: number;
    threshold: number;
    node?:string;
    bComplete?: boolean;
}

export interface History {
    id: number;  // sid
    node: string;
    next_node: string;
    time: string;
    sessions: Session[];
}
export class Progress {
    protected permission ;
    protected machine;
    protected object : TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject) {
        this.permission = permission;
        this.txb = txb;
        this.machine = machine;
        this.object = '';
    }
    static From(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, object:TxbObject) : Progress{
        let p = new Progress(txb, machine, permission)
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p
    }
    static New(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, task?:string | null, passport?:PassportObject) : Progress {
        if (!Protocol.IsValidObjects([machine, permission])) {
            ERROR(Errors.IsValidObjects, 'machine & permission')
        }

        let p = new Progress(txb, machine, permission);
        let t = txb.pure.option('address', task ? task : undefined);

        if (passport) {
            p.object = txb.moveCall({
                target:Protocol.Instance().progressFn('new_with_passport') as FnCallType,
                arguments: [passport, t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            })    
        } else {
            p.object = txb.moveCall({
                target:Protocol.Instance().progressFn('new') as FnCallType,
                arguments: [t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            })    
        }
        return p
    }

    launch() : ProgressAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().progressFn('create') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        })   
    }

    set_namedOperator(name:string, addresses:string[], passport?:PassportObject)  {
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'name')
        }
        if (name === Machine.OPERATOR_ORDER_PAYER) {
            ERROR(Errors.InvalidParam, 'name cannot be '+Machine.OPERATOR_ORDER_PAYER);
        }
        if (addresses.length > Progress.MAX_NAMED_OPERATOR_COUNT || !IsValidArray(addresses, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'addresses')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('namedOperator_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.pure.vector('address', array_unique(addresses)), 
                Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('namedOperator_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), 
                    this.txb.pure.vector('address', array_unique(addresses)), 
                Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        }  
    }

    bind_task(task_address:string, passport?:PassportObject)  {
        if (!IsValidAddress(task_address)) {
            ERROR(Errors.IsValidAddress)
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('task_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.address(task_address), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('task_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(task_address), 
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })   
        } 
    }
    set_context_repository(repository?:RepositoryObject, passport?:PassportObject)  {
        if (repository && !Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository')
        }

        if (passport) {
            if (repository) {
                this.txb.moveCall({
                    target:Protocol.Instance().progressFn('context_repository_set_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), 
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().progressFn('context_repository_none_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })           
            }
        } else {
            if (repository) {
                this.txb.moveCall({
                    target:Protocol.Instance().progressFn('context_repository_set') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), 
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })            
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().progressFn('context_repository_none') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })           
            }
        }
    }
    unhold(next:ProgressNext, passport?:PassportObject)  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'unhold')
        }
        
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('unhold_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name), 
                    this.txb.pure.string(next.forward), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })     
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('unhold') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.pure.string(next.next_node_name), this.txb.pure.string(next.forward), 
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })           
        }
    }
    parent_none(passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('parent_none_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            }) 
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('parent_none') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            }) 
        }
    }

    parent(parent:ParentProgress, passport?:PassportObject)  {
        if (!IsValidAddress(parent.parent_id) || !IsValidInt(parent.parent_session_id)) {
            ERROR(Errors.InvalidParam, 'parent')
        }
        if (!parent.operation.next_node_name || !parent.operation.forward) {
            ERROR(Errors.InvalidParam, 'parent')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('parent_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.object(parent.parent_id), 
                    this.txb.pure.u64(parent.parent_session_id), 
                    this.txb.pure.string(parent.operation.next_node_name),
                    this.txb.pure.string(parent.operation.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().progressFn('parent_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.object(parent.parent_id), 
                    this.txb.pure.u64(parent.parent_session_id), 
                    this.txb.pure.string(parent.operation.next_node_name),
                    this.txb.pure.string(parent.operation.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            })  
        }
    }

    private deliverable(deliverable:Deliverable) : TransactionResult {
        if (!IsValidDesription(deliverable.msg)) {
            ERROR(Errors.IsValidDesription, 'deliverable.msg')
        }
        if (deliverable.orders.length > 0 && !Protocol.IsValidObjects(deliverable.orders.map(v=>v.object))) {
            ERROR(Errors.IsValidObjects, 'deliverable.orders')
        }

        const d = this.txb.moveCall({ 
            target:Protocol.Instance().progressFn('deliverable_new') as FnCallType,
            arguments: [this.txb.pure.string(deliverable.msg)],
        })   
        deliverable.orders.forEach(v => {
            if (!IsValidTokenType(v.pay_token_type)) {
                ERROR(Errors.IsValidTokenType, 'deliverable.orders:' + v.object)
            }
            this.txb.moveCall({ 
                target:Protocol.Instance().orderFn('as_deliverable') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, v.object), d],
                typeArguments:[v.pay_token_type]
            })   
        })
        return d
    }

    next(next:ProgressNext, deliverable:Deliverable, passport?:PassportObject) : CurrentSessionId {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next')
        }

        const d = this.deliverable(deliverable);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().progressFn('next_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), 
                    this.txb.pure.string(next.next_node_name), 
                    this.txb.pure.string(next.forward), d, 
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })    
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().progressFn('next') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name), 
                    this.txb.pure.string(next.forward), d, Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            })               
        }
    }

    hold(next:ProgressNext, hold:boolean)  : CurrentSessionId  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'hold')
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        return this.txb.moveCall({
            target:Protocol.Instance().progressFn('hold') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name), 
                this.txb.pure.string(next.forward), this.txb.pure.bool(hold), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
        })  
    }
    static QueryForwardGuard = async (progress:ProgressObject, machine:MachineObject, sender:string, next_node:string, forward:string): Promise<string | undefined> => {
        if (!progress || !machine || !next_node || !forward) { // prior_node maybe ''
            ERROR(Errors.InvalidParam, 'QueryForwardGuard');
            return ;
        }

        const txb = new TransactionBlock();
        txb.moveCall({
            target:Protocol.Instance().progressFn('query_guard') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, progress), Protocol.TXB_OBJECT(txb, machine), 
                txb.pure.string(next_node), txb.pure.string(forward)],
        });

        const res = await Protocol.Client().devInspectTransactionBlock({sender:sender, transactionBlock:txb});
        if (res.results?.length === 1 && res.results[0].returnValues?.length === 1) {
            const guard = bcs.option(bcs.Address).parse(Uint8Array.from(res.results[0].returnValues[0][0]));
            return guard?? undefined;
        }
    }

    static DeSessions = (session: any) : Session[] => {
        let sessions : Session[] = [];
        session?.fields?.contents?.forEach((v:any) => {
            var s:Session = {next_node: v.fields.key, holders:[], weights:v.fields.value.fields.weights, threshold:v.fields.value.fields.threshold};
            v.fields.value.fields.forwards.fields.contents.forEach((i:any) => {
              s.holders.push({forward:i.fields.key, accomplished:i.fields.value.fields.accomplished, time:i.fields.value.fields.time,
                who:i.fields.value.fields.who, deliverable:{msg:i.fields.value.fields.msg, orders:i.fields.value.fields.orders ?? []},
              })
            })
            sessions.push(s);
        })
        return sessions;
    }

    static DeHistories = (fields: any) : History[] => {
        return fields?.map((v:any) => {
          return Progress.DeHistory(v?.data?.content?.fields)
        })
    }

    static DeHistory = (data: any) : History => {
        return {id:parseInt(data?.name), node:data?.value?.fields?.node, next_node:data?.value?.fields?.next_node, 
            sessions:Progress.DeSessions(data?.value.fields?.session), time: data?.value?.fields?.time
          }
    }

    static MAX_NAMED_OPERATOR_COUNT = 20;
    static MAX_DELEVERABLE_ORDER_COUNT = 20;
    static IsValidProgressNext = (next:ProgressNext) => {
        return IsValidName(next.forward)  && IsValidName(next.next_node_name);
    }
}