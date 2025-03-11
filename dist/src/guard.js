import { Protocol, LogicsInfo, MODULES, ContextType, ValueType, OperatorType } from './protocol';
import { concatenate, array_equal, IsValidU8 } from './utils';
import { IsValidDesription, Bcs, IsValidAddress, FirstLetterUppercase, insertAtHead } from './utils';
import { ERROR, Errors } from './exception';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export const GUARD_QUERIES = [
    // module, 'name', 'id', [input], output
    [MODULES.permission, 'Owner', 1, [], ValueType.TYPE_ADDRESS, "Owner's address."],
    [MODULES.permission, 'Is Admin', 2, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain address an administrator?', ['address']],
    [MODULES.permission, 'Has Rights', 3, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL, 'Does an address have a certain permission(Admin always have permissions)?', ['address', 'permission index']],
    [MODULES.permission, 'Contains Address', 4, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is included in the personnel permission table?', ['address']],
    [MODULES.permission, 'Contains Permission', 5, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL, 'Whether a certain permission for a certain address is defined in the personnel permission table?', ['address', 'permission index']],
    [MODULES.permission, 'Contains Permission Guard', 6, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL, 'Whether a permission guard for a certain address is defined in the personnel permission table?', ['address', 'permission index']],
    [MODULES.permission, 'Permission Guard', 7, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_ADDRESS, 'Permission guard for a certain address.', ['address', 'permission index']],
    [MODULES.permission, 'Number of Entities', 8, [], ValueType.TYPE_U64, 'Number of entities in the personnel permission table.', []],
    [MODULES.permission, 'Number of Admin', 9, [], ValueType.TYPE_U64, 'Number of administrators.', []],
    [MODULES.repository, 'Permission', 100, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
    [MODULES.repository, 'Contains Policy', 101, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Is a consensus policy included?', ['the filed name']],
    [MODULES.repository, 'Is Permission set of Policy', 102, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does a certain consensus policy set data operation permissions?', ['the policy name']],
    [MODULES.repository, 'Permission of Policy', 103, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The permission index of a certain consensus policy in the Permission object.', ['the policy name']],
    [MODULES.repository, 'Value Type of Policy', 104, [ValueType.TYPE_STRING], ValueType.TYPE_U8, 'Data types defined by consensus policy.', ['the policy name']],
    [MODULES.repository, 'Contains Data', 105, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does it contain data for a certain field of an address?', ['address', 'the field name']],
    [MODULES.repository, 'Raw data without Type', 106, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U8, 'Data for a field at an address and does not contain data type information.', ['address', 'the field name']],
    [MODULES.repository, 'Raw data', 107, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U8, 'Data for a field at an address, and the first byte contains data type information.', ['address', 'the field name']],
    [MODULES.repository, 'Type', 108, [], ValueType.TYPE_U8, 'The repository Type. 0: Normal; 1: Wowok greenee.', []],
    [MODULES.repository, 'Policy Mode', 109, [], ValueType.TYPE_U8, 'Policy Mode. 0: Free mode;  1: Strict mode.', []],
    [MODULES.repository, 'Reference Count', 110, [], ValueType.TYPE_U64, 'The number of times it is referenced by other objects.', []],
    [MODULES.repository, 'Is Referenced by An Object', 111, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is it referenced by an object?', ['address']],
    [MODULES.repository, 'Number Data', 112, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_U256, 'Data for a field at an address and get unsigned integer type data.', ['address', 'the field name']],
    [MODULES.repository, 'String Data', 113, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_STRING, 'Data for a field at an address and get string type data.', ['address', 'the field name']],
    [MODULES.repository, 'Address Data', 114, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'Data for a field at an address and get address type data.', ['address', 'the field name']],
    [MODULES.repository, 'Bool Data', 115, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Data for a field at an address and get bool type data.', ['address', 'the field name']],
    [MODULES.repository, 'Number Vector Data', 116, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U256, 'Data for a field at an address and get unsigned integer vector type data.', ['address', 'the field name']],
    [MODULES.repository, 'String Vector Data', 117, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_STRING, 'Data for a field at an address and get string vector type data.', ['address', 'the field name']],
    [MODULES.repository, 'Address Vector Data', 118, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_ADDRESS, 'Data for a field at an address and get address vector type data.', ['address', 'the field name']],
    [MODULES.repository, 'Bool Vector Data', 119, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_BOOL, 'Data for a field at an address and get bool vector type data.', ['address', 'the field name']],
    [MODULES.entity, 'Has Entity', 200, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is an entity already registered?', ['address']],
    [MODULES.entity, 'Likes', 201, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The number of likes for an address by other addresses.', ['address']],
    [MODULES.entity, 'Dislikes', 202, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The number of dislikes for an address by other addresses.', ['address']],
    [MODULES.entity, 'Entity Info', 203, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8, 'Public information about an entity.', ['address']],
    [MODULES.entity, 'Has Resource by Entity?', 204, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an entity created a resource?', ['address']],
    [MODULES.entity, 'Entity Resource', 205, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'The address of a resource object created by an entity.', ['address']],
    [MODULES.demand, 'Permission', 300, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
    [MODULES.demand, 'Deadline', 302, [], ValueType.TYPE_U64, 'The expiration time of presenting.', []],
    [MODULES.demand, 'Bounty Count', 303, [], ValueType.TYPE_U64, 'Number of Bounties.', []],
    [MODULES.demand, 'Has Guard', 304, [], ValueType.TYPE_BOOL, 'Whether the present guard is set?', []],
    [MODULES.demand, 'Guard', 305, [], ValueType.TYPE_ADDRESS, 'The present guard address.', []],
    [MODULES.demand, 'Has Service Picked', 306, [], ValueType.TYPE_BOOL, 'Whether a service has been picked and bounties given?', []],
    [MODULES.demand, 'Service Picked', 307, [], ValueType.TYPE_ADDRESS, 'Service address that has been picked.', []],
    [MODULES.demand, 'Presenter Count', 308, [], ValueType.TYPE_U64, 'Number of presenters.', []],
    [MODULES.demand, 'Has Presenter', 309, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain address a presenter?', ['address']],
    [MODULES.demand, 'Who Got Bounty', 310, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'The address that bounties given.', ['address']],
    [MODULES.service, 'Permission', 400, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
    [MODULES.service, 'Payee', 401, [], ValueType.TYPE_ADDRESS, 'Payee address, that all order withdrawals will be collected to this address.', []],
    [MODULES.service, 'Has Buying Guard', 402, [], ValueType.TYPE_BOOL, 'Is the guard condition of buying set?', []],
    [MODULES.service, 'Buying Guard', 403, [], ValueType.TYPE_ADDRESS, 'Buying guard, that Purchase only if you meet the conditions of the guard.', []],
    [MODULES.service, 'Contains Repository', 404, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, "Is a certain repository one of the service's consensus repositories?", ['address']],
    [MODULES.service, 'Has Withdrawing Guard', 405, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain guard is set when withdrawing money?', ['address']],
    [MODULES.service, 'Withdrawing Guard Percent', 406, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The percentage of withdrawals allowed by a certain withdrawal guard.', ['address']],
    [MODULES.service, 'Has Refunding Guard', 407, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain guard is set when refunding money?', ['address']],
    [MODULES.service, 'Refunding Guard Percent', 408, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The percentage of refund allowed by a certain refund guard.', ['address']],
    [MODULES.service, 'Has Sales Item', 409, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Is there a sales item for the service?', ['the item name']],
    [MODULES.service, 'Sale Item Price', 410, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'What is the price of a certain sale item?', ['the item name']],
    [MODULES.service, 'Sale Item Inventory', 411, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'How much inventory is there for a certain sales item?', ['the item name']],
    [MODULES.service, 'Has Machine', 412, [], ValueType.TYPE_BOOL, "Has the machine(progress generator) that serves the order been set up?", []],
    [MODULES.service, 'Machine', 413, [], ValueType.TYPE_ADDRESS, 'Machine address, that generate progresses serving the execution process of order.', []],
    [MODULES.service, 'Paused', 414, [], ValueType.TYPE_BOOL, 'Pause the creation of new order?'],
    [MODULES.service, 'Published', 415, [], ValueType.TYPE_BOOL, 'Is it allowed to create orders?'],
    [MODULES.service, 'Has Required Info', 416, [], ValueType.TYPE_BOOL, 'Whether the necessary information that needs to be provided by the customer is set?', []],
    [MODULES.service, 'Required Info of Service-Pubkey', 417, [], ValueType.TYPE_STRING, 'The public key used to encrypt customer information, and only the service provider can decrypt and view customer information.', []],
    [MODULES.service, 'Required Info', 418, [], ValueType.TYPE_VEC_STRING, 'Names of the required information item that needs to be provided by the customer.', []],
    [MODULES.service, 'Number of Treasuries', 419, [], ValueType.TYPE_U64, 'The number of treasuries that can be externally withdrawn for purposes such as compensation or incentives.', []],
    [MODULES.service, 'Contains Treasury', 420, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Does it contain externally withdrawable Treasury for purposes such as compensation or incentives?', ['treasury address']],
    [MODULES.service, 'Number of Arbitrations', 421, [], ValueType.TYPE_U64, 'The number of arbitrations that allows a refund to be made from the order at any time based on the arbitration result.', []],
    [MODULES.service, 'Contains Arbitration', 422, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Does it contain an arbitration that allows a refund to be made from the order at any time based on the arbitration result.?', ['arbitration address']],
    [MODULES.order, 'Amount', 500, [], ValueType.TYPE_U64, 'Order amount.', []],
    [MODULES.order, 'Payer', 501, [], ValueType.TYPE_ADDRESS, 'Order payer.', []],
    [MODULES.order, 'Service', 502, [], ValueType.TYPE_ADDRESS, 'Service for creating orders.', []],
    [MODULES.order, 'Has Progress', 503, [], ValueType.TYPE_BOOL, 'Is there a Progress for executing the order process?', []],
    [MODULES.order, 'Progress', 504, [], ValueType.TYPE_ADDRESS, 'Progress address for executing the order process.', []],
    [MODULES.order, 'Required Info', 505, [], ValueType.TYPE_BOOL, 'Is Required Info set?', []],
    [MODULES.order, 'Discount Used', 506, [], ValueType.TYPE_BOOL, 'Discount coupon used for this order?', []],
    [MODULES.order, 'Discount', 507, [], ValueType.TYPE_ADDRESS, 'Discount address that already used.', []],
    [MODULES.order, 'Balance', 508, [], ValueType.TYPE_U64, 'The amount currently in the order.', []],
    //        [MODULES.order, 'Refunded', 509, [], ValueType.TYPE_BOOL, 'Whether a refund has occurred?', []],
    //        [MODULES.order, 'Withdrawed', 510, [], ValueType.TYPE_BOOL, 'Whether a service provider withdrawal has occurred?', []],   
    [MODULES.order, 'Number of Agents', 511, [], ValueType.TYPE_U64, 'The number of agents for the order.', []],
    [MODULES.order, 'Has Agent', 512, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is an order agent?', ['agent address']],
    [MODULES.order, 'Number of Disputes', 513, [], ValueType.TYPE_U64, 'Number of arbitrations for the order.', []],
    [MODULES.order, 'Has Arb', 514, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Does the order contain an Arb for arbitration?', ['arb address']],
    /* @Deprecated
        [MODULES.reward, 'Permission', 600, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [MODULES.reward, 'Rewards Remaining', 601, [], ValueType.TYPE_U64, 'Number of rewards to be claimed.', []],
        [MODULES.reward, 'Reward Count Supplied', 602, [], ValueType.TYPE_U64, 'Total rewards supplied.', []],
        [MODULES.reward, 'Guard Count', 603, [], ValueType.TYPE_U64, 'The number of claiming guards.', []],
        [MODULES.reward, 'Has Guard', 604, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a claiming guard is set up?', ['address']],
        [MODULES.reward, 'Guard Portion', 605, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards, that can be claimed if a certain guard condition is met.', ['address']],
        [MODULES.reward, 'Deadline', 606, [], ValueType.TYPE_U64, 'The expiration time of claiming.', []],
        [MODULES.reward, 'Has Claimed by An Address', 607, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain address has claimed rewards?', ['address']],
        [MODULES.reward, 'Portions Claimed by An Address', 608, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards that have been claimed by a certain address.', []],
        [MODULES.reward, 'Number of Addresses Claimed', 609, [], ValueType.TYPE_U64, 'Number of addresses that have claimed rewards.', []],
        [MODULES.reward, 'Is Sponsor', 620, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a sponsor of the reward pool?', ['address']],
        [MODULES.reward, 'Portions by A Sponsor', 611, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of sponsorship reward pools for a certain address.', ['address']],
        [MODULES.reward, 'Number of Sponsors', 612, [], ValueType.TYPE_U64, 'Number of sponsors in the sponsorship reward pool.', []],
        [MODULES.reward, 'Allow Repeated Claims', 613, [], ValueType.TYPE_BOOL, 'Whether to allow repeated claims?', []],
    */
    [MODULES.machine, 'Permission', 700, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
    [MODULES.machine, 'Paused', 701, [], ValueType.TYPE_BOOL, 'Pause the creation of new Progress?', []],
    [MODULES.machine, 'Published', 702, [], ValueType.TYPE_BOOL, 'Is it allowed to create Progress?', []],
    [MODULES.machine, 'Is Consensus Repository', 703, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a consensus repository?', ['adddress']],
    [MODULES.machine, 'Has Endpoint', 704, [], ValueType.TYPE_BOOL, 'Is the endpoint set?', []],
    [MODULES.machine, 'Endpoint', 705, [], ValueType.TYPE_STRING, 'Endpoint url/ipfs.', []],
    [MODULES.progress, 'Machine', 800, [], ValueType.TYPE_ADDRESS, 'The Machine object that created this Progress.', []],
    [MODULES.progress, 'Current Node', 801, [], ValueType.TYPE_STRING, 'The name of the currently running node.', []],
    [MODULES.progress, 'Has Parent', 802, [], ValueType.TYPE_BOOL, 'Is the parent Progress defined?', []],
    [MODULES.progress, 'Parent', 803, [], ValueType.TYPE_ADDRESS, 'The parent Progress, that contains some child Progress.', []],
    [MODULES.progress, 'Has Task', 804, [], ValueType.TYPE_BOOL, 'Does it contain clear task(eg. an Order)?', []],
    [MODULES.progress, 'Task', 805, [], ValueType.TYPE_ADDRESS, 'Task object address.', []],
    [MODULES.progress, 'Has Unique Permission', 806, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does Progress define a unique operation permission?', ['operator name']],
    [MODULES.progress, 'Is Unique Permission Operator', 807, [ValueType.TYPE_STRING, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is an address an operator with unique permissions?', ['operator name', 'address']],
    [MODULES.progress, 'Has Context Repository', 808, [], ValueType.TYPE_BOOL, 'Whether the repository reference for Progress is set?', []],
    [MODULES.progress, 'Context Repository', 809, [], ValueType.TYPE_ADDRESS, 'Repository reference for Progress.', []],
    [MODULES.progress, 'Last Session Time', 810, [], ValueType.TYPE_U64, 'Time when the previous session was completed.', []],
    [MODULES.progress, 'Last Session Node', 811, [], ValueType.TYPE_STRING, 'The name of the last completed node.', []],
    [MODULES.progress, 'Current Session-id', 812, [], ValueType.TYPE_U64, 'The session id of ongoing node.', []],
    [MODULES.progress, 'Parent Session-id', 813, [], ValueType.TYPE_U64, 'The child process was started in the Session-id phase of the parent process.', []],
    [MODULES.progress, 'Parent Next Node', 814, [], ValueType.TYPE_STRING, 'The child process is started at the next node stage of the parent process.', []],
    [MODULES.progress, 'Parent Forward', 815, [], ValueType.TYPE_STRING, 'The child process is started in the Forward phase of the next node of the parent process.', []],
    [MODULES.progress, 'Parent Node', 816, [], ValueType.TYPE_STRING, 'The node name of the parent process where the child process is located.', []],
    [MODULES.progress, 'Forward Accomplished', 817, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Has the forward been accomplished?', ['session-id', 'next node name', 'forward name']],
    [MODULES.progress, 'Forward Operator', 818, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The forward operator.', ['session-id', 'next node name', 'forward name']],
    [MODULES.progress, 'Forward Message', 819, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_STRING, 'The forward message.', ['session-id', 'next node name', 'forward name']],
    [MODULES.progress, 'Forward Order Count', 820, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The forward Order count.', ['session-id', 'next node name', 'forward name']],
    [MODULES.progress, 'Forward time', 821, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The time when the forward was last triggered.', ['session-id', 'next node name', 'forward name']],
    [MODULES.progress, 'Closest Session Time', 822, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The time a node that closest time to the current node completes its session.', ['node name']],
    [MODULES.progress, 'Closest Forward Accomplished', 823, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Has the forward been accomplished?', ['node name', 'next node name', 'forward name']],
    [MODULES.progress, 'Closest Forward Operator', 824, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The operator of the forward that closest time to the current node.', ['node name', 'next node name', 'forward name']],
    [MODULES.progress, 'Closest Forward Message', 825, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_STRING, 'The message of the forward that closest time to the current node.', ['node name', 'next node name', 'forward name']],
    [MODULES.progress, 'Closest Forward Order Count', 826, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The Order count of the forward that closest time to the current node.', ['node name', 'next node name', 'forward name']],
    [MODULES.progress, 'Closest Forward time', 827, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The time when the forward that closest time to the current node was last triggered.', ['node name', 'next node name', 'forward name']],
    [MODULES.wowok, 'Builder', 900, [], ValueType.TYPE_ADDRESS, 'Builder address of Wowok.', []],
    [MODULES.wowok, 'Object of Entities', 901, [], ValueType.TYPE_ADDRESS, 'The address of entity information object.', []],
    [MODULES.wowok, 'Grantor Count', 902, [], ValueType.TYPE_U64, 'Number of registered grantors.', []],
    [MODULES.wowok, 'Has Grantor', 903, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address has been registered as a grantor?', ['address']],
    [MODULES.wowok, 'Grantor Name', 904, [ValueType.TYPE_ADDRESS], ValueType.TYPE_STRING, "Name of a grantor.", ['address']],
    [MODULES.wowok, 'Grantor Registration Time', 905, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Registration time of a grantor.', ['address']],
    [MODULES.wowok, 'Grantor Expired Time', 906, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The expiration time of a grantor.', ['address']],
    [MODULES.wowok, 'Grantee Object for Grantor', 907, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'Grantee repository address of a grantor.', ['address']],
    /* @Deprecated
        [MODULES.vote, 'Permission', 1101, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [MODULES.vote, 'Be Voting', 1102, [], ValueType.TYPE_BOOL, 'Whether to start voting and options will not be changed?', []],
        [MODULES.vote, 'Deadline Locked', 1103, [], ValueType.TYPE_BOOL, 'Whether the deadline cannot be modified?', []],
        [MODULES.vote, 'Vote-Guard Locked', 1104, [], ValueType.TYPE_BOOL, 'Whether the Guard for voting cannot be modified?', []],
        [MODULES.vote, 'Max Choice Count', 1105, [], ValueType.TYPE_U8, 'The maximum number of options that can be selected in one vote.', []],
        [MODULES.vote, 'Deadline', 1106, [], ValueType.TYPE_U64, 'Deadline for voting.', []],
        [MODULES.vote, 'Has Reference', 1107, [], ValueType.TYPE_BOOL, 'Whether to vote for a reference Object?', []],
        [MODULES.vote, 'Reference', 1108, [], ValueType.TYPE_ADDRESS, 'Reference Object that voting for.', []],
        [MODULES.vote, 'Has Vote-Guard', 1109, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain Guard included in the Vote-Guard settings?', ['guard address']],
        [MODULES.vote, 'Vote-Guard Wight', 1110, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The voting weight corresponding to the Vote-Guard.', ['guard address']],
        [MODULES.vote, 'Has Voted by Address', 1111, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address has already voted?', ['address']],
        [MODULES.vote, 'Voted Weight by Address', 1112, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The weight of whether an address has been voted on.', ['adddress']],
        [MODULES.vote, 'Has Option', 1113, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Whether a voting option is included?', ['option content']],
        [MODULES.vote, 'Has Object of Option', 1114, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Whether a voting option refers to an object?', ['option content']],
        [MODULES.vote, 'Option Object', 1115, [ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The object referenced by a voting option.', ['option content']],
        [MODULES.vote, 'Option Counts', 1116, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The number of votes for the voting option.', ['option content']],
        [MODULES.vote, 'Option Votes', 1117, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The number of voted addresses for the voting option.', ['option content']],
        [MODULES.vote, 'Address Count Voted', 1118, [], ValueType.TYPE_U64, 'Total number of addresses voted.', []],
        [MODULES.vote, 'Top1 Option by Addresses', 1119, [], ValueType.TYPE_STRING, 'The content of the voting option ranked first by the number of voting addresses.', []],
        [MODULES.vote, 'Top1 Counts by Addresses', 1120, [], ValueType.TYPE_U64, 'Number of votes for the top voting option by number of voting addresses.', []],
        [MODULES.vote, 'Top1 Option by Votes', 1121, [], ValueType.TYPE_STRING, 'The content of the voting option ranked first by the number of votes.', []],
        [MODULES.vote, 'Top1 Counts by Votes', 1122, [], ValueType.TYPE_U64, 'Number of votes for the top voting option by number of votes.', []],
        [MODULES.vote, 'Voted Time by Address', 1113, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The time of whether an address has been voted on.', ['adddress']],
    */
    [MODULES.payment, 'Sender', 1200, [], ValueType.TYPE_ADDRESS, 'Payment originator address.', []],
    [MODULES.payment, 'Total Amount', 1201, [], ValueType.TYPE_U128, "Payment amount.", []],
    [MODULES.payment, 'Remark', 1202, [], ValueType.TYPE_STRING, 'Payment remark.', ['address']],
    [MODULES.payment, 'Has Guard for Perpose', 1203, [], ValueType.TYPE_BOOL, 'Whether the payment references a Guard?', []],
    [MODULES.payment, 'Has Object for Perpose', 1204, [], ValueType.TYPE_BOOL, 'Whether the payment references an Object?', []],
    [MODULES.payment, 'Guard for Perpose', 1205, [], ValueType.TYPE_ADDRESS, 'The Guard referenced by this payment.', []],
    [MODULES.payment, 'Object for Perpose', 1206, [], ValueType.TYPE_ADDRESS, "The Object referenced by this payment.", []],
    [MODULES.payment, 'Number of Recipients', 1207, [], ValueType.TYPE_U64, 'Number of recipients to receive payment from.', []],
    [MODULES.payment, 'Is a Recipient', 1208, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a recipient received the payment?', ['address']],
    [MODULES.payment, 'Amount for a Recipient', 1209, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The amount of payment received by an address.', ['address']],
    [MODULES.payment, 'Time', 1210, [], ValueType.TYPE_U64, 'Payment time', []],
    [MODULES.payment, 'Is from Treasury', 1211, [], ValueType.TYPE_BOOL, 'Whether the payment comes from a Treasury?', []],
    [MODULES.payment, 'Treasury Address', 1212, [], ValueType.TYPE_ADDRESS, 'The Treasury from which the payment comes.', []],
    [MODULES.payment, 'Biz-ID', 1213, [], ValueType.TYPE_U64, 'Bisiness ID number of the payment.', []],
    [MODULES.treasury, 'Permission', 1400, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
    [MODULES.treasury, 'Balance', 1401, [], ValueType.TYPE_U64, "Treasury balance.", []],
    [MODULES.treasury, 'Number of Flow Records', 1402, [], ValueType.TYPE_U64, 'Number of treasury transactions.', []],
    [MODULES.treasury, 'Inflow Amount', 1403, [], ValueType.TYPE_U128, 'Treasury inflow amount.', []],
    [MODULES.treasury, 'Outflow Amount', 1404, [], ValueType.TYPE_U128, 'Treasury outflow amount.', []],
    [MODULES.treasury, 'Has Deposit Guard', 1405, [], ValueType.TYPE_BOOL, 'Whether the deposit Guard set?', []],
    [MODULES.treasury, 'Deposit Guard', 1406, [], ValueType.TYPE_ADDRESS, 'Deposit Guard address.', []],
    [MODULES.treasury, 'Number of Withdraw Guards', 1407, [], ValueType.TYPE_U64, 'Number of withdraw guards.', []],
    [MODULES.treasury, 'Has Withdraw Guard', 1408, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Has a Withdraw Guard added?', ['guard address']],
    [MODULES.treasury, 'Withdrawal Amount with Guard', 1409, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'withdrawal amount corresponding the Guard.', ['guard address']],
    [MODULES.treasury, 'Recent Time with Operation', 1410, [ValueType.TYPE_U8], ValueType.TYPE_U64, 'Time of the most recent fund operation.', ['operation']],
    [MODULES.treasury, 'Recent Signer with Operation', 1411, [ValueType.TYPE_U8], ValueType.TYPE_ADDRESS, 'Signer address of the most recent fund operation.', ['operation']],
    [MODULES.treasury, 'Recent Payment with Operation', 1412, [ValueType.TYPE_U8], ValueType.TYPE_ADDRESS, 'Payment address of the most recent fund operation.', ['operation']],
    [MODULES.treasury, 'Recent Amount with Operation', 1413, [ValueType.TYPE_U8], ValueType.TYPE_U64, 'Amount of the most recent fund operation.', ['operation']],
    [MODULES.treasury, 'Recent Time with Op/Pmt', 1414, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Time of the most recent fund operation with payment specified.', ['operation', 'payment address']],
    [MODULES.treasury, 'Recent Signer with Op&Pmt', 1415, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'Signer of the most recent fund operationwith payment specified.', ['operation', 'payment address']],
    [MODULES.treasury, 'Recent Amount with Op/Pmt', 1416, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Amount of the most recent fund operation with payment specified.', ['operation', 'payment address']],
    [MODULES.treasury, 'Recent Time with Op/Sgr', 1417, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Time of the most recent fund operation with signer specified.', ['operation', 'signer address']],
    [MODULES.treasury, 'Recent Payment with Op/Sgr', 1418, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'Payment of the most recent fund operation with singner specified.', ['operation', 'signer address']],
    [MODULES.treasury, 'Recent Amount with Op/Sgr', 1419, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Amount of the most recent fund operation with singer specified.', ['operation', 'signer address']],
    [MODULES.treasury, 'Recent Time with Op/Pmt/Sgr', 1420, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Time of the most recent fund operation.', ['operation', 'payment address', 'singer address']],
    [MODULES.treasury, 'Recent Amount with Op/Pmt/Sgr', 1421, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Amount of the most recent fund operation.', ['operation', 'payment address', 'singer address']],
    [MODULES.treasury, 'Has Operation', 1422, [ValueType.TYPE_U8], ValueType.TYPE_BOOL, 'Whether there was a fund operation?', ['operation']],
    [MODULES.treasury, 'Has Operation with Pmt', 1423, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether there was a fund operation with payment specified?', ['operation', 'payment address']],
    [MODULES.treasury, 'Has Operation with Sgr', 1424, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether there was a fund operation with singer specified?', ['operation', 'singer address']],
    [MODULES.treasury, 'Has Operation with Pmt/Sgr', 1425, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether there was a fund operation?', ['operation', 'payment address', 'singer address']],
    [MODULES.treasury, 'Operation at Least Times', 1426, [ValueType.TYPE_U8, ValueType.TYPE_U8], ValueType.TYPE_BOOL, 'Does it operate at least a certain number of times?', ['operation', 'at least times']],
    [MODULES.treasury, 'Operation at Least Times by a Signer', 1427, [ValueType.TYPE_U8, ValueType.TYPE_ADDRESS, ValueType.TYPE_U8], ValueType.TYPE_BOOL, 'Does it operate at least a certain number of times by a signer?', ['operation', 'signer address', 'at least times']],
    [MODULES.arbitration, 'Permission', 1500, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
    [MODULES.arbitration, 'Paused', 1501, [], ValueType.TYPE_BOOL, "Is it allowed to create Arb?", []],
    [MODULES.arbitration, 'Fee', 1502, [], ValueType.TYPE_U64, 'Cost of arbitration.', []],
    [MODULES.arbitration, 'Has Endpoint', 1503, [], ValueType.TYPE_BOOL, 'Is the endpoint set?', []],
    [MODULES.arbitration, 'Endpoint', 1504, [], ValueType.TYPE_STRING, 'Endpoint url/ipfs.', []],
    [MODULES.arbitration, 'Has Customer Guard', 1505, [], ValueType.TYPE_BOOL, 'Is there Guard set to apply for arbitration?', []],
    [MODULES.arbitration, 'Customer Guard', 1506, [], ValueType.TYPE_ADDRESS, 'Guard to apply for arbitration.', []],
    [MODULES.arbitration, 'Number of Voting Guard', 1507, [], ValueType.TYPE_U64, 'Number of voting guards.', []],
    [MODULES.arbitration, 'Has Voting Guard', 1508, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Has the voting Guard added?', ['guard address']],
    [MODULES.arbitration, 'Voting Weight', 1509, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Voting weight of the voting Guard.', ['guard address']],
    [MODULES.arbitration, 'Treasury', 1510, [], ValueType.TYPE_ADDRESS, 'The address of the Treasury where fees was collected at the time of withdrawal.', []],
    [MODULES.arb, 'Order', 1600, [], ValueType.TYPE_ADDRESS, 'Order under arbitration.', []],
    [MODULES.arb, 'Arbitration', 1601, [], ValueType.TYPE_ADDRESS, "Arbitration object address.", []],
    [MODULES.arb, 'Feedback', 1602, [], ValueType.TYPE_STRING, 'Arbitration feedback.', []],
    [MODULES.arb, 'Has Compensation', 1603, [], ValueType.TYPE_BOOL, 'Whether there is an arbitration result?', []],
    [MODULES.arb, 'Compensation', 1604, [], ValueType.TYPE_U64, 'Compensation should be given to the order payer.', []],
    [MODULES.arb, 'Unclaimed Arbitration Costs', 1605, [], ValueType.TYPE_U64, 'Unclaimed arbitration costs.', []],
    [MODULES.arb, 'Turnout', 1606, [], ValueType.TYPE_U64, 'The number of addresses have voted.', []],
    [MODULES.arb, 'Has voted', 1607, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Has someone voted?', ['voter address']],
    [MODULES.arb, 'Voting weight', 1608, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The weight of a complete vote for the address.', ['voter address']],
    [MODULES.arb, 'Voting Time', 1609, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The time of a complete vote for the address.', ['voter address']],
    [MODULES.arb, 'Voting Option', 1610, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U8], ValueType.TYPE_BOOL, 'Does an address complete voting for the option?', ['voter address', 'option index']],
    [MODULES.arb, 'Number of Options', 1611, [], ValueType.TYPE_U64, 'Number of voting options.', []],
    [MODULES.arb, 'Number of Votes', 1612, [ValueType.TYPE_U8], ValueType.TYPE_U64, 'The number of votes received for an option.', ['option index']],
];
export class Guard {
    static MAX_INPUT_LENGTH = 10240;
    //    static MAX_PAYLOADS_LENGTH = 4096;
    txb;
    object;
    get_object() { return this.object; }
    static From(txb, object) {
        let d = new Guard(txb);
        d.object = Protocol.TXB_OBJECT(txb, object);
        return d;
    }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static New(txb, description, maker) {
        if (!maker.IsReady()) {
            ERROR(Errors.InvalidParam, 'launch maker');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let bcs_input = maker.get_input()[0];
        let constants = maker.get_constant();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            ERROR(Errors.InvalidParam, 'launch input');
        }
        let bValid = true;
        constants?.forEach((v, k) => {
            if (!GuardMaker.IsValidIndentifier(k))
                bValid = false;
            if (v.value && v.bWitness)
                bValid = false;
            if (v.value === undefined && !v.bWitness)
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'launch constants');
        }
        let input = new Uint8Array(bcs_input); // copy new uint8array to reserve!
        // reserve the  bytes for guard
        let g = new Guard(txb);
        g.object = txb.moveCall({
            target: Protocol.Instance().guardFn('new'),
            arguments: [txb.pure.string(description), txb.pure.vector('u8', [].slice.call(input.reverse()))],
        });
        constants?.forEach((v, k) => {
            if (v.bWitness) {
                const n = new Uint8Array(1);
                n.set([v.type], 0);
                txb.moveCall({
                    target: Protocol.Instance().guardFn("constant_add"),
                    arguments: [txb.object(g.object), txb.pure.u8(k), txb.pure.bool(true), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                });
            }
            else {
                const n = insertAtHead(v.value, v.type);
                txb.moveCall({
                    target: Protocol.Instance().guardFn("constant_add"),
                    arguments: [txb.object(g.object), txb.pure.u8(k), txb.pure.bool(false), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                });
            }
        });
        return g;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().guardFn("create"),
            arguments: [this.txb.object(this.object)]
        });
    }
    static everyone_guard(txb) {
        return txb.moveCall({
            target: Protocol.Instance().guardFn('everyone_guard'),
            arguments: []
        });
    }
    static QueryAddressIdentifiers(guard, onQueryAnswer, sender) {
        const txb = new TransactionBlock();
        txb.moveCall({
            target: Protocol.Instance().guardFn('query_address_identifiers'),
            arguments: [txb.object(guard)]
        });
        Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: txb }).then((res) => {
            if (res.results && res.results[0]?.returnValues && res.results[0]?.returnValues?.length !== 1) {
                onQueryAnswer({ err: 'not match', txb: txb, identifiers: [] });
                return;
            }
            const identifiers = Bcs.getInstance().de('vector<u8>', Uint8Array.from(res.results[0].returnValues[0][0]));
            onQueryAnswer({ identifiers: identifiers, txb: txb });
        }).catch((e) => {
            console.log(e);
            onQueryAnswer({ err: e, txb: txb, identifiers: [] });
        });
    }
    static BoolCmd = GUARD_QUERIES.filter(q => q[4] === ValueType.TYPE_BOOL);
    static IsBoolCmd = (cmd) => { return Guard.BoolCmd.includes((q) => { return q[2] == cmd; }); };
    static CmdFilter = (retType) => { return GUARD_QUERIES.filter((q) => q[4] === retType); };
    static GetCmd = (cmd) => {
        return GUARD_QUERIES.find((q) => { return q[2] == cmd; });
    };
    static GetCmdOption = (cmd) => {
        const r = Guard.GetCmd(cmd);
        if (!r)
            return r;
        return { from: 'query', name: r[1], value: r[2], group: FirstLetterUppercase(r[0]) };
    };
    static GetInputParams = (cmd) => {
        const r = Guard.GetCmd(cmd);
        if (!r)
            return [];
        return r[3];
    };
    static GetModuleName = (cmd) => {
        let r = Guard.GetCmd(cmd);
        if (!r)
            return '';
        return FirstLetterUppercase(r[0]);
    };
    static NumberOptions = () => {
        const r = [...Guard.CmdFilter(ValueType.TYPE_U8), ...Guard.CmdFilter(ValueType.TYPE_U64),
            ...Guard.CmdFilter(ValueType.TYPE_U128), ...Guard.CmdFilter(ValueType.TYPE_U256)].map((v) => {
            return { from: 'query', name: v[1], value: v[2], group: FirstLetterUppercase(v[0]) };
        });
        return r.concat(Guard.Crunchings);
    };
    static Signer = { from: 'type', name: 'Txn Signer', value: ContextType.TYPE_SIGNER, group: 'Txn Functions' };
    static Time = { from: 'type', name: 'Txn Time', value: ContextType.TYPE_CLOCK, group: 'Txn Functions' };
    static Guard = { from: 'type', name: 'Guard Address', value: ContextType.TYPE_GUARD, group: 'Txn Functions' };
    static Logics = () => LogicsInfo.map((v) => { return { from: 'type', name: v[1], value: v[0], group: 'Compare or Logic' }; });
    static Crunchings = [
        { from: 'type', name: 'Txn Time', value: ContextType.TYPE_CLOCK, group: 'Txn Functions' },
        { from: 'type', name: 'PositiveNumber Add (+)', value: OperatorType.TYPE_NUMBER_ADD, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Subtract (-)', value: OperatorType.TYPE_NUMBER_SUBTRACT, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Multiply (*)', value: OperatorType.TYPE_NUMBER_MULTIPLY, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Devide (/)', value: OperatorType.TYPE_NUMBER_DEVIDE, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Mod (%)', value: OperatorType.TYPE_NUMBER_MOD, group: 'Number Crunching' },
    ];
    static CommonOptions = (retType) => {
        return Guard.CmdFilter(retType).map((v) => { return { from: 'query', name: v[1], value: v[2], group: FirstLetterUppercase(v[0]) }; });
    };
    static AllOptions = () => {
        var r = GUARD_QUERIES.map((v) => { return { from: 'query', name: v[1], value: v[2], group: FirstLetterUppercase(v[0]) }; });
        return [...r, ...Guard.Crunchings, ...Guard.Logics(), Guard.Signer, Guard.Time, Guard.Guard];
    };
    static StringOptions = () => {
        return [...Guard.CmdFilter(ValueType.TYPE_STRING)].map((v) => {
            return { from: 'query', name: v[1], value: v[2], group: FirstLetterUppercase(v[0]) };
        });
    };
    static BoolOptions = () => {
        const n1 = Guard.BoolCmd.map((v) => { return { from: 'query', name: v[1], value: v[2], group: FirstLetterUppercase(v[0]) }; });
        return [...n1, ...Guard.Logics()];
    };
    static AddressOptions = () => {
        const n1 = GUARD_QUERIES.filter(q => q[4] === ValueType.TYPE_ADDRESS).map((v) => { return { from: 'query', name: v[1], value: v[2], group: FirstLetterUppercase(v[0]) }; });
        n1.push(Guard.Signer);
        n1.push(Guard.Guard);
        return [...n1];
    };
    static Options = (ret_type) => {
        if (ret_type === 'number') {
            return Guard.NumberOptions();
        }
        else if (ret_type === 'any') {
            return Guard.AllOptions();
        }
        switch (ret_type) {
            case ValueType.TYPE_BOOL:
                return Guard.BoolOptions();
            case ValueType.TYPE_STRING:
                return Guard.StringOptions();
        }
        return Guard.CommonOptions(ret_type);
    };
}
export const IsValidGuardIdentifier = (identifier) => {
    return IsValidU8(identifier) && identifier !== 0;
};
export class GuardMaker {
    data = [];
    type_validator = [];
    constant = new Map();
    static _witness_index = 1;
    static _const_index = 255;
    static GetWitnessIndex() {
        if (this._witness_index >= this._const_index) {
            ERROR(Errors.Fail, 'too many witness');
        }
        return GuardMaker._witness_index++;
    }
    static getConstIndex() {
        if (this._const_index <= this._witness_index) {
            ERROR(Errors.Fail, 'too many const');
        }
        return GuardMaker._const_index--;
    }
    static IsValidIndentifier = (identifier) => {
        if (!IsValidU8(identifier) || identifier < 1)
            return false;
        return true;
    };
    constructor() { }
    // undefined value means witness
    add_constant(type, value, identifier, bNeedSerialize = true) {
        if (identifier === undefined) {
            if (value === undefined)
                identifier = GuardMaker.GetWitnessIndex();
            else
                identifier = GuardMaker.getConstIndex();
        }
        let v = this.constant.get(identifier);
        if (!v) {
            if (bNeedSerialize && value !== undefined) {
                value = Bcs.getInstance().ser(type, value);
            }
            this.constant.set(identifier, { type: type, value: value === undefined ? undefined : value, bWitness: value === undefined ? true : false });
        }
        return identifier;
    }
    // serialize const & data, WITNESS use constants only.
    add_param(type, param) {
        switch (type) {
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
                this.data.push(Bcs.getInstance().ser(type, param));
                this.type_validator.push(type);
                break;
            case ValueType.TYPE_STRING:
            case ValueType.TYPE_VEC_U8:
                if (!param)
                    ERROR(Errors.InvalidParam, 'param: ' + type);
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
                if (typeof (param) == 'string') {
                    this.data.push(Bcs.getInstance().ser(ValueType.TYPE_STRING, param));
                }
                else {
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
                    ERROR(Errors.IsValidGuardIdentifier, 'add_param param:' + type);
                }
                var v = this.constant.get(param);
                if (!v)
                    ERROR(Errors.Fail, 'identifier not in constant:' + param);
                this.type_validator.push(v.type); //@ type validator convert
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // constant flag
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, param)); // identifier
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_param type:' + type);
        }
        ;
        return this;
    }
    // object_address_from: string for static address; number as identifier  inconstant
    add_query(module, query_name, object_address_from) {
        let query_index = GUARD_QUERIES.findIndex((q) => {
            return q[0] == module && q[1] == query_name;
        });
        if (query_index == -1) {
            ERROR(Errors.InvalidParam, 'query_name:' + query_name);
        }
        if (typeof (object_address_from) == 'number') {
            if (!GuardMaker.IsValidIndentifier(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from:' + query_name);
            }
        }
        else {
            if (!IsValidAddress(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from:' + query_name);
            }
        }
        let offset = this.type_validator.length - GUARD_QUERIES[query_index][3].length;
        if (offset < 0) {
            ERROR(Errors.InvalidParam, 'offset:' + query_name);
        }
        let types = this.type_validator.slice(offset);
        if (!array_equal(types, GUARD_QUERIES[query_index][3])) { // type validate 
            ERROR(Errors.Fail, 'array_equal:' + query_name);
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof (object_address_from) == 'string') {
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ValueType.TYPE_ADDRESS));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        }
        else {
            let v = this.constant.get(object_address_from);
            if (!v)
                ERROR(Errors.Fail, 'object_address_from not in constant:' + query_name);
            if (v?.type == ValueType.TYPE_ADDRESS) {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_CONSTANT));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            }
            else {
                ERROR(Errors.Fail, 'type bWitness not match:' + query_name);
            }
        }
        this.data.push(Bcs.getInstance().ser('u16', GUARD_QUERIES[query_index][2])); // cmd(u16)
        this.type_validator.splice(offset, GUARD_QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(GUARD_QUERIES[query_index][4]); // add the return value type to type stack
        return this;
    }
    add_logic(type, logic_count = 2) {
        var e = LogicsInfo.find((v) => v[0] === type);
        if (e) {
            e = e[1];
        }
        let splice_len = 2;
        let cur;
        let ret = ValueType.TYPE_BOOL;
        switch (type) {
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (!logic_count || logic_count < 2)
                    ERROR(Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length:' + e);
                }
                for (let i = 1; i <= splice_len; ++i) {
                    if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - i])) {
                        ERROR(Errors.Fail, 'type_validator check:' + e);
                    }
                }
                break;
            case OperatorType.TYPE_LOGIC_EQUAL:
                if (!logic_count || logic_count < 2)
                    ERROR(Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length:' + e);
                }
                cur = this.type_validator[this.type_validator.length - 1];
                for (let i = 2; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] !== cur)
                        ERROR(Errors.Fail, 'type_validator check:' + e);
                }
                break;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (!logic_count || logic_count < 2)
                    ERROR(Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length:' + e);
                }
                for (let i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] !== ValueType.TYPE_STRING)
                        ERROR(Errors.Fail, 'type_validator check:' + e);
                }
                break;
            case OperatorType.TYPE_LOGIC_NOT:
                splice_len = 1;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length:' + e);
                }
                if (this.type_validator[this.type_validator.length - 1] != ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'type_validator check:' + e);
                }
                break;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR: //@ logics count
                if (!logic_count || logic_count < 2)
                    ERROR(Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length:' + e);
                }
                for (let i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] != ValueType.TYPE_BOOL) {
                        ERROR(Errors.Fail, 'type_validator check:' + e);
                    }
                }
                break;
            case OperatorType.TYPE_NUMBER_ADD:
            case OperatorType.TYPE_NUMBER_DEVIDE:
            case OperatorType.TYPE_NUMBER_MULTIPLY:
            case OperatorType.TYPE_NUMBER_SUBTRACT:
            case OperatorType.TYPE_NUMBER_MOD:
                if (!logic_count || logic_count < 2)
                    ERROR(Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    ERROR(Errors.Fail, 'type_validator.length:' + e);
                }
                for (let i = 1; i <= splice_len; ++i) {
                    if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1])) {
                        ERROR(Errors.Fail, 'type_validator check:' + e);
                    }
                }
                ret = ValueType.TYPE_U256;
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_logic type invalid:' + e);
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // TYPE 
        if (GuardMaker.is_multi_input_op(type)) {
            this.data.push((Bcs.getInstance().ser(ValueType.TYPE_U8, logic_count))); //@ logics
        }
        this.type_validator.splice(this.type_validator.length - splice_len); // delete type stack   
        this.type_validator.push(ret); // add bool to type stack
        return this;
    }
    hasIdentifier(id) {
        return this.constant.has(id);
    }
    build(bNot = false) {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_BOOL) {
            ERROR(Errors.Fail, 'type_validator check');
        } // ERROR
        if (bNot) {
            this.add_logic(OperatorType.TYPE_LOGIC_NOT);
        }
        this.data.push(concatenate(Uint8Array, ...this.data));
        this.data.splice(0, this.data.length - 1);
        return this;
    }
    IsReady() {
        return this.type_validator.length == 1 && this.type_validator[0] == ValueType.TYPE_BOOL && this.data.length == 1;
    }
    combine(otherBuilt, bAnd = true, bCombinConstant = false) {
        if (!otherBuilt.IsReady() || !this.IsReady()) {
            ERROR(Errors.Fail, 'both should built yet');
        }
        ;
        let maker = new GuardMaker();
        this.constant.forEach((v, k) => {
            maker.constant.set(k, { type: v.type, value: v.value, bWitness: v.bWitness });
        });
        otherBuilt.constant.forEach((v, k) => {
            if (maker.constant.has(k) && !bCombinConstant) {
                ERROR(Errors.Fail, 'constant identifier exist');
            }
            maker.constant.set(k, { type: v.type, value: v.value, bWitness: v.bWitness });
        });
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND : OperatorType.TYPE_LOGIC_OR;
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser(ValueType.TYPE_U8, op), Bcs.getInstance().ser(ValueType.TYPE_U8, 2)));
        this.data.splice(0, this.data.length - 1);
        maker.type_validator = this.type_validator;
        return maker;
    }
    get_constant() { return this.constant; }
    get_input() { return this.data; }
    // and/or + logics count
    static input_combine(input1, input2, bAnd = true) {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND : OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser(ValueType.TYPE_U8, op), Bcs.getInstance().ser(ValueType.TYPE_U8, 2));
    }
    static input_not(input) {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_LOGIC_NOT));
    }
    static match_u256(type) {
        return (type == ValueType.TYPE_U8 || type == ValueType.TYPE_U64 || type == ValueType.TYPE_U128 || type == ValueType.TYPE_U256);
    }
    static is_multi_input_op(type) {
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
            type === OperatorType.TYPE_NUMBER_MOD);
    }
}
