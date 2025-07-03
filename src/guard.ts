

import { Protocol, LogicsInfo, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, ValueType,  OperatorType, TxbObject, GuardObject, IsValidOperatorType} from './protocol.js';
import { concatenate, array_equal, IsValidU8, IsValidDesription, Bcs, IsValidAddress, FirstLetterUppercase, insertAtHead } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs'

export type GuardConstant = Map<number, Guard_Variable>;

export interface Guard_Variable {
    type: ValueType ,
    value?: Uint8Array,
    bWitness : boolean,
}

export  interface Guard_Options {
    from: 'query' | 'type';
    name: string;
    value: number;  
    group?: string;
    return: ValueType | 'number' | 'any';
}

export interface GuardAnswer {
    txb: TransactionBlock;
    err?: string;
    identifiers: number[];
}

export type OnQueryAnswer = (answer: GuardAnswer) => void;

export interface GuardQuery {
    module: MODULES;
    query_name: string;
    query_id: number;
    parameters: ValueType[];
    return: ValueType;
    description: string;
    parameters_description?: string[];
}
export const GUARD_QUERIES:GuardQuery[] = [ 
    // module, 'name', 'id', [input], output
    {module:MODULES.permission, query_name:'Owner', query_id:1, parameters:[], return:ValueType.TYPE_ADDRESS, description:"Owner's address."},
    {module:MODULES.permission, query_name:'Is Admin', query_id:2, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Is a certain address an administrator?', parameters_description:['address']},
    {module:MODULES.permission, query_name:'Has Rights', query_id:3, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], return:ValueType.TYPE_BOOL, description:'Does an address have a certain permission(Admin always have permissions)?', parameters_description:['address', 'permission index']},
    {module:MODULES.permission, query_name:'Contains Address', query_id:4, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether an address is included in the personnel permission table?', parameters_description:['address']},
    {module:MODULES.permission, query_name:'Contains Permission', query_id:5, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], return:ValueType.TYPE_BOOL, description:'Whether a certain permission for a certain address is defined in the personnel permission table?', parameters_description:['address', 'permission index']},
    {module:MODULES.permission, query_name:'Contains Permission Guard', query_id:6, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], return:ValueType.TYPE_BOOL, description:'Whether a permission guard for a certain address is defined in the personnel permission table?', parameters_description:['address', 'permission index']},
    {module:MODULES.permission, query_name:'Permission Guard', query_id:7, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], return:ValueType.TYPE_ADDRESS, description:'Permission guard for a certain address.', parameters_description:['address', 'permission index']},
    {module:MODULES.permission, query_name:'Number of Entities', query_id:8, parameters:[], return:ValueType.TYPE_U64, description:'Number of entities in the personnel permission table.', },
    {module:MODULES.permission, query_name:'Number of Admin', query_id:9, parameters:[], return:ValueType.TYPE_U64, description:'Number of administrators.', },

    {module:MODULES.repository, query_name:'Permission', query_id:100, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Permission object address.', },
    {module:MODULES.repository, query_name:'Contains Policy', query_id:101, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Is a consensus policy included?', parameters_description:['the filed name']},
    {module:MODULES.repository, query_name:'Is Permission set of Policy', query_id:102, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Does a certain consensus policy set data operation permissions?', parameters_description:['the policy name']},
    {module:MODULES.repository, query_name:'Permission of Policy', query_id:103, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_U64,  description:'The permission index of a certain consensus policy in the Permission object.', parameters_description:['the policy name']},
    {module:MODULES.repository, query_name:'Value Type of Policy', query_id:104, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_U8,  description:'Data types defined by consensus policy.', parameters_description:['the policy name']},
    {module:MODULES.repository, query_name:'Contains Data', query_id:105, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Does it contain data for a certain field of an address?', parameters_description:['address','the field name']},
    {module:MODULES.repository, query_name:'Raw data without Type', query_id:106, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_VEC_U8,  description:'Data for a field at an address and does not contain data type information.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'Raw data', query_id:107, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_VEC_U8,  description:'Data for a field at an address, and the first byte contains data type information.', parameters_description:['address', 'the field name']},
    {module:MODULES.repository, query_name:'Type', query_id:108, parameters:[], return:ValueType.TYPE_U8,  description:'The repository Type. 0: Normal; 1: Wowok greenee.', },   
    {module:MODULES.repository, query_name:'Policy Mode', query_id:109, parameters:[], return:ValueType.TYPE_U8,  description:'Policy Mode. 0: Free mode;  1: Strict mode.', },   
    {module:MODULES.repository, query_name:'Reference Count', query_id:110, parameters:[], return:ValueType.TYPE_U64,  description:'The number of times it is referenced by other objects.', },   
    {module:MODULES.repository, query_name:'Is Referenced by An Object', query_id:111, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Is it referenced by an object?', parameters_description:['address']},   
    {module:MODULES.repository, query_name: 'Number Data', query_id:112, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_U256, description:'Data for a field at an address and get unsigned integer type data.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'String Data', query_id:113, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_STRING, description:'Data for a field at an address and get string type data.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'Address Data', query_id:114, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_ADDRESS, description:'Data for a field at an address and get address type data.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'Bool Data', query_id:115, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Data for a field at an address and get bool type data.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'Number Vector Data', query_id:116, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_VEC_U256, description:'Data for a field at an address and get unsigned integer vector type data.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'String Vector Data', query_id:117, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_VEC_STRING, description:'Data for a field at an address and get string vector type data.', parameters_description:['address', 'the field name']},  
    {module:MODULES.repository, query_name:'Address Vector Data', query_id:118, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return:ValueType.TYPE_VEC_ADDRESS, description:'Data for a field at an address and get address vector type data.', parameters_description:['address', 'the field name']},       
    {module:MODULES.repository, query_name:'Bool Vector Data', query_id:119, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], return: ValueType.TYPE_VEC_BOOL, description:'Data for a field at an address and get bool vector type data.', parameters_description:['address', 'the field name']},            
    
    {module:MODULES.entity, query_name:'Has Entity', query_id:200, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Is an entity already registered?', parameters_description:['address']}, 
    {module:MODULES.entity, query_name:'Likes', query_id:201, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The number of likes for an address by other addresses.', parameters_description:['address']}, 
    {module:MODULES.entity, query_name:'Dislikes', query_id:202, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The number of dislikes for an address by other addresses.', parameters_description:['address']}, 
    {module:MODULES.entity, query_name:'Entity Info', query_id:203, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_VEC_U8, description:'Public information about an entity.', parameters_description:['address']}, 
    {module:MODULES.entity, query_name:'Has Resource by Entity?', query_id:204, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether an entity created a resource?', parameters_description:['address']}, 
    {module:MODULES.entity, query_name:'Entity Resource', query_id:205, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_ADDRESS, description:'The address of a resource object created by an entity.', parameters_description:['address']}, 

    {module:MODULES.demand, query_name:'Permission', query_id:300, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Permission object address.', },       
    {module:MODULES.demand, query_name:'Deadline', query_id:302, parameters:[], return:ValueType.TYPE_U64, description:'The expiration time of presenting.', },   
    {module:MODULES.demand, query_name:'Bounty Count', query_id:303, parameters:[], return:ValueType.TYPE_U64, description:'Number of Bounties.', },   
    {module:MODULES.demand, query_name:'Has Guard', query_id:304, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the present guard is set?', },       
    {module:MODULES.demand, query_name:'Guard', query_id:305, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The present guard address.', },
    {module:MODULES.demand, query_name:'Has Service Picked', query_id:306, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether a service has been picked and bounties given?', },   
    {module:MODULES.demand, query_name:'Service Picked', query_id:307, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Service address that has been picked.', }, 
    {module:MODULES.demand, query_name:'Presenter Count', query_id:308, parameters:[], return:ValueType.TYPE_U64, description:'Number of presenters.', },
    {module:MODULES.demand, query_name:'Has Presenter', query_id:309, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Is a certain address a presenter?', parameters_description:['address']},   
    {module:MODULES.demand, query_name:'Who Got Bounty', query_id:310, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_ADDRESS, description:'The address that bounties given.', parameters_description:['address']}, 
    {module:MODULES.demand, query_name:'Type', query_id:311, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.demand, query_name:'Type with Original Ids', query_id:312, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 

    {module:MODULES.service, query_name:'Permission', query_id:400, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Permission object address.', },       
    {module:MODULES.service, query_name:'Payee', query_id:401, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Payee address, that all order withdrawals will be collected to this address.', },
    {module:MODULES.service, query_name:'Has Buying Guard', query_id:402, parameters:[], return:ValueType.TYPE_BOOL, description:'Is the guard condition of buying set?', },   
    {module:MODULES.service, query_name:'Buying Guard', query_id:403, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Buying guard, that Purchase only if you meet the conditions of the guard.', },   
    {module:MODULES.service, query_name:'Contains Repository', query_id:404, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:"Is a certain repository one of the service's consensus repositories?", parameters_description:['address']},       
    {module:MODULES.service, query_name:'Has Withdrawing Guard', query_id:405, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether a certain guard is set when withdrawing money?', parameters_description:['address']},
    {module:MODULES.service, query_name:'Withdrawing Guard Percent', query_id:406, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The percentage of withdrawals allowed by a certain withdrawal guard.', parameters_description:['address']},   
    {module:MODULES.service, query_name:'Has Refunding Guard', query_id:407, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether a certain guard is set when refunding money?', parameters_description:['address']}, 
    {module:MODULES.service, query_name:'Refunding Guard Percent', query_id:408, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The percentage of refund allowed by a certain refund guard.', parameters_description:['address']},
    {module:MODULES.service, query_name:'Has Sales Item', query_id:409, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Is there a sales item for the service?', parameters_description:['the item name']},   
    {module:MODULES.service, query_name:'Sale Item Price', query_id:410, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'What is the price of a certain sale item?', parameters_description:['the item name']}, 
    {module:MODULES.service, query_name:'Sale Item Inventory', query_id:411, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'How much inventory is there for a certain sales item?', parameters_description:['the item name']}, 
    {module:MODULES.service, query_name:'Has Machine', query_id:412, parameters:[], return:ValueType.TYPE_BOOL, description:"Has the machine(progress generator) that serves the order been set up?", },
    {module:MODULES.service, query_name:'Machine', query_id:413, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Machine address, that generate progresses serving the execution process of order.', },  
    {module:MODULES.service, query_name:'Paused', query_id:414, parameters:[], return:ValueType.TYPE_BOOL, description:'Pause the creation of new order?'}, 
    {module:MODULES.service, query_name:'Published', query_id:415, parameters:[], return:ValueType.TYPE_BOOL, description:'Is it allowed to create orders?'}, 
    {module:MODULES.service, query_name:'Has Required Info', query_id:416, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the necessary information that needs to be provided by the customer is set?', },
    {module:MODULES.service, query_name:'Required Info of Service-Pubkey', query_id:417, parameters:[], return:ValueType.TYPE_STRING, description:'The public key used to encrypt customer information, and only the service provider can decrypt and view customer information.', },   
    {module:MODULES.service, query_name:'Required Info', query_id:418, parameters:[], return:ValueType.TYPE_VEC_STRING, description:'Names of the required information item that needs to be provided by the customer.', },  
    {module:MODULES.service, query_name:'Number of Treasuries', query_id:419, parameters:[], return:ValueType.TYPE_U64, description:'The number of treasuries that can be externally withdrawn for purposes such as compensation or incentives.', },   
    {module:MODULES.service, query_name:'Contains Treasury', query_id:420, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Does it contain externally withdrawable Treasury for purposes such as compensation or incentives?', parameters_description:['treasury address']},  
    {module:MODULES.service, query_name:'Number of Arbitrations', query_id:421, parameters:[], return:ValueType.TYPE_U64, description:'The number of arbitrations that allows a refund to be made from the order at any time based on the arbitration result.', },   
    {module:MODULES.service, query_name:'Contains Arbitration', query_id:422, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Does it contain an arbitration that allows a refund to be made from the order at any time based on the arbitration result.?', parameters_description:['arbitration address']},  
    {module:MODULES.service, query_name:'Type', query_id:423, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.service, query_name:'Type with Original Ids', query_id:424, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 

    {module:MODULES.order, query_name:'Amount', query_id:500, parameters:[], return:ValueType.TYPE_U64, description:'Order amount.', },       
    {module:MODULES.order, query_name:'Payer', query_id:501, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Order payer.', },
    {module:MODULES.order, query_name:'Service', query_id:502, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Service for creating orders.', },   
    {module:MODULES.order, query_name:'Has Progress', query_id:503, parameters:[], return:ValueType.TYPE_BOOL, description:'Is there a Progress for executing the order process?', },   
    {module:MODULES.order, query_name:'Progress', query_id:504, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Progress address for executing the order process.', },       
    {module:MODULES.order, query_name:'Required Info', query_id:505, parameters:[], return:ValueType.TYPE_BOOL, description:'Is Required Info set?', },
    {module:MODULES.order, query_name:'Discount Used', query_id:506, parameters:[], return:ValueType.TYPE_BOOL, description:'Discount coupon used for this order?', },   
    {module:MODULES.order, query_name:'Discount', query_id:507, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Discount address that already used.', }, 
    {module:MODULES.order, query_name:'Balance', query_id:508, parameters:[], return:ValueType.TYPE_U64, description:'The amount currently in the order.', }, 
    {module:MODULES.order, query_name:'Number of Agents', query_id:511, parameters:[], return:ValueType.TYPE_U64, description:'The number of agents for the order.', }, 
    {module:MODULES.order, query_name:'Has Agent', query_id:512, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether an address is an order agent?', parameters_description:['agent address']}, 
    {module:MODULES.order, query_name:'Number of Disputes', query_id:513, parameters:[], return:ValueType.TYPE_U64, description:'Number of arbitrations for the order.', },
    {module:MODULES.order, query_name:'Has Arb', query_id:514, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Does the order contain an Arb for arbitration?', parameters_description:['arb address']},   
    {module:MODULES.order, query_name:'Type', query_id:515, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.order, query_name:'Type with Original Ids', query_id:516, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 

    {module:MODULES.machine, query_name:'Permission', query_id:700, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Permission object address.', },
    {module:MODULES.machine, query_name:'Paused', query_id:701, parameters:[], return:ValueType.TYPE_BOOL, description:'Pause the creation of new Progress?', },
    {module:MODULES.machine, query_name:'Published', query_id:702, parameters:[], return:ValueType.TYPE_BOOL, description:'Is it allowed to create Progress?', },
    {module:MODULES.machine, query_name:'Is Consensus Repository', query_id:703, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether an address is a consensus repository?', parameters_description:['adddress']},
    {module:MODULES.machine, query_name:'Has Endpoint', query_id:704, parameters:[], return:ValueType.TYPE_BOOL, description:'Is the endpoint set?', },   
    {module:MODULES.machine, query_name:'Endpoint', query_id:705, parameters:[], return:ValueType.TYPE_STRING, description:'Endpoint url/ipfs.', },

    {module:MODULES.progress, query_name:'Machine', query_id:800, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The Machine object that created this Progress.', },       
    {module:MODULES.progress, query_name:'Current Node', query_id:801, parameters:[], return:ValueType.TYPE_STRING, description:'The name of the currently running node.', },
    {module:MODULES.progress, query_name:'Has Parent', query_id:802, parameters:[], return:ValueType.TYPE_BOOL, description:'Is the parent Progress defined?', },   
    {module:MODULES.progress, query_name:'Parent', query_id:803, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The parent Progress, that contains some child Progress.', },   
    {module:MODULES.progress, query_name:'Has Task', query_id:804, parameters:[], return:ValueType.TYPE_BOOL, description:'Does it contain clear task(eg. an Order)?', },       
    {module:MODULES.progress, query_name:'Task', query_id:805, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Task object address.', },
    {module:MODULES.progress, query_name:'Has Unique Permission', query_id:806, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Does Progress define a unique operation permission?', parameters_description:['operator name']},   
    {module:MODULES.progress, query_name:'Is Unique Permission Operator', query_id:807, parameters:[ValueType.TYPE_STRING, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Is an address an operator with unique permissions?', parameters_description:['operator name','address']}, 
    {module:MODULES.progress, query_name:'Has Context Repository', query_id:808, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the repository reference for Progress is set?', },
    {module:MODULES.progress, query_name:'Context Repository', query_id:809, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Repository reference for Progress.', },   
    {module:MODULES.progress, query_name:'Last Session Time', query_id:810, parameters:[], return:ValueType.TYPE_U64, description:'Time when the previous session was completed.', },
    {module:MODULES.progress, query_name:'Last Session Node', query_id:811, parameters:[], return:ValueType.TYPE_STRING, description:'The name of the last completed node.', },  
    {module:MODULES.progress, query_name:'Current Session-id', query_id:812, parameters:[], return:ValueType.TYPE_U64, description:'The session id of ongoing node.', },  
    {module:MODULES.progress, query_name:'Parent Session-id', query_id:813, parameters:[], return:ValueType.TYPE_U64, description:'The child process was started in the Session-id phase of the parent process.', },   
    {module:MODULES.progress, query_name:'Parent Next Node', query_id:814, parameters:[], return:ValueType.TYPE_STRING, description:'The child process is started at the next node stage of the parent process.', },
    {module:MODULES.progress, query_name:'Parent Forward', query_id:815, parameters:[], return:ValueType.TYPE_STRING, description:'The child process is started in the Forward phase of the next node of the parent process.', },  
    {module:MODULES.progress, query_name:'Parent Node', query_id:816, parameters:[], return:ValueType.TYPE_STRING, description:'The node name of the parent process where the child process is located.', },  
    {module:MODULES.progress, query_name:'Forward Accomplished', query_id:817, parameters:[ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Has the forward been accomplished?', parameters_description:['session-id', 'next node name', 'forward name']},  
    {module:MODULES.progress, query_name:'Forward Operator', query_id:818, parameters:[ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_ADDRESS, description:'The forward operator.', parameters_description:['session-id', 'next node name', 'forward name']},   
    {module:MODULES.progress, query_name:'Forward Message', query_id:819, parameters:[ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_STRING, description:'The forward message.', parameters_description:['session-id', 'next node name', 'forward name']},
    {module:MODULES.progress, query_name:'Forward Order Count', query_id:820, parameters:[ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'The forward Order count.', parameters_description:['session-id', 'next node name', 'forward name']},  
    {module:MODULES.progress, query_name:'Forward time', query_id:821, parameters:[ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'The time when the forward was last triggered.', parameters_description:['session-id', 'next node name', 'forward name']},  
    {module:MODULES.progress, query_name:'Closest Session Time', query_id:822, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'The time a node that closest time to the current node completes its session.', parameters_description:['node name']},  
    {module:MODULES.progress, query_name:'Closest Forward Accomplished', query_id:823, parameters:[ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_BOOL, description:'Has the forward been accomplished?', parameters_description:['node name', 'next node name', 'forward name']},  
    {module:MODULES.progress, query_name:'Closest Forward Operator', query_id:824, parameters:[ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_ADDRESS, description:'The operator of the forward that closest time to the current node.', parameters_description:['node name', 'next node name', 'forward name']},   
    {module:MODULES.progress, query_name:'Closest Forward Message', query_id:825, parameters:[ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_STRING, description:'The message of the forward that closest time to the current node.', parameters_description:['node name', 'next node name', 'forward name']},
    {module:MODULES.progress, query_name:'Closest Forward Order Count', query_id:826, parameters:[ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'The Order count of the forward that closest time to the current node.', parameters_description:['node name', 'next node name', 'forward name']},  
    {module:MODULES.progress, query_name:'Closest Forward time', query_id:827, parameters:[ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'The time when the forward that closest time to the current node was last triggered.', parameters_description:['node name', 'next node name', 'forward name']},  
    {module:MODULES.progress, query_name:'Node Sessions completed', query_id:828, parameters:[ValueType.TYPE_STRING], return:ValueType.TYPE_U64, description:'The number of completed sessions at the node', parameters_description:['node name']},  

    {module:MODULES.wowok, query_name:'Builder', query_id:900, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Builder address of Wowok.', }, 
    {module:MODULES.wowok, query_name:'Object of Entities', query_id:901, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The address of entity information object.', },
    {module:MODULES.wowok, query_name:'Grantor Count', query_id:902, parameters:[], return:ValueType.TYPE_U64, description:'Number of registered grantors.', },   
    {module:MODULES.wowok, query_name:'Has Grantor', query_id:903, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether an address has been registered as a grantor?', parameters_description:['address']}, 
    {module:MODULES.wowok, query_name:'Grantor Name', query_id:904, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_STRING, description:"Name of a grantor.", parameters_description:['address']}, 
    {module:MODULES.wowok, query_name:'Grantor Registration Time', query_id:905, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Registration time of a grantor.', parameters_description:['address']}, 
    {module:MODULES.wowok, query_name:'Grantor Expired Time', query_id:906, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The expiration time of a grantor.', parameters_description:['address']}, 
    {module:MODULES.wowok, query_name:'Grantee Object for Grantor', query_id:907, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_ADDRESS, description:'Grantee repository address of a grantor.', parameters_description:['address']}, 

    {module:MODULES.payment, query_name:'Sender', query_id:1200, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Payment originator address.', }, 
    {module:MODULES.payment, query_name:'Total Amount', query_id:1201, parameters:[], return:ValueType.TYPE_U128, description:"Payment amount.", }, 
    {module:MODULES.payment, query_name:'Remark', query_id:1202, parameters:[], return:ValueType.TYPE_STRING, description:'Payment remark.', parameters_description:['address']}, 
    {module:MODULES.payment, query_name:'Has Guard for Perpose', query_id:1203, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the payment references a Guard?', }, 
    {module:MODULES.payment, query_name:'Has Object for Perpose', query_id:1204, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the payment references an Object?', }, 
    {module:MODULES.payment, query_name:'Guard for Perpose', query_id:1205, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The Guard referenced by this payment.', }, 
    {module:MODULES.payment, query_name:'Object for Perpose', query_id:1206, parameters:[], return:ValueType.TYPE_ADDRESS, description:"The Object referenced by this payment.", }, 
    {module:MODULES.payment, query_name:'Number of Recipients', query_id:1207, parameters:[], return:ValueType.TYPE_U64, description:'Number of recipients to receive payment from.', }, 
    {module:MODULES.payment, query_name:'Is a Recipient', query_id:1208, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Is a recipient received the payment?', parameters_description:['address']}, 
    {module:MODULES.payment, query_name:'Amount for a Recipient', query_id:1209, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The amount of payment received by an address.', parameters_description:['address']}, 
    {module:MODULES.payment, query_name:'Time', query_id:1210, parameters:[], return:ValueType.TYPE_U64, description:'Payment time', }, 
    {module:MODULES.payment, query_name:'Is from Treasury', query_id:1211, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the payment comes from a Treasury?', }, 
    {module:MODULES.payment, query_name:'Treasury Address', query_id:1212, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The Treasury from which the payment comes.', }, 
    {module:MODULES.payment, query_name:'Biz-ID', query_id:1213, parameters:[], return:ValueType.TYPE_U64, description:'Bisiness ID number of the payment.', }, 
    {module:MODULES.payment, query_name:'Check the purpose of payment', query_id:1214, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], return:ValueType.TYPE_BOOL, description:'Do Guard, Object Perpose, and Biz-ID match?', parameters_description:['guard address', 'object address', 'Biz-ID']}, 
    {module:MODULES.payment, query_name:'Check & Amount for a Recipient', query_id:1215, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS, ValueType.TYPE_U64, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U128, description:'Check and get the amount of payment received by an address.', parameters_description:['guard address', 'object address', 'Biz-ID', 'recipient address']}, 
    {module:MODULES.payment, query_name:'Type', query_id:1216, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.payment, query_name:'Type with Original Ids', query_id:1217, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 

    {module:MODULES.treasury, query_name:'Permission', query_id:1400, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Permission object address.', }, 
    {module:MODULES.treasury, query_name:'Balance', query_id:1401, parameters:[], return:ValueType.TYPE_U64, description:"Treasury balance.", }, 
    {module:MODULES.treasury, query_name:'Number of Flow Records', query_id:1402, parameters:[], return:ValueType.TYPE_U64,  description:'Number of treasury transactions.', }, 
    {module:MODULES.treasury, query_name:'Inflow Amount', query_id:1403, parameters:[], return:ValueType.TYPE_U128,  description:'Treasury inflow amount.', }, 
    {module:MODULES.treasury, query_name:'Outflow Amount', query_id:1404, parameters:[], return:ValueType.TYPE_U128,  description:'Treasury outflow amount.', }, 
    {module:MODULES.treasury, query_name:'Has Deposit Guard', query_id:1405, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether the deposit Guard set?', }, 
    {module:MODULES.treasury, query_name:'Deposit Guard', query_id:1406, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Deposit Guard address.', }, 
    {module:MODULES.treasury, query_name:'Number of Withdraw Guards', query_id:1407, parameters:[], return:ValueType.TYPE_U64,  description:'Number of withdraw guards.', }, 
    {module:MODULES.treasury, query_name:'Has Withdraw Guard', query_id:1408, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Has a Withdraw Guard added?', parameters_description:['guard address']}, 
    {module:MODULES.treasury, query_name:'Withdrawal Amount with Guard', query_id:1409, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64,  description:'withdrawal amount corresponding the Guard.', parameters_description:['guard address']}, 
    {module:MODULES.treasury, query_name:'Recent Time with Operation', query_id:1410, parameters:[ValueType.TYPE_U8], return:ValueType.TYPE_U64,  description:'Time of the most recent fund operation.', parameters_description:['operation']}, 
    {module:MODULES.treasury, query_name:'Recent Signer with Operation', query_id:1411, parameters:[ValueType.TYPE_U8], return:ValueType.TYPE_ADDRESS, description:'Signer address of the most recent fund operation.', parameters_description:['operation']}, 
    {module:MODULES.treasury, query_name:'Recent Payment with Operation', query_id:1412, parameters:[ValueType.TYPE_U8], return:ValueType.TYPE_ADDRESS, description:'Payment address of the most recent fund operation.', parameters_description:['operation']}, 
    {module:MODULES.treasury, query_name:'Recent Amount with Operation', query_id:1413, parameters:[ValueType.TYPE_U8], return:ValueType.TYPE_U64,  description:'Amount of the most recent fund operation.', parameters_description:['operation']}, 
    {module:MODULES.treasury, query_name:'Recent Time with Op/Pmt', query_id:1414, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Time of the most recent fund operation with payment specified.', parameters_description:['operation', 'payment address']}, 
    {module:MODULES.treasury, query_name:'Recent Signer with Op&Pmt', query_id:1415, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_ADDRESS, description:'Signer of the most recent fund operationwith payment specified.', parameters_description:['operation', 'payment address']}, 
    {module:MODULES.treasury, query_name:'Recent Amount with Op/Pmt', query_id:1416, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Amount of the most recent fund operation with payment specified.', parameters_description:['operation', 'payment address']}, 
    {module:MODULES.treasury, query_name:'Recent Time with Op/Sgr', query_id:1417, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Time of the most recent fund operation with signer specified.', parameters_description:['operation', 'signer address']}, 
    {module:MODULES.treasury, query_name:'Recent Payment with Op/Sgr', query_id:1418, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_ADDRESS, description:'Payment of the most recent fund operation with singner specified.', parameters_description:['operation', 'signer address']}, 
    {module:MODULES.treasury, query_name:'Recent Amount with Op/Sgr', query_id:1419, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Amount of the most recent fund operation with singer specified.', parameters_description:['operation', 'signer address']}, 
    {module:MODULES.treasury, query_name:'Recent Time with Op/Pmt/Sgr', query_id:1420, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Time of the most recent fund operation.', parameters_description:['operation', 'payment address', 'singer address']}, 
    {module:MODULES.treasury, query_name:'Recent Amount with Op/Pmt/Sgr', query_id:1421, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Amount of the most recent fund operation.', parameters_description:['operation', 'payment address', 'singer address']}, 
    {module:MODULES.treasury, query_name:'Has Operation', query_id:1422, parameters:[ValueType.TYPE_U8], return:ValueType.TYPE_BOOL, description:'Whether there was a fund operation?', parameters_description:['operation']}, 
    {module:MODULES.treasury, query_name:'Has Operation with Pmt', query_id:1423, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether there was a fund operation with payment specified?', parameters_description:['operation', 'payment address']}, 
    {module:MODULES.treasury, query_name:'Has Operation with Sgr', query_id:1424, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether there was a fund operation with singer specified?', parameters_description:['operation', 'singer address']}, 
    {module:MODULES.treasury, query_name:'Has Operation with Pmt/Sgr', query_id:1425, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Whether there was a fund operation?', parameters_description:['operation', 'payment address', 'singer address']}, 
    {module:MODULES.treasury, query_name:'Operation at Least Times', query_id:1426, parameters:[ValueType.TYPE_U8, ValueType.TYPE_U8], return:ValueType.TYPE_BOOL, description:'Does it operate at least a certain number of times?', parameters_description:['operation', 'at least times']}, 
    {module:MODULES.treasury, query_name:'Operation at Least Times by a Signer', query_id:1427, parameters:[ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_U8], return:ValueType.TYPE_BOOL, description:'Does it operate at least a certain number of times by a signer?', parameters_description:['operation', 'signer address', 'at least times']}, 
    {module:MODULES.treasury, query_name:'Type', query_id:1428, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.treasury, query_name:'Type with Original Ids', query_id:1429, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 

    {module:MODULES.arbitration, query_name:'Permission', query_id:1500, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Permission object address.', }, 
    {module:MODULES.arbitration, query_name:'Paused', query_id:1501, parameters:[], return:ValueType.TYPE_BOOL, description:"Is it allowed to create Arb?", }, 
    {module:MODULES.arbitration, query_name:'Fee', query_id:1502, parameters:[], return:ValueType.TYPE_U64, description:'Cost of arbitration.', }, 
    {module:MODULES.arbitration, query_name:'Has Endpoint', query_id:1503, parameters:[], return:ValueType.TYPE_BOOL, description:'Is the endpoint set?', }, 
    {module:MODULES.arbitration, query_name:'Endpoint', query_id:1504, parameters:[], return:ValueType.TYPE_STRING, description:'Endpoint url/ipfs.', }, 
    {module:MODULES.arbitration, query_name:'Has Customer Guard', query_id:1505, parameters:[], return:ValueType.TYPE_BOOL, description:'Is there Guard set to apply for arbitration?', }, 
    {module:MODULES.arbitration, query_name:'Customer Guard', query_id:1506, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Guard to apply for arbitration.', }, 
    {module:MODULES.arbitration, query_name:'Number of Voting Guard', query_id:1507, parameters:[], return:ValueType.TYPE_U64, description:'Number of voting guards.', }, 
    {module:MODULES.arbitration, query_name:'Has Voting Guard', query_id:1508, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Has the voting Guard added?', parameters_description:['guard address']}, 
    {module:MODULES.arbitration, query_name:'Voting Weight', query_id:1509, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'Voting weight of the voting Guard.', parameters_description:['guard address']}, 
    {module:MODULES.arbitration, query_name:'Treasury', query_id:1510, parameters:[], return:ValueType.TYPE_ADDRESS, description:'The address of the Treasury where fees was collected at the time of withdrawal.', }, 
    {module:MODULES.arbitration, query_name:'Type', query_id:1511, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.arbitration, query_name:'Type with Original Ids', query_id:1512, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 

    {module:MODULES.arb, query_name:'Order', query_id:1600, parameters:[], return:ValueType.TYPE_ADDRESS, description:'Order under arbitration.', }, 
    {module:MODULES.arb, query_name:'Arbitration', query_id:1601, parameters:[], return:ValueType.TYPE_ADDRESS, description:"Arbitration object address.", }, 
    {module:MODULES.arb, query_name:'Feedback', query_id:1602, parameters:[], return:ValueType.TYPE_STRING, description:'Arbitration feedback.', }, 
    {module:MODULES.arb, query_name:'Has Compensation', query_id:1603, parameters:[], return:ValueType.TYPE_BOOL, description:'Whether there is an arbitration result?', }, 
    {module:MODULES.arb, query_name:'Compensation', query_id:1604, parameters:[], return:ValueType.TYPE_U64, description:'Compensation should be given to the order payer.', }, 
    {module:MODULES.arb, query_name:'Unclaimed Arbitration Costs', query_id:1605, parameters:[], return:ValueType.TYPE_U64, description:'Unclaimed arbitration costs.', }, 
    {module:MODULES.arb, query_name:'Turnout', query_id:1606, parameters:[], return:ValueType.TYPE_U64, description:'The number of addresses have voted.', }, 
    {module:MODULES.arb, query_name:'Has voted', query_id:1607, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_BOOL, description:'Has someone voted?', parameters_description:['voter address']}, 
    {module:MODULES.arb, query_name:'Voting weight', query_id:1608, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The weight of a complete vote for the address.', parameters_description:['voter address']}, 
    {module:MODULES.arb, query_name:'Voting Time', query_id:1609, parameters:[ValueType.TYPE_ADDRESS], return:ValueType.TYPE_U64, description:'The time of a complete vote for the address.', parameters_description:['voter address']}, 
    {module:MODULES.arb, query_name:'Voting Option', query_id:1610, parameters:[ValueType.TYPE_ADDRESS, ValueType.TYPE_U8], return:ValueType.TYPE_BOOL, description:'Does an address complete voting for the option?', parameters_description:['voter address', 'option index']}, 
    {module:MODULES.arb, query_name:'Number of Options', query_id:1611, parameters:[], return:ValueType.TYPE_U64, description:'Number of voting options.', }, 
    {module:MODULES.arb, query_name:'Number of Votes', query_id:1612, parameters:[ValueType.TYPE_U8], return:ValueType.TYPE_U64, description:'The number of votes received for an option.', parameters_description:['option index']}, 
    {module:MODULES.arb, query_name:'Type', query_id:1613, parameters:[], return:ValueType.TYPE_STRING, description:'The type name', parameters_description:[]},   
    {module:MODULES.arb, query_name:'Type with Original Ids', query_id:1614, parameters:[], return:ValueType.TYPE_STRING, description:'The type name with original ids', parameters_description:[]}, 
];

export enum FunctionGroup {
    txn = 'Txn Functions', 
    number = 'Number Crunching',
    logic = 'Compare or Logic'
}

export const GuardFunctions : Guard_Options[] = [
    {from:'type', name:'Txn Signer', value:ContextType.TYPE_SIGNER, group:FunctionGroup.txn, return:ValueType.TYPE_ADDRESS},
    {from:'type', name:'Txn Time', value:ContextType.TYPE_CLOCK, group:FunctionGroup.txn, return:ValueType.TYPE_U64},
    {from:'type', name:'Guard Address', value:ContextType.TYPE_GUARD, group:FunctionGroup.txn, return:ValueType.TYPE_ADDRESS},
    {from:'type', name:'PositiveNumber to Address', value:OperatorType.TYPE_NUMBER_ADDRESS, group:FunctionGroup.number, return:ValueType.TYPE_ADDRESS},
    {from:'type', name:'PositiveNumber Add (+)', value:OperatorType.TYPE_NUMBER_ADD, group:FunctionGroup.number, return:'number'},
    {from:'type', name:'PositiveNumber Subtract (-)', value:OperatorType.TYPE_NUMBER_SUBTRACT, group:FunctionGroup.number, return:'number'},
    {from:'type', name:'PositiveNumber Multiply (*)', value:OperatorType.TYPE_NUMBER_MULTIPLY, group:FunctionGroup.number, return:'number'},
    {from:'type', name:'PositiveNumber Devide (/)', value:OperatorType.TYPE_NUMBER_DEVIDE, group:FunctionGroup.number, return:'number'},
    {from:'type', name:'PositiveNumber Mod (%)', value:OperatorType.TYPE_NUMBER_MOD, group:FunctionGroup.number, return:'number'},
]

export class Guard {
    static MAX_INPUT_LENGTH = 10240;
//    static MAX_PAYLOADS_LENGTH = 4096;
    
    protected txb;
    protected object : TxbObject;
    get_object() { return this.object }

    static From(txb:TransactionBlock,  object:TxbObject) : Guard {
        let d = new Guard(txb)
        d.object = Protocol.TXB_OBJECT(txb, object)
        return d
    }

    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object =  '';
    }

    static New(txb:TransactionBlock, description:string, maker:GuardMaker) : Guard {
        if (!maker.IsReady()) {
            ERROR(Errors.InvalidParam, 'launch maker');
        }

        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let bcs_input = maker.get_input()[0];
        let constants = maker.get_constant();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            ERROR(Errors.InvalidParam, 'launch input')
        }
    
        let bValid = true;
        constants?.forEach((v, k) => {
            if (!GuardMaker.IsValidIndentifier(k)) bValid = false;
            if (v.value && v.bWitness) bValid =  false;
            if (v.value === undefined && !v.bWitness) bValid =  false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'launch constants')
        }
        
        let input = new  Uint8Array(bcs_input); // copy new uint8array to reserve!

        // reserve the  bytes for guard
        let g = new Guard(txb);
        g.object = txb.moveCall({
            target: Protocol.Instance().guardFn('new') as FnCallType,
            arguments: [txb.pure.string(description), txb.pure.vector('u8', [].slice.call(input.reverse()))],  
        });

        constants?.forEach((v, k) => {
            if (v.bWitness) {
                const n = new Uint8Array(1); n.set([v.type], 0);
                txb.moveCall({
                    target:Protocol.Instance().guardFn("constant_add") as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, g.object), txb.pure.u8(k), txb.pure.bool(true), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                }) 
            } else {
                const n = insertAtHead(v.value!, v.type);
                txb.moveCall({
                    target:Protocol.Instance().guardFn("constant_add") as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, g.object), txb.pure.u8(k), txb.pure.bool(false),  txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                }) 
            }
        });
        return g
    }

    launch() : GuardAddress  {
        return this.txb.moveCall({
            target:Protocol.Instance().guardFn("create") as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    
    static everyone_guard(txb:TransactionBlock) : GuardAddress {
        return txb.moveCall({
            target: Protocol.Instance().guardFn('everyone_guard') as FnCallType,
            arguments: []
        }); 
    }

    static QueryAddressIdentifiers(guard:GuardObject, onQueryAnswer:OnQueryAnswer, sender:string) {    
        const txb = new TransactionBlock();
        txb.moveCall({
            target: Protocol.Instance().guardFn('query_address_identifiers') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, guard)]
        })

        Protocol.Client().devInspectTransactionBlock({sender:sender, transactionBlock:txb}).then((res) => {
            if (res.results && res.results[0]?.returnValues && res.results[0]?.returnValues?.length !== 1 )  {
                onQueryAnswer({err:'not match', txb:txb, identifiers:[]});
                return 
            }
            const identifiers = bcs.vector(bcs.u8()).parse(Uint8Array.from((res.results as any)[0].returnValues[0][0]));
            onQueryAnswer({identifiers:identifiers, txb:txb});
        }).catch((e) => {
            console.log(e);
            onQueryAnswer({err:e, txb:txb, identifiers:[]});
        })
    }


    static BoolCmd:GuardQuery[] = GUARD_QUERIES.filter(q => q.return === ValueType.TYPE_BOOL);
    static IsBoolCmd = (cmd:number) : boolean => { return Guard.BoolCmd.some((q:GuardQuery) => {return q.query_id == cmd}) };
    static CmdFilter = (retType:ValueType) => { return GUARD_QUERIES.filter((q)=> q.return === retType)};
    static GetCmd = (cmd:number | undefined) : GuardQuery | undefined => { 
        return GUARD_QUERIES.find((q) => {return q.query_id == cmd}) ;
    }
    static GetCmdOption = (cmd:number) : Guard_Options | undefined => { 
        const  r = Guard.GetCmd(cmd);
        if (!r) return r;
        return  {from:'query', name:r.query_name, value:r.query_id, group:FirstLetterUppercase(r.module), return:r.return}
    }

    static GetInputParams = (cmd:number) : ValueType[] => { 
        const r = Guard.GetCmd(cmd);
        if (!r) return [];
        return r.parameters;
    }
    static GetModuleName = (cmd:number) : string => {
        let r = Guard.GetCmd(cmd);
        if (!r) return '';
        return FirstLetterUppercase(r.module)
    }
    static NumberOptions = () : Guard_Options[] => {
        const r: Guard_Options[] = [...Guard.CmdFilter(ValueType.TYPE_U8), ...Guard.CmdFilter(ValueType.TYPE_U64), 
            ...Guard.CmdFilter(ValueType.TYPE_U128), ...Guard.CmdFilter(ValueType.TYPE_U256)].map((v)=> { 
                return {from:'query', name:v.query_name, value:v.query_id, group:FirstLetterUppercase(v.module), return:v.return}});
        return r.concat(GuardFunctions.filter(v=>v.return==='number' || v.return === ValueType.TYPE_U8 
            || v.return === ValueType.TYPE_U64 || v.return === ValueType.TYPE_U128 || v.return === ValueType.TYPE_U256));
    }

    static Signer:Guard_Options = GuardFunctions.find(v => v.name==='Txn Signer' && v.value===ContextType.TYPE_SIGNER)!;
    static Time:Guard_Options = GuardFunctions.find(v => v.name==='Txn Time' && v.value===ContextType.TYPE_CLOCK)!; 
    static Guard:Guard_Options = GuardFunctions.find(v => v.name==='Guard Address' && v.value===ContextType.TYPE_GUARD)!; 

    static Logics = () :Guard_Options[] => LogicsInfo.map((v) => { return {from:'type', name:v[1] as string, value:v[0] as number, group:FunctionGroup.logic, return:ValueType.TYPE_BOOL}});
    //@deprecated. Crunchings: Ambiguous semantics
    static Crunchings: Guard_Options[] = GuardFunctions.filter(v => v.value === OperatorType.TYPE_NUMBER_ADD ||
        v.value === OperatorType.TYPE_NUMBER_SUBTRACT || v.value === OperatorType.TYPE_NUMBER_MULTIPLY || 
        v.value === OperatorType.TYPE_NUMBER_DEVIDE || v.value === OperatorType.TYPE_NUMBER_MOD || v.value === OperatorType.TYPE_NUMBER_ADDRESS
    ) ;

    static CommonOptions = (retType:ValueType) : Guard_Options[] => {
        return Guard.CmdFilter(retType).map((v)=> {return {from:'query', name:v.query_name, value:v.query_id, group:FirstLetterUppercase(v.module), return:v.return}});
    }

    static AllOptions = () :  Guard_Options[] => {
        var r:Guard_Options[] =  GUARD_QUERIES.map((v)=>{return {from:'query', name:v.query_name, value:v.query_id, group:FirstLetterUppercase(v.module), return:v.return}});
        return [...r, ...GuardFunctions, ...Guard.Logics()]
    }

    static StringOptions = () : Guard_Options[] => {
        return [...Guard.CmdFilter(ValueType.TYPE_STRING)].map((v) => {
            return {from:'query', name:v.query_name, value:v.query_id, group:FirstLetterUppercase(v.module), return:v.return};
        });
    }
    static BoolOptions = () : Guard_Options[] => {
        const n1:Guard_Options[] = Guard.BoolCmd.map((v)=> { return {from:'query', name:v.query_name, value:v.query_id, group:FirstLetterUppercase(v.module), return:v.return}});
        return [...n1, ...Guard.Logics()];
    }
    static AddressOptions = () : Guard_Options[] => {
        const n1:Guard_Options[] = GUARD_QUERIES.filter(q => q.return === ValueType.TYPE_ADDRESS).map((v)=> { return {from:'query', name:v.query_name, value:v.query_id, group:FirstLetterUppercase(v.module), return:v.return}});
        return [...n1, ...GuardFunctions.filter(v=>v.return===ValueType.TYPE_ADDRESS)]
    }

    static Options = (ret_type: ValueType | 'number' | 'any') : Guard_Options[] => {
        if (ret_type === 'number') {
            return Guard.NumberOptions();
        } else if (ret_type === 'any') {
            return Guard.AllOptions();
        }

        switch(ret_type as number) {
            case ValueType.TYPE_BOOL:
                return Guard.BoolOptions();
            case ValueType.TYPE_STRING:
                return Guard.StringOptions();
        }
        return Guard.CommonOptions(ret_type);
    }
}

export const IsValidGuardIdentifier = (identifier:number | undefined) : boolean => {
    return IsValidU8(identifier) && identifier !== 0;
}
export class GuardMaker {
    protected data : Uint8Array[] = [];
    protected type_validator : Data_Type[] = [];
    protected constant : GuardConstant = new Map<number, Guard_Variable>();

    private static _witness_index: number = 1;
    private static _const_index: number = 255;
    private static GetWitnessIndex() {
        if (this._witness_index >= this._const_index) {
            ERROR(Errors.Fail, 'too many witness')
        }
        return GuardMaker._witness_index++        
    }
    private static getConstIndex() { 
        if (this._const_index <= this._witness_index) {
            ERROR(Errors.Fail, 'too many const')
        }
        return GuardMaker._const_index--
    }
    static IsValidIndentifier = (identifier:number) : boolean => {
        if (!IsValidU8(identifier) || identifier < 1) return false;
        return true
    }
    constructor() { }

    // undefined value means witness
    add_constant(type:ValueType, value?:any, identifier?:number, bNeedSerialize=true) : number {
        if (identifier === undefined) {
            if (value === undefined) identifier = GuardMaker.GetWitnessIndex();
            else identifier = GuardMaker.getConstIndex();
        }
        let v = this.constant.get(identifier);
        if (!v) {
            if (bNeedSerialize && value !== undefined) {
                value = Bcs.getInstance().ser(type, value);
            } 
            this.constant.set(identifier, {type:type, value:value===undefined ? undefined:value, bWitness:value===undefined ? true:false});               
        } 
        return identifier
    }

    // serialize const & data, WITNESS use constants only.
    add_param(type:ValueType | ContextType, param?:any) : GuardMaker {
        switch(type)  {
        case ValueType.TYPE_ADDRESS: 
        case ValueType.TYPE_BOOL:
        case ValueType.TYPE_U8:
        case ValueType.TYPE_U64: 
        case ValueType.TYPE_U128: 
        case ValueType.TYPE_U256: 
        case ValueType.TYPE_VEC_ADDRESS: 
        case ValueType.TYPE_VEC_BOOL: 
        case ValueType.TYPE_VEC_U128: 
        case ValueType.TYPE_VEC_U64: 
        case ValueType.TYPE_VEC_VEC_U8: 
        case ValueType.TYPE_OPTION_U64: 
        case ValueType.TYPE_OPTION_ADDRESS:
        case ValueType.TYPE_OPTION_BOOL:
        case ValueType.TYPE_OPTION_U128:
        case ValueType.TYPE_OPTION_U256:
        case ValueType.TYPE_OPTION_U8:
        case ValueType.TYPE_VEC_U256:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.data.push(Bcs.getInstance().ser(type as number, param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STRING:
        case ValueType.TYPE_VEC_U8:
            if (!param) ERROR(Errors.InvalidParam, 'param: ' + type);
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); 
            if (typeof(param) == 'string') {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_STRING, param));
            } else {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_VEC_U8, param));
            }
            this.type_validator.push(type);
            break;
        case ContextType.TYPE_SIGNER:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;
        case ContextType.TYPE_GUARD:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;
        case ContextType.TYPE_CLOCK:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_U64);
            break;
        case ContextType.TYPE_CONSTANT: 
            if (!IsValidGuardIdentifier(param)) {
                ERROR(Errors.IsValidGuardIdentifier, 'add_param param:'+type);
            }
            
            var v = this.constant.get(param);
            if (!v) ERROR(Errors.Fail, 'identifier not in constant:'+param);
            this.type_validator.push(v!.type); //@ type validator convert
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // constant flag
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, param)); // identifier
            break;
        default:
            ERROR(Errors.InvalidParam, 'add_param type:'+type);
        };
        return this;
    }

    add_query(module:MODULES, query_name:string, object_address_from:string | number) : GuardMaker {        
        const query = GUARD_QUERIES.filter((q) => { 
            return q.module ==  module && q.query_name  == query_name
        })
        if (query.length !== 1)  {
            ERROR(Errors.InvalidParam, 'add_query2:'+query_name);
        }
        return this.add_query2(query[0].query_id, object_address_from)
    }

    // object_address_from: string for static address; number as identifier  inconstant
    add_query2(query_id:number, object_address_from:string | number) : GuardMaker {        
        const query_index = GUARD_QUERIES.findIndex((q) => { 
            return q.query_id ==  query_id
        })
        if (query_index == -1)  {
            ERROR(Errors.InvalidParam, 'query_id:'+query_id);
        }

        if (typeof(object_address_from) == 'number' ) {
            if (!GuardMaker.IsValidIndentifier(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from:'+query_id);
            }
        } else {
            if (!IsValidAddress(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from:'+query_id);
            }
        }

        let offset = this.type_validator.length - GUARD_QUERIES[query_index].parameters.length;
        if (offset < 0) { 
            ERROR(Errors.InvalidParam, 'offset:'+query_id);
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, GUARD_QUERIES[query_index].parameters)) { // type validate 
            ERROR(Errors.Fail, 'array_equal:'+query_id);
        }
        
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof(object_address_from) == 'string') {
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ValueType.TYPE_ADDRESS)); 
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        } else {
            let v =  this.constant.get(object_address_from);
            if (!v) ERROR(Errors.Fail, 'object_address_from not in constant:'+query_id);
            if (v?.type == ValueType.TYPE_ADDRESS) {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_CONSTANT));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            } else {
                ERROR(Errors.Fail, 'type bWitness not match:'+query_id)
            }
        }
        
        this.data.push(bcs.u16().serialize(GUARD_QUERIES[query_index].query_id).toBytes()); // cmd(u16)
        this.type_validator.splice(offset, GUARD_QUERIES[query_index].parameters.length); // delete type stack
        this.type_validator.push(GUARD_QUERIES[query_index].return); // add the return value type to type stack
        return this;
    }

    add_logic(type:OperatorType, logic_count:number=2) : GuardMaker {
        var e:any = LogicsInfo.find((v:any) => v[0] === type);
        if (e) { e=e[1] }

        let splice_len = 2; let cur:any;
        let ret = ValueType.TYPE_BOOL;
        switch (type) {
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (!logic_count || logic_count < 2) ERROR(Errors.Fail, 'logic param invalid:'+e);
                splice_len = logic_count!;
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                for (let i = 1; i <= splice_len; ++i) {
                    if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - i])) { ERROR(Errors.Fail, 'type_validator check:'+e) }
                }
                break;
            case OperatorType.TYPE_LOGIC_EQUAL:
                if (!logic_count || logic_count < 2) ERROR(Errors.Fail, 'logic param invalid:'+e);
                splice_len = logic_count!;
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                cur = this.type_validator[this.type_validator.length - 1];
                for (let i = 2; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] !== cur) ERROR(Errors.Fail, 'type_validator check:' + e)  ;
                }
                break;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (!logic_count || logic_count < 2) ERROR(Errors.Fail, 'logic param invalid:'+e);
                splice_len = logic_count!;
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                for (let i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] !== ValueType.TYPE_STRING) ERROR(Errors.Fail, 'type_validator check:' + e)  ;
                }
                break;
            case OperatorType.TYPE_LOGIC_NOT:
                splice_len =  1;
                if (this.type_validator.length < splice_len) { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                if (this.type_validator[this.type_validator.length -1] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                break;
            case OperatorType.TYPE_NUMBER_ADDRESS:
                splice_len =  1; ret = ValueType.TYPE_ADDRESS;
                if (this.type_validator.length < splice_len) { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length -1])) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                break;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR: //@ logics count
                if (!logic_count || logic_count < 2) ERROR(Errors.Fail, 'logic param invalid:'+e);
                splice_len = logic_count!;
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                for (let i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length -i] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                }
                break;
            case OperatorType.TYPE_NUMBER_ADD:
            case OperatorType.TYPE_NUMBER_DEVIDE:
            case OperatorType.TYPE_NUMBER_MULTIPLY:
            case OperatorType.TYPE_NUMBER_SUBTRACT:
            case OperatorType.TYPE_NUMBER_MOD:
                if (!logic_count || logic_count < 2) ERROR(Errors.Fail, 'logic param invalid:'+e);
                splice_len = logic_count!;
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                for (let i = 1; i <= splice_len; ++i) {
                    if(!GuardMaker.match_u256(this.type_validator[this.type_validator.length -1])) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                }
                ret = ValueType.TYPE_U256;
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_logic type invalid:' + e) 
        }

        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // TYPE 
        if (GuardMaker.is_multi_input_op(type)) {
            this.data.push((Bcs.getInstance().ser(ValueType.TYPE_U8, logic_count))); //@ logics
        }    
        this.type_validator.splice(this.type_validator.length - splice_len); // delete type stack   
        this.type_validator.push(ret); // add bool to type stack
        return this;
    }

    hasIdentifier(id:number) : boolean {
        return this.constant.has(id)
    }

    build(bNot = false) : GuardMaker {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_BOOL) { 
            ERROR(Errors.Fail, 'type_validator check') 
        } // ERROR
        if (bNot) {
            this.add_logic(OperatorType.TYPE_LOGIC_NOT);
        }
        this.data.push(concatenate(Uint8Array, ...this.data) as Uint8Array);
        this.data.splice(0, this.data.length-1);
        return this;
    }

    IsReady() : boolean {
        return this.type_validator.length == 1 && this.type_validator[0] == ValueType.TYPE_BOOL && this.data.length == 1;
    }

    combine(otherBuilt:GuardMaker, bAnd:boolean = true, bCombinConstant=false) : GuardMaker {
        if (!otherBuilt.IsReady() || !this.IsReady()) { ERROR(Errors.Fail, 'both should built yet')};
        let maker = new GuardMaker();
        this.constant.forEach((v, k) => {
            maker.constant.set(k,  {type:v.type, value:v.value, bWitness:v.bWitness});
        })
        otherBuilt.constant.forEach((v, k) => {
            if (maker.constant.has(k) && !bCombinConstant) {
                ERROR(Errors.Fail, 'constant identifier exist');
            }
            maker.constant.set(k, {type:v.type, value:v.value, bWitness:v.bWitness});
        })
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser(ValueType.TYPE_U8, op), Bcs.getInstance().ser(ValueType.TYPE_U8, 2)));
        this.data.splice(0, this.data.length-1);
        maker.type_validator = this.type_validator;
        return maker
    }

    get_constant() { return this.constant  }
    get_input() { return this.data }

    // and/or + logics count
    static input_combine(input1:Uint8Array, input2:Uint8Array, bAnd:boolean = true) : Uint8Array {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser(ValueType.TYPE_U8, op), Bcs.getInstance().ser(ValueType.TYPE_U8, 2), ) as  Uint8Array;
    }
    static input_not(input:Uint8Array) : Uint8Array {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_LOGIC_NOT)) as Uint8Array;
    }

    static match_u256(type:number) : boolean {
        return (type == ValueType.TYPE_U8 || type == ValueType.TYPE_U64 || type == ValueType.TYPE_U128 || type == ValueType.TYPE_U256);
    }
    static is_multi_input_op(type:number) : boolean {
        return (type === OperatorType.TYPE_LOGIC_AS_U256_GREATER || 
            type === OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL || 
            type === OperatorType.TYPE_LOGIC_AS_U256_LESSER || 
            type === OperatorType.TYPE_LOGIC_AS_U256_LESSER ||
            type === OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL ||
            type === OperatorType.TYPE_LOGIC_AS_U256_EQUAL ||
            type === OperatorType.TYPE_LOGIC_EQUAL ||
            type === OperatorType.TYPE_LOGIC_HAS_SUBSTRING ||
            type === OperatorType.TYPE_LOGIC_AND ||
            type === OperatorType.TYPE_LOGIC_OR || 
            type === OperatorType.TYPE_NUMBER_ADD ||
            type === OperatorType.TYPE_NUMBER_DEVIDE ||
            type === OperatorType.TYPE_NUMBER_MULTIPLY ||
            type === OperatorType.TYPE_NUMBER_SUBTRACT ||
            type === OperatorType.TYPE_NUMBER_MOD)
    }
}

