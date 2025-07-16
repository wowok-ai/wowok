import { FnCallType, TxbObject, PermissionObject, PermissionAddress, GuardObject, Protocol, MODULES} from './protocol.js';
import { array_unique, IsValidAddress, IsValidArray,  IsValidDesription, Bcs, IsValidName, IsValidU64} from './utils.js';
import { ERROR, Errors } from './exception.js';
import { bcs } from '@mysten/sui/bcs';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';

export enum PermissionIndex {
    repository = 100,
    repository_description = 101,
    repository_mode = 102,
    repository_policies = 103,
    repository_reference = 104,

    service = 200,
    service_description = 201,
    service_sales = 202,
    service_payee = 203,
    service_repository = 204,
    service_withdraw_guards = 205,
    service_refund_guards = 206,
    service_discount_transfer = 207,
    service_withdraw = 208,
    service_buyer_guard = 209,
    service_machine = 210,
    service_endpoint = 211,
    service_publish = 212,
    service_clone = 213,
    service_customer_required = 214,
    service_pause = 215,
    service_treasury = 216,
    service_arbitration = 217,
    service_location = 218,

    demand = 260,
    demand_refund = 261,
    demand_expand_time = 262,
    demand_guard = 263,
    demand_description = 264,
    demand_yes = 265,
    demand_location = 266,

    machine = 600,
    machine_description = 601,
    machine_repository = 602,
    machine_clone =  604,
    machine_node = 606,
    machine_endpoint = 608,
    machine_pause = 609,
    machine_publish = 610,

    progress = 650,
    progress_namedOperator = 651,
    progress_bind_task = 652,
    progress_context_repository = 653,
    progress_unhold = 654,
    progress_parent = 655,

    treasury = 700,
    treasury_receive = 701,
    treasury_deposit = 702,
    treasury_withdraw = 703,
    treasury_descritption = 704, 
    treasury_deposit_guard = 705,
    treasury_withdraw_mode = 706,
    treasury_withdraw_guard = 707,

    arbitration = 800,
    arbitration_description = 801,
    arbitration_fee = 802,
    arbitration_voting_guard = 803,
    arbitration_endpoint = 804,
    arbitration_guard = 805,
    arbitration_pause = 806,
    arbitration_vote = 807,
    arbitration_arbitration = 808,
    arbitration_withdraw = 809,
    arbitration_treasury = 810,
    arbitration_location = 811,
    
    user_defined_start = 1000,
}

export interface PermissionInfoType {
    index: number;
    name:string;
    description:string;
    module: string;
    guard?: string;
}
export const PermissionInfo : PermissionInfoType[] = [
    {index:PermissionIndex.repository, name:'Repository', description:'Launch new Repository', module: MODULES.repository},
    {index:PermissionIndex.repository_description, name:'Description', description:'Set Repository description', module: MODULES.repository},
    {index:PermissionIndex.repository_mode, name:'Policy mode', description:'Set Repository mode', module: MODULES.repository},
    {index:PermissionIndex.repository_policies, name:'Policy', description:'Set Repository policies', module: MODULES.repository},
    {index:PermissionIndex.repository_reference, name:'Reference', description:'Set Repository reference', module: MODULES.repository},

    {index:PermissionIndex.service, name:'Service', description:'Launch new Service', module: MODULES.service},
    {index:PermissionIndex.service_description, name:'Description', description:'Set Service description', module: MODULES.service},
    {index:PermissionIndex.service_sales, name:'Sales', description:'Set Service sales items', module: MODULES.service},
    {index:PermissionIndex.service_payee, name:'Payee', description:'Set Service payee', module: MODULES.service},
    {index:PermissionIndex.service_repository, name:'Repository', description:'Set Service repositories', module: MODULES.service},
    {index:PermissionIndex.service_withdraw_guards, name:'Withdraw Guard', description:'Set Service withdraw guards', module: MODULES.service},
    {index:PermissionIndex.service_refund_guards, name:'Refund Guard', description:'Set Service refund guards', module: MODULES.service},
    {index:PermissionIndex.service_discount_transfer, name:'Discount', description:'Launch discounts for Service', module: MODULES.service},
    {index:PermissionIndex.service_buyer_guard, name:'Buyer Guard', description:'Set Guard of buying for Service', module: MODULES.service},
    {index:PermissionIndex.service_machine, name:'Machine', description:'Set Machine for Service', module: MODULES.service},
    {index:PermissionIndex.service_endpoint, name:'Endpoint', description:'Set Service endpoint', module: MODULES.service},
    {index:PermissionIndex.service_publish, name:'Publish', description:'Allowing the creation of Order', module: MODULES.service},
    {index:PermissionIndex.service_clone, name:'Clone', description:'Clone Service', module: MODULES.service},
    {index:PermissionIndex.service_customer_required, name:'Buyer info', description:'Set Service buyer info required', module: MODULES.service},
    {index:PermissionIndex.service_pause, name:'Pause', description:'Pause/Unpause Service', module: MODULES.service},
    {index:PermissionIndex.service_treasury, name:'Treasury', description:'Externally withdrawable treasury for compensation or rewards', module: MODULES.service},
    {index:PermissionIndex.service_arbitration, name:'Arbitration', description:'Add/Remove arbitration that allows refunds from orders at any time based on arbitration results', module: MODULES.service},
    {index:PermissionIndex.service_location, name:'Location', description:'Set Service location', module: MODULES.service},

    {index:PermissionIndex.demand, name:'Demand', description:'Launch new Demand', module: MODULES.demand},
    {index:PermissionIndex.demand_refund, name:'Refund', description:'Refund from Demand', module: MODULES.demand},
    {index:PermissionIndex.demand_expand_time, name:'Expand deadline', description:'Expand Demand deadline', module: MODULES.demand},
    {index:PermissionIndex.demand_guard, name:'Guard', description:'Set Demand guard', module: MODULES.demand},
    {index:PermissionIndex.demand_description, name:'Description', description:'Set Demand description', module: MODULES.demand},
    {index:PermissionIndex.demand_yes, name:'Yes', description:'Pick the Deamand serice', module: MODULES.demand},
    {index:PermissionIndex.demand_location, name:'Location', description:'Set Demand location', module: MODULES.demand},

    {index:PermissionIndex.machine, name: 'Machine', description:'Launch new Machine', module: MODULES.machine},
    {index:PermissionIndex.machine_description, name: 'Description', description:'Set Machine description', module: MODULES.machine},
    {index:PermissionIndex.machine_repository, name: 'Repository', description:'Set Machine repository', module: MODULES.machine},
    {index:PermissionIndex.machine_clone, name: 'Clone', description:'Clone Machine', module: MODULES.machine},
    {index:PermissionIndex.machine_node, name: 'Node', description:'Set Machine nodes', module: MODULES.machine},
    {index:PermissionIndex.machine_endpoint, name: 'Endpoint', description:'Set Machine endpoint', module: MODULES.machine},
    {index:PermissionIndex.machine_pause, name: 'Pause', description:'Pause/Unpause Machine', module: MODULES.machine},
    {index:PermissionIndex.machine_publish, name: 'Publish', description:'Allowing the creation of Progress', module: MODULES.machine},

    {index:PermissionIndex.progress, name: 'Progress', description:'Launch new Progress', module: MODULES.progress},
    {index:PermissionIndex.progress_namedOperator, name: 'Operator', description:'Set Progress operators', module: MODULES.progress},
    {index:PermissionIndex.progress_bind_task, name: 'Bind', description:'Set Progress task', module: MODULES.progress},
    {index:PermissionIndex.progress_context_repository, name: 'Repository', description:'Set Progress repository', module: MODULES.progress},
    {index:PermissionIndex.progress_unhold, name: 'Unhold', description:'Release Progress holdings', module: MODULES.progress},
    {index:PermissionIndex.progress_parent, name: 'Parent', description:'Set Progress parent', module: MODULES.progress},
    
    {index:PermissionIndex.treasury, name: 'Treasury', description:'Launch new Treasury', module: MODULES.treasury},
    {index:PermissionIndex.treasury_deposit, name: 'Deposit', description:'Deposit coins', module: MODULES.treasury},
    {index:PermissionIndex.treasury_receive, name: 'Receive', description:'Receive coins from some address sent', module: MODULES.treasury},
    {index:PermissionIndex.treasury_withdraw, name: 'Withdraw', description:'Withdraw coins', module: MODULES.treasury},
    {index:PermissionIndex.treasury_withdraw_guard, name: 'Withdraw Guard', description:'Add/Remove Treasury withdraw guard', module: MODULES.treasury},
    {index:PermissionIndex.treasury_withdraw_mode, name: 'Withdraw mode', description:'Set Treasury withdraw mode', module: MODULES.treasury},
    {index:PermissionIndex.treasury_deposit_guard, name: 'Deposit Guard', description:'Set Treasury deposit guard', module: MODULES.treasury},
    {index:PermissionIndex.treasury_descritption, name: 'Description', description:'Set Treasury description', module: MODULES.treasury},

    {index:PermissionIndex.arbitration, name: 'Arbitration', description:'Launch new Arbitration', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_description, name: 'Description', description:'Set Arbitration description', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_endpoint, name: 'Endpoint', description:'Set Arbitration endpoint', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_fee, name: 'Fee', description:'Set Arbitration fee', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_guard, name: 'Guard', description:'Set Guard to apply for arbitration', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_arbitration, name: 'Arbitrate', description:'Determine the outcome of arbitration', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_pause, name: 'Pause', description:'Allowing/forbidding the creation of Arb', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_voting_guard, name: 'Voting Guard', description:'Add/Remove voting Guard', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_vote, name: 'Vote', description:'Vote on the application for arbitration', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_withdraw, name: 'Withdraw', description:'Withdraw the arbitration fee', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_treasury, name: 'Withdraw', description:'Set Treasury that fees was collected at the time of withdrawal', module: MODULES.arbitration},
    {index:PermissionIndex.arbitration_location, name: 'Location', description:'Set Arbitration location', module: MODULES.arbitration},
]

export interface PermissionAnswer {
    who: string;
    owner?: boolean;
    admin?: boolean;
    items?: PermissionAnswerItem[]; // items === undefined, while errors
    object: string; // permission object
}
export interface PermissionAnswerItem {
    query: PermissionIndexType;
    permission: boolean;
    guard?: string;
}
export type OnPermissionAnswer = (answer: PermissionAnswer) => void;



export type PermissionIndexType = PermissionIndex | number;

export interface Permission_Entity_Permission {
    index: PermissionIndexType;
    guard?: TxbObject;
}

export interface Permission_Entity {
    address:string;
    permissions:Permission_Entity_Permission[];
}

export interface Permission_Index_Entity {
    address: string;
    guard?: TxbObject;
}
export interface Permission_Index {
    index: PermissionIndexType;
    entities: Permission_Index_Entity[];
}

export interface BizPermission {
    index: PermissionIndexType;
    name: string;
}
export class  Permission {
    protected txb;
    protected object : TxbObject;
    
    get_object()  { return this.object }
    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb:TransactionBlock, object:TxbObject) : Permission {
        let p =  new Permission(txb);
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p
    }

    static New(txb:TransactionBlock, description:string) : Permission {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let p = new Permission(txb);
        p.object = txb.moveCall({
            target: Protocol.Instance().permissionFn('new') as FnCallType,
            arguments: [txb.pure.string(description)]
        });
        return p
    }

    launch() : PermissionAddress {
        return this.txb.moveCall({ // address returned
            target:Protocol.Instance().permissionFn('create')  as FnCallType,
            arguments:[ Protocol.TXB_OBJECT(this.txb, this.object) ]        
        })
    }

    add_bizPermission(index: number, name:string) {
        if (!Permission.IsValidBizPermissionIndex(index)) {
            ERROR(Errors.IsValidBizPermissionIndex, 'add_bizPermission');
        }

        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'add_bizPermission');
        }
        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('user_define_add') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index), this.txb.pure.string(name)]
        })   
    }
    
    remove_bizPermission(index: number) {
        if (!Permission.IsValidBizPermissionIndex(index)) {
            ERROR(Errors.IsValidBizPermissionIndex, 'remove_bizPermission');
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('user_define_remove') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index)]
        })   
    }

    transfer_permission(old_entity: string, new_entity: string) {
        if (!IsValidAddress(old_entity) || !IsValidAddress(new_entity)) {
            ERROR(Errors.IsValidAddress, 'transfer_permission')
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('change_entity') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(old_entity), 
                this.txb.pure.address(new_entity) ]
        })     
    }

    add_entity2(entities: string[], index?:PermissionIndexType) {
        if (entities.length === 0) return;

        if (!IsValidArray(entities, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_entity2');
        }

        if (index !== undefined) {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('add_with_index') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index),
                    this.txb.pure.vector('address', array_unique(entities))]
            })       
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(entities))]
            })                   
        }
    }
    add_entity3(entities: Permission_Index[]) {
        if (entities.length === 0) return;
        const e : Permission_Entity[] = [];

        entities.forEach((v) => {
            v.entities.forEach((p) => {
                const f = e.find((i) => i.address === p.address);
                if (f) {
                    const t = f.permissions.find((k)=>k.index === v.index);
                    if (t) {
                        t.guard = p.guard;
                    } else {
                        f.permissions.push({guard:p.guard, index:v.index});
                    }
                } else {
                    e.push({address:p.address, permissions:[{guard:p.guard, index:v.index}]})
                }
            })
        });
        this.add_entity(e);
    }

    add_entity(entities:Permission_Entity[])  {
        if (entities.length === 0) return
        entities.forEach((v) => {
            if (!IsValidAddress(v.address)) ERROR(Errors.IsValidAddress, 'add_entity.entities.address')
            v.permissions.forEach((p) => {
                if (!Permission.IsValidPermissionIndex(p.index)) ERROR(Errors.IsValidPermissionIndex, 'add_entity.entities.permissions.index')
                if (p?.guard && !Protocol.IsValidObjects([p.guard])) ERROR(Errors.IsValidAddress, 'add_entity.entities.permissions.guard')
            })
        });

        let guards:any[]  = [];
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let indexes :number[] = [];

            for (let j = 0; j <  entity.permissions.length; j++) {
                let index = entity.permissions[j];
                if (!Permission.IsValidPermissionIndex(index.index)) {
                    continue;
                }
                
                if (!indexes.includes(index.index))   {
                    indexes.push(index.index);
                    if (index?.guard) {
                        guards.push({address:entity.address, index:index.index, guard:index.guard});
                    }
                }      
            }    

            if (indexes.length > 0) {
                this.txb.moveCall({
                    target:Protocol.Instance().permissionFn('add_batch') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity.address), 
                        this.txb.pure.vector('u64', indexes)]
                })            
            }
        } 
        // set guards
        guards.forEach(({address, index, guard}) => {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('guard_set') as FnCallType,
                arguments:[ Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address), 
                    this.txb.pure.u64(index), Protocol.TXB_OBJECT(this.txb, guard)]
            })
        })
    }

    // guard: undefine to set none
    set_guard(address:string, index:PermissionIndexType, guard?:GuardObject)  {
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, 'address')
        }
        if(!Permission.IsValidPermissionIndex(index) && !Permission.IsValidBizPermissionIndex(index)) {
            ERROR(Errors.IsValidPermissionIndex, 'index')
        }

        if (guard) {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('guard_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address), 
                    this.txb.pure.u64(index), Protocol.TXB_OBJECT(this.txb, guard)]
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('guard_none') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address), 
                    this.txb.pure.u64(index)]
            })       
        };
    }

    remove_index(address:string, index:PermissionIndexType[])  {
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress)
        }
        if (index.length === 0) return ;
        if (!(IsValidArray(index, Permission.IsValidPermissionIndex))) {
            ERROR(Errors.InvalidParam, 'index')
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('remove_index') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address), 
                this.txb.pure.vector('u64', array_unique(index))]
        })            
    }
    remove_entity(address:string[])  {
        if (address.length === 0) return ;
        if (!IsValidArray(address, IsValidAddress)) {
            ERROR(Errors.IsValidArray)
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('remove') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(address))]
        })           
    }

    set_description(description:string)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('description_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description)]
        })
        ;
    }

    add_admin(admin:string[])  {
        if (admin.length === 0) return ;

        if (!IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray)
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('admin_add_batch')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address',  array_unique(admin))]
        });           
    }

    remove_admin(admin:string[], removeall?:boolean)  {
        if (!removeall &&  admin.length === 0)  return;
        if (!IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'admin')
        }

        if (removeall) {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('admins_clear')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
            });    
        } else if (admin) {
            this.txb.moveCall({
                target:Protocol.Instance().permissionFn('admin_remove_batch')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(admin))]
            });            
        }
        
    }

    change_owner(new_owner:string) {
        if (!IsValidAddress(new_owner)) {
            ERROR(Errors.IsValidAddress)
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('builder_set')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(new_owner)]
        });        
    }

    // query all permissions for address
    query_permissions_all(address_queried:string) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_permissions');
        }

        this.txb.moveCall({
            target:Protocol.Instance().permissionFn('query_permissions_all') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        })   
    }

    QueryPermissions(permission:string, address_queried:string, onPermissionAnswer:OnPermissionAnswer, sender?:string) {
        //@ be the same txb
        this.query_permissions_all(address_queried);
        //console.log(address_queried)
        Protocol.Client().devInspectTransactionBlock({sender:sender ?? address_queried, transactionBlock:this.txb}).then((res) => {
            if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 2)  {
                onPermissionAnswer({who:address_queried, object:permission});
                return 
            }
            const perm = bcs.u8().parse(Uint8Array.from((res.results as any)[0].returnValues[0][0]));
            if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
                onPermissionAnswer({who:address_queried, admin:true, owner:perm%2===1, items:[], object:permission})
            } else {
                const perms = Bcs.getInstance().de_perms(Uint8Array.from((res.results as any)[0].returnValues[1][0]));
                onPermissionAnswer({who:address_queried, admin:false, owner:perm%2===1, items:perms.map((v:any)=>{
                    return {query:v?.index, permission:true, guard:v?.guard}
                }), object:permission});  
            }
        }).catch((e) => {
            console.log(e);
            onPermissionAnswer({who:address_queried, object:permission});
        })
    }
    
    static HasPermission(answer:PermissionAnswer|undefined, index:PermissionIndexType, bStrict:boolean=false) : {has:boolean, guard?:string, owner?:boolean} | undefined {
        if (answer) {
            if (answer.admin) return {has:true, owner:answer.owner}; // admin
            let i = answer.items?.find((v)=>v.query == index); // index maybe string, so ==
            if (i) {
                return {has:i.permission, guard:i.guard, owner:answer.owner};
            } else {
                return {has:false, guard:undefined, owner:answer?.owner}
            }   
        }
        if (bStrict) {
            return {has:false, guard:undefined, owner:false}
        } 
        return undefined // basic: !== false ; otherwise: !
    }

    static MAX_ADMIN_COUNT = 64;
    static MAX_ENTITY_COUNT = 2000;
    static MAX_PERMISSION_INDEX_COUNT = 200;
    static MAX_PERSONAL_PERMISSION_COUNT = 200; 
    
    static PERMISSION_NORMAL = 0;
    static PERMISSION_OWNER = 1;
    static PERMISSION_ADMIN = 2;
    static PERMISSION_OWNER_AND_ADMIN = 3;
    static BUSINESS_PERMISSIONS_START = PermissionIndex.user_defined_start;

    static IsValidBizPermissionIndex = (index:number)  => { 
        return index >= Permission.BUSINESS_PERMISSIONS_START && IsValidU64(index)
    }
    
    static IsValidPermissionIndex = (index:PermissionIndexType) : boolean  => {
        //console.log(index)
        if (Object.values(PermissionIndex).includes(index)) {
            return true
        }
        //console.log(Object.keys(PermissionIndex))
        return Permission.IsValidBizPermissionIndex(index);
    }
}