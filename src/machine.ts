import { Transaction as TransactionBlock, TransactionObjectArgument, type TransactionResult } from '@mysten/sui/transactions';
import { Protocol, FnCallType, PermissionObject, RepositoryObject,  PassportObject, MachineObject, MachineAddress,  GuardObject, TxbObject, ServiceObject} from './protocol.js';
import { IsValidInt, array_unique, IsValidArray, IsValidAddress, IsValidName, IsValidName_AllowEmpty, 
    IsValidEndpoint, IsValidDesription, IsValidU64, 
    IsValidTokenType} from './utils.js'
import { Permission, PermissionIndexType } from './permission.js';
import { Errors, ERROR}  from './exception.js'

export interface ServiceWrap {
    object: ServiceObject,
    pay_token_type: string,
    bRequired?: boolean, // If true, An order at least must be placed from this service provider
}
export interface Machine_Forward {
    name: string; // foward name
    namedOperator?: string; // dynamic operator
    permission?: PermissionIndexType; // this.permission-index or named-operator MUST one defined.
    weight?: number;
    guard?: GuardObject;
    suppliers?: ServiceWrap[]; // List of service providers
}
export interface Machine_Node_Pair {
    prior_node: string;
    forwards: Machine_Forward[];
    threshold?: number;
}
export interface Machine_Node {
    name: string;
    pairs: Machine_Node_Pair[];
}

export interface QueryGuardParam {
    node: string;
    prior_node: string;
    forward: string;
    txb: TransactionBlock;
    guard: string | null;
}
export type OnQueryGuard = (param: QueryGuardParam) => void;
export class Machine {
    protected txb;
    protected object : TxbObject;
    protected permission: TxbObject;

    get_object() { return this.object }

    static From(txb:TransactionBlock, permission:PermissionObject, object:TxbObject) : Machine {
        let d = new Machine(txb, permission)
        d.object = Protocol.TXB_OBJECT(txb, object)
        return d
    }

    private constructor(txb:TransactionBlock, permission:PermissionObject) {
        this.txb = txb;
        this.permission = permission;
        this.object =  '';
    }
    static New(txb:TransactionBlock, permission:PermissionObject, description:string, endpoint?:string|null|undefined, passport?:PassportObject) : Machine {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint)
        }

        let m = new Machine(txb, permission);   
        let ep = txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            m.object = txb.moveCall({
                target:Protocol.Instance().machineFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), ep, Protocol.TXB_OBJECT(txb, permission)],
            })
        } else {
            m.object = txb.moveCall({
                target:Protocol.Instance().machineFn('new') as FnCallType,
                arguments:[txb.pure.string(description), ep, Protocol.TXB_OBJECT(txb, permission)],
            })
        }
        return m
    }

    // create new nodes for machine
    add_node(nodes:Machine_Node[], passport?:PassportObject) {
        if (nodes.length === 0) return ;

        let bValid = true;
        nodes.forEach((node) => {
            if (!IsValidName(node.name))  { bValid = false; }
            node.pairs.forEach((p) => {
                if (!IsValidName_AllowEmpty(p.prior_node)) { bValid = false; }
                if (p?.threshold && !IsValidInt(p.threshold)) { bValid = false; }
                p.forwards.forEach((f) => {
                    if (Machine.checkValidForward(f) !== '') bValid = false;
                })
            })
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'add_node')
        }

        let new_nodes: TxbObject[] = [];
        nodes.forEach((node) => {
            let n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_new') as FnCallType,
                arguments:[this.txb.pure.string(node.name)]
            }); 
            node.pairs.forEach((pair) => {
                let threshold = this.txb.pure.option('u32', pair?.threshold);

                pair.forwards.forEach((forward) => {
                    this.txb.moveCall({ // add forward
                        target:Protocol.Instance().machineFn('forward_add') as FnCallType,
                            arguments:[n, this.txb.pure.string(pair.prior_node), this.txb.pure.string(forward.name),  threshold, this.forward(forward)]
                    });                
                }); 
                if (pair.forwards.length === 0) {
                    this.txb.moveCall({ // add forward
                        target:Protocol.Instance().machineFn('forward_add_none') as FnCallType,
                            arguments:[n, this.txb.pure.string(pair.prior_node), threshold]
                    });         
                }
            }); 
            new_nodes.push(n); 
        }); 
        this.add_node2(new_nodes, passport)
    }

    forward(forward:Machine_Forward) : TransactionResult {
        let weight = forward?.weight ? forward.weight : 1;
        let f:any;

        // namedOperator first.
        if (forward?.namedOperator && IsValidName(forward.namedOperator)) {
            if (forward?.guard) {
                f = this.txb.moveCall({ 
                    target:Protocol.Instance().machineFn('forward') as FnCallType,
                        arguments:[this.txb.pure.string(forward.namedOperator), this.txb.pure.u16(weight), Protocol.TXB_OBJECT(this.txb, forward.guard)]
                });                        
            } else {
                f = this.txb.moveCall({ 
                    target:Protocol.Instance().machineFn('forward2') as FnCallType,
                        arguments:[this.txb.pure.string(forward.namedOperator), this.txb.pure.u16(weight)]
                });                
            }            
        } else if (forward?.permission !== undefined && IsValidU64(forward.permission)) {
            if (forward?.guard) {
                f = this.txb.moveCall({ 
                    target:Protocol.Instance().machineFn('forward3') as FnCallType,
                        arguments:[this.txb.pure.u64(forward.permission), this.txb.pure.u16(weight), Protocol.TXB_OBJECT(this.txb, forward.guard)]
                });    
            } else {
                f = this.txb.moveCall({ 
                    target:Protocol.Instance().machineFn('forward4') as FnCallType,
                        arguments:[this.txb.pure.u64(forward.permission), this.txb.pure.u16(weight)]
                });  
            }
        } else {
            ERROR(Errors.InvalidParam, 'forward')
        }

        forward?.suppliers?.forEach((v) => {
            if (!IsValidTokenType(v.pay_token_type)) {
                ERROR(Errors.IsValidTokenType, 'forward.suppliers:'+v.object);
            }
            this.txb.moveCall({ 
                target:Protocol.Instance().serviceFn('add_to') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, v.object), this.txb.pure.bool(v.bRequired ?? false), f],
                    typeArguments:[v.pay_token_type]
            });  
        })
        return f
    }

    // move MachineNodeObject to the machine from signer-owned MachineNode object 
    add_node2(nodes:TxbObject[], passport?:PassportObject) {
        if (nodes.length === 0)  return;
        let n: TransactionObjectArgument[] = nodes.map((v)=>{ return Protocol.TXB_OBJECT(this.txb, v) as any});
        if (passport) {
            this.txb.moveCall({ // add node
                target:Protocol.Instance().machineFn('node_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.makeMoveVec({elements:n}), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });     
        } else {
            this.txb.moveCall({ // add node
                target:Protocol.Instance().machineFn('node_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.makeMoveVec({elements:n}), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });     
        }    
    }
    
    fetch_node(node_name:string, passport?:PassportObject) : TxbObject {
        if (!IsValidName(node_name)) {
            ERROR(Errors.IsValidName, 'fetch_node');
        }
        
        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(node_name), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });  
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        } 
    }
    rename_node(node_name:string, new_name:string, passport?:PassportObject) {
        if (node_name === new_name) return
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'rename_node');
        if (!IsValidName(new_name)) ERROR(Errors.IsValidName, 'rename_node');

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_rename_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), 
                    this.txb.pure.string(node_name), this.txb.pure.string(new_name),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_rename') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), 
                    this.txb.pure.string(node_name), this.txb.pure.string(new_name),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        } 
    }

    // move MachineNodeObject from  this.object to signer-owned MachineNode object 
    remove_node(nodes_name:string[], bTransferMyself:boolean = false, passport?:PassportObject) {
        if (nodes_name.length === 0) return;

        if (!IsValidArray(nodes_name, IsValidName)) {
            ERROR(Errors.IsValidArray, 'nodes_name')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_remove_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.vector('string', nodes_name), 
                    this.txb.pure.bool(bTransferMyself), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.vector('string', nodes_name), 
                    this.txb.pure.bool(bTransferMyself), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        } 
    }

    launch() : MachineAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().machineFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb,  this.object)],
        })
    }

    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
    }
    add_repository(repository:RepositoryObject, passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('repository_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('repository_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
    }

    remove_repository(repositories:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && repositories.length===0) {
            return;
        }

        if (!IsValidArray(repositories, IsValidAddress)){
            ERROR(Errors.IsValidArray, 'remove_repository')
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().machineFn('repository_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb,  this.object)],
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().machineFn('repository_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.vector('address', array_unique(repositories)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                })
            }   
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().machineFn('repository_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().machineFn('repository_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.vector('address', array_unique(repositories)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                })
            }   
        }   
    }

    clone(bLaunch?: boolean, passport?:PassportObject) : MachineObject | MachineAddress  {
        let ret: MachineObject | undefined;
        if (passport) {
            ret = this.txb.moveCall({
                target:Protocol.Instance().machineFn('clone_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } else {
            ret = this.txb.moveCall({
                target:Protocol.Instance().machineFn('clone') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
        if (bLaunch) {
            return this.txb.moveCall({
                target:Protocol.Instance().machineFn('create') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, ret)],
            })
        } else {
            return ret
        }
    }

    set_endpoint(endpoint?:string|null|undefined, passport?:PassportObject) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint)
        }

        let ep = this.txb.pure.option('string', endpoint ? endpoint : undefined) ;
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('endpoint_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('endpoint_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
    }
    pause(bPaused:boolean, passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('pause_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.bool(bPaused), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('pause') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.bool(bPaused), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } 
    }
    publish(passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('publish_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('publish') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])){
            ERROR(Errors.IsValidObjects, 'new_permission')
        }

        this.txb.moveCall({
            target:Protocol.Instance().machineFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb,  this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[]            
        })   
        this.permission = new_permission;   
    }

    add_forward(node_prior:string, node_name:string, foward: Machine_Forward, threshold?:number, old_forward_name?:string, passport?:PassportObject) {
        if (!IsValidName_AllowEmpty(node_prior)) ERROR(Errors.IsValidName_AllowEmpty, 'add_forward');
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'add_forward');
        const err = Machine.checkValidForward(foward); if (err) ERROR(Errors.InvalidParam, err);

        let n : any;
        if (passport) {
            n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })

        } else {
            n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
        const f = this.forward(foward);
        const t = this.txb.pure.option('u32', threshold ?? undefined);
        this.txb.moveCall({
            target:Protocol.Instance().machineFn('forward_add') as FnCallType,
            arguments:[n, this.txb.pure.string(node_prior), this.txb.pure.string(foward.name), t, f],
        })
        
        if (old_forward_name && old_forward_name !== foward.name) {
            this.txb.moveCall({
                target:Protocol.Instance().machineFn('forward_remove') as FnCallType,
                arguments:[n, this.txb.pure.string(node_prior), this.txb.pure.string(old_forward_name)],
            })
        }
        this.add_node2([n], passport);
    }

    remove_pair(node_prior:string, node_name:string, passport?:PassportObject) {
        if (!IsValidName_AllowEmpty(node_prior)) ERROR(Errors.IsValidName_AllowEmpty, 'remove_pair');
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'remove_pair');
        let n : any;
        if (passport) {
            n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })

        } else {
            n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
        this.txb.moveCall({
            target:Protocol.Instance().machineFn('pair_remove') as FnCallType,
            arguments:[n, this.txb.pure.string(node_prior)],
        })
        this.add_node2([n], passport);
    }

    remove_forward(node_prior:string, node_name:string, foward_name: string, passport?:PassportObject) {
        if (!IsValidName_AllowEmpty(node_prior)) ERROR(Errors.IsValidName_AllowEmpty, 'remove_forward');
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'remove_forward');

        let n : any;
        if (passport) {
            n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })

        } else {
            n = this.txb.moveCall({
                target:Protocol.Instance().machineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb,  this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            })
        }
        this.txb.moveCall({
            target:Protocol.Instance().machineFn('forward_remove') as FnCallType,
            arguments:[n, this.txb.pure.string(node_prior), this.txb.pure.string(foward_name)],
        })
        this.add_node2([n], passport);
    }

    static rpc_de_nodes(fields: any) : Machine_Node[] {
        const machine_nodes:Machine_Node[] = [];
        fields.forEach((n:any) => {
            machine_nodes.push({name:n.data.content.fields.name, pairs:Machine.rpc_de_pair(n?.data.content.fields.value)});    
        });
        return machine_nodes;
    }

    static rpc_de_pair(data:any) : Machine_Node_Pair[] {
        let pairs:Machine_Node_Pair[] = [];
        data.fields.value.fields.contents.forEach((p:any) => {
            let forwards:Machine_Forward[] = [];
            p.fields.value.fields.forwards.fields.contents.forEach((f:any) => {
                let forward_name = f.fields.key;
                let forward_weight = f.fields.value.fields.weight;
                let forward_guard = f.fields.value.fields.guard;
                let forward_namedOperator = f.fields.value.fields.namedOperator;
                let forward_permission_index = f.fields.value.fields.permission_index;
                forwards.push({name:forward_name, namedOperator:forward_namedOperator, permission:forward_permission_index,
                    weight:forward_weight, guard:forward_guard?forward_guard:'', suppliers:f.fields.value.fields.suppliers.fields.contents.map((v:any) => {
                        return {object:v.fields.key, bRequired:v.fields.value, pay_token_type:''}
                    })}); //@ NOTICE...
            });
            pairs.push({prior_node:p.fields.key, threshold:p.fields.value.fields.threshold, forwards:forwards});
        });
        return pairs
    }
    static namedOperators(nodes:Machine_Node[]) : string[] {
        let ret: string[] = [];
        nodes.forEach((v)=> {
            v.pairs.forEach((i) => {
                i.forwards.forEach((k) => {
                    if (k?.namedOperator && !ret.find((x)=>x===k.namedOperator)) {
                        ret.push(k.namedOperator);
                    }
                })
            })
        })
        return ret;
    }

    static checkValidForward(forward:Machine_Forward) : string {
        if (!IsValidName(forward.name)) return 'Forward name invalid'
        if (forward?.namedOperator && !IsValidName_AllowEmpty(forward?.namedOperator)) return 'Progress Operator invalid';
        if (forward?.permission && !Permission.IsValidPermissionIndex(forward?.permission)) return 'Permission index invalid';
        if (!forward?.permission && !forward?.namedOperator) return 'Business-Permissions invalid';
        if (forward?.weight && !IsValidU64(forward.weight)) return 'Weight invalid';
        return ''
    }

    static INITIAL_NODE_NAME = '';
    static OPERATOR_ORDER_PAYER = 'OrderPayer';
}