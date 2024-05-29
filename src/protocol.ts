import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, 
    SuiTransactionBlockResponse, SuiObjectChange } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { TransactionBlock, Inputs, TransactionResult, TransactionArgument } from '@mysten/sui.js/transactions';
import { capitalize, IsValidArray } from './utils'
import { GuardConstant } from './guard';


export enum MODULES {
    machine = 'machine',
    node = 'node',
    progress = 'progress',
    community = 'community',
    repository = 'repository',
    permission = 'permission',
    passport = 'passport',
    guard = 'guard',
    vote = 'vote',
    demand = 'demand',
    order = 'order',
    reward = 'reward',
    service = 'service',
    resource = 'resource',
    entity = 'entity',
    wowok = 'wowok',
}

export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult | string;
export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult | string;
export type GuardAddress = TransactionResult;
export type GuardObject = TransactionResult | string ;
export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult | string;
export type PassportObject = TransactionResult;
export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult | string;
export type ServiceObject = TransactionResult  | string;
export type ServiceAddress = TransactionResult;
export type ProgressObject = TransactionResult | string;
export type ProgressAddress = TransactionResult;
export type RewardObject = TransactionResult | string;
export type RewardAddress = TransactionResult;
export type OrderObject = TransactionResult | string;
export type OrderAddress = TransactionResult;
export type DiscountObject = TransactionResult | string;
export type CoinObject = TransactionResult | string;
export type VoteObject = TransactionResult | string;
export type VoteAddress = TransactionResult;
export type ResourceObject = TransactionResult | string;
export type ResourceAddress = TransactionResult;
export type EntityObject = TransactionResult | string;
export type EntityAddress = TransactionResult;

export type TxbObject = string | TransactionResult | GuardObject |  RepositoryObject | PermissionObject | MachineObject | PassportObject |
    DemandObject | ServiceObject | RewardObject | OrderObject | DiscountObject | VoteObject | DemandObject | ResourceObject | EntityObject;

export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;

export enum OperatorType {
    TYPE_QUERY = 1, // query wowok object

    TYPE_LOGIC_AS_U256_GREATER = 11,
    TYPE_LOGIC_AS_U256_GREATER_EQUAL = 12,
    TYPE_LOGIC_AS_U256_LESSER = 13,
    TYPE_LOGIC_AS_U256_LESSER_EQUAL = 14,
    TYPE_LOGIC_AS_U256_EQUAL = 15,
    TYPE_LOGIC_EQUAL = 16, // TYPE&DATA(vector<u8>) MUST BE EQUAL
    TYPE_LOGIC_HAS_SUBSTRING = 17, // SUBSTRING
    TYPE_LOGIC_ALWAYS_TRUE = 18, // aways true
    TYPE_LOGIC_NOT = 19, // NOT
    TYPE_LOGIC_AND = 20, // AND
    TYPE_LOGIC_OR = 21, // OR
}       

export enum ValueType {
    TYPE_BOOL = 100,
    TYPE_ADDRESS = 101,
    TYPE_U64 = 102,
    TYPE_U8 = 103,
    TYPE_VEC_U8 = 104,
    TYPE_U128 = 105,
    TYPE_VEC_ADDRESS = 106,
    TYPE_VEC_BOOL = 107,
    TYPE_VEC_VEC_U8 = 108,
    TYPE_VEC_U64 = 109,
    TYPE_VEC_U128 = 110,
    TYPE_OPTION_ADDRESS = 111,
    TYPE_OPTION_BOOL = 112,
    TYPE_OPTION_U8 = 113,
    TYPE_OPTION_U64 = 114,
    TYPE_OPTION_U128 = 115,
    TYPE_OPTION_U256 = 116,
    TYPE_VEC_U256 = 117,
    TYPE_U256 = 118,
}

export const OperatorTypeArray = (Object.values(OperatorType) as []).filter((v)=>typeof(v) === 'number') as number[];
export const ValueTypeArray = (Object.values(ValueType) as []).filter((v)=>typeof(v) === 'number') as number[];
export const IsValidOperatorType = (type:number) => { return OperatorTypeArray.includes(type)}
export const IsValidValueType = (type:number) => { return ValueTypeArray.includes(type)}

interface ValueTypeString {
    type: ValueType;
    name: string;
    description: string;
}

export const SER_VALUE: ValueTypeString[] = [
    {type: ValueType.TYPE_BOOL, name: 'bool', description:'boolean. eg:true or false'},
    {type: ValueType.TYPE_ADDRESS, name: 'address', description:'address or object-id. eg:0x6789af'},
    {type: ValueType.TYPE_U64, name: 'number', description:'unsigned-64 number. eg:23870233'},
    {type: ValueType.TYPE_U8, name: 'number', description:'unsigned-8 number. eg:255'},
    {type: ValueType.TYPE_VEC_U8, name: '[number]', description:'unsigned-8 number array. eg:"wowok"'},
    {type: ValueType.TYPE_U128, name: 'number', description:'unsigned-8 number. eg:12348900999'},
    {type: ValueType.TYPE_VEC_ADDRESS, name: '[address]', description:'address array. eg:[0x2277f2, 0x3344af]'},
    {type: ValueType.TYPE_VEC_BOOL, name: '[bool]', description:'boolean array. eg:[true, false, true]'},
    {type: ValueType.TYPE_VEC_VEC_U8, name: '[[number]]', description:'array of unsigned-8 number array. eg:["i", "like", "wowok"]'},
    {type: ValueType.TYPE_VEC_U64, name: '[number]', description:'unsigned-64 number array. eg:[123, 778888, 42312]'},
    {type: ValueType.TYPE_VEC_U128, name: '[number]', description:'unsigned-128 number array. eg:[123, 778888, 42312]'},
    {type: ValueType.TYPE_OPTION_ADDRESS, name: 'option', description:'option of address. eg:none or address'},
    {type: ValueType.TYPE_OPTION_BOOL, name: 'option', description:'option of bool. eg:none or boolean value'},
    {type: ValueType.TYPE_OPTION_U8, name: 'option', description:'option of u8. eg:none or u8 value'},
    {type: ValueType.TYPE_OPTION_U64, name: 'option', description:'option of u64. eg:none or u64 value'},
    {type: ValueType.TYPE_OPTION_U128, name: 'option', description:'option of u128. eg:none or u128 value'},
    {type: ValueType.TYPE_OPTION_U256, name: 'option', description:'option of u256. eg:none or u256 value'},
    {type: ValueType.TYPE_VEC_U256, name: '[number]', description:'unsigned-256 number array. eg:[123, 778888, 42312]'},
    {type: ValueType.TYPE_U256, name: 'number', description:'unsigned-256 number. eg:12345678901233'},
]

export enum ContextType {
    TYPE_SIGNER  = 60,
    TYPE_CLOCK = 61,
    TYPE_WITNESS_ID = 62, 
    TYPE_CONSTANT = 80,
}

export type ConstantType = ValueType | ContextType.TYPE_WITNESS_ID;
export type Data_Type = ValueType | OperatorType | ContextType;

export enum ENTRYPOINT {
    mainnet = 'mainnet',
    testnet = 'testnet',
    devnet = 'devnet',
    localnet = 'localnet'
}

export class Protocol {
    protected network = '';
    protected package = '';
    protected signer = '';
    protected wowok_object = '';
    protected entity_object = '';
    protected graphql = '';
    protected txb: TransactionBlock | undefined;
    static _instance: any;

    constructor(network:ENTRYPOINT=ENTRYPOINT.testnet) {
        this.UseNetwork(network);
        this.NewSession();
    }

    static Instance() {
        if (!Protocol._instance) {
            Protocol._instance = new Protocol();
        }; return Protocol._instance
    }

    UseNetwork(network:ENTRYPOINT=ENTRYPOINT.testnet) {
        this.network = network;
        switch(network) {
            case ENTRYPOINT.localnet:
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = "0x2ac00805aa0ec3c62b575e412108bb295389bbfc86202fd7b73c69dbbb80769a";
                this.wowok_object = '0x49d49fb41c63c3f6c838fca20c25741f20aa74a176391685446794bdaa9b7934';
                this.entity_object= '0xd21d8d76f553b2db6c6d28a8b2ae3405bec92f2a300676d80fcc004ca40b0a77';
                this.graphql = 'https://sui-testnet.mystenlabs.com/graphql';
                break;
            case ENTRYPOINT.mainnet:
                break;
        };
    }
    Package(): string { return this.package }
    WowokObject(): string { return this.wowok_object }
    EntityObject(): string { return this.entity_object }
    GraphqlUrl() : string { return this.graphql }
    
    NetworkUrl() : string { 
        switch(this.network) {
            case ENTRYPOINT.localnet:
                return "http://127.0.0.1:9000";
            case ENTRYPOINT.devnet:
                return "https://fullnode.devnet.sui.io:443";
            case ENTRYPOINT.testnet:
                return "https://fullnode.testnet.sui.io:443";
            case ENTRYPOINT.mainnet:
                return "https://fullnode.mainnet.sui.io:443";
        }; return "";
    };
    
    MachineFn = (fn:any) => { return `${this.package}::${MODULES.machine}::${fn}`};
    NodeFn = (fn: any) => { return `${this.package}::${MODULES.node}::${fn}`};
    ProgressFn = (fn:any) => { return `${this.package}::${MODULES.progress}::${fn}`};
    CommunityFn = (fn: any) => { return `${this.package}::${MODULES.community}::${fn}`};
    RepositoryFn = (fn:any) => { return `${this.package}::${MODULES.repository}::${fn}`};
    PermissionFn = (fn: any) => { return `${this.package}::${MODULES.permission}::${fn}`};
    PassportFn = (fn:any) => { return `${this.package}::${MODULES.passport}::${fn}`};
    GuardFn = (fn: any) => { return `${this.package}::${MODULES.guard}::${fn}`};
    VoteFn = (fn:any) => { return `${this.package}::${MODULES.vote}::${fn}`};
    DemandFn = (fn: any) => { return `${this.package}::${MODULES.demand}::${fn}`};
    OrderFn = (fn:any) => { return `${this.package}::${MODULES.order}::${fn}`};
    RewardFn = (fn: any) => { return `${this.package}::${MODULES.reward}::${fn}`};
    ServiceFn = (fn: any) => { return `${this.package}::${MODULES.service}::${fn}`};
    ResourceFn = (fn: any) => { return `${this.package}::${MODULES.resource}::${fn}`};
    EntityFn = (fn: any) => { return `${this.package}::${MODULES.entity}::${fn}`};
    WowokFn = (fn: any) => { return `${this.package}::${MODULES.wowok}::${fn}`};
    
    Query = async (objects: Query_Param[], options:SuiObjectDataOptions={showContent:true}) : Promise<SuiObjectResponse[]> => {
        const client =  new SuiClient({ url: this.NetworkUrl() });  
        const ids = objects.map((value) => value.objectid);
        const res = await client.call('sui_multiGetObjects', [ids, options]) as SuiObjectResponse[];
        let ret:any[] = [];
        for (let i = 0; i < res.length; i ++ ) {
            objects.forEach((object) => {
                object.callback(this, res[i], object, options);
            })
        }   
        return res;
    } 
    Query_Raw = async (objects: string[], options:SuiObjectDataOptions={showContent:true}) : Promise<SuiObjectResponse[]> => {
        const client =  new SuiClient({ url: this.NetworkUrl() });  
        return await client.call('sui_multiGetObjects', [objects, options]) as SuiObjectResponse[];
    }

    NewSession = () : TransactionBlock => {
        this.txb = new  TransactionBlock();
        return this.txb
    }
    CurrentSession = () : TransactionBlock => { return this.txb ? this.txb : this.NewSession() }

    SignExcute = async (exes: ((protocol:Protocol, param:any) => void)[], priv_key:string, param?:any, options:SuiTransactionBlockResponseOptions={showObjectChanges:true}) : Promise<SuiTransactionBlockResponse> => {
        const client =  new SuiClient({ url: this.NetworkUrl() });  
        exes.forEach((e) => { e(this, param) });

        const privkey = fromHEX(priv_key);
        const keypair = Ed25519Keypair.fromSecretKey(privkey);

        const response = await client.signAndExecuteTransactionBlock({
            transactionBlock: this.CurrentSession(), 
            signer: keypair,
            options,
            
        });
        this.txb = undefined; // reset the txb to undefine
        return response;
    }

    // used in service, discount, order, because service has COIN wrapper for TOKEN
    static SUI_TOKEN_TYPE = '0x2::sui::SUI'; // TOKEN_TYPE
    // used in demand, reward, ...
    static SUI_COIN_TYPE = '0x2::coin::Coin<0x2::sui::SUI>'; // COIN TYPE
    WOWOK_TOKEN_TYPE = () => { return this.package + '::wowok::WOWOK' }
    WOWOK_COIN_TYPE = () => {  return '0x2::coin::Coin<' + this.package + '::wowok::WOWOK>'}


    static CLOCK_OBJECT = Inputs.SharedObjectRef({
        objectId:"0x6",
        mutable: false,
        initialSharedVersion: 1,
    });
    static TXB_OBJECT(txb:TransactionBlock, arg:TxbObject) : TransactionResult {
        if (typeof arg == 'string') return txb.object(arg) as TransactionResult;
        return arg;
    }
    static IsValidObjects = (arr:TxbObject[]) : boolean => { 
        return IsValidArray(arr, (v:TxbObject)=>{ 
            if (!v)  return false
            return true
        })
    }  
    WOWOK_OBJECTS_TYPE = () => (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => 
        { let i = this.package + '::' + key + '::';  return i + capitalize(key); })
    WOWOK_OBJECTS_PREFIX_TYPE = () => (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => 
        { return this.package + '::' + key + '::'; })
    object_name_from_type_repr = (type_repr:string) : string => {
        let i = type_repr.indexOf('::');
        if (i > 0 && type_repr.slice(0, i) === this.package) {
            i = type_repr.indexOf('<');
            if (i > 0) {
                type_repr = type_repr.slice(0, i);
            }
            
            let n = type_repr.lastIndexOf('::');
            if (n > 0) {
                return type_repr.slice(n+2);
            }
        }
        return ''
    }
}

export class RpcResultParser {
    static Object_Type_Extra = () => {
        let names = (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => { return key + '::' + capitalize(key); });
        names.push('order::Discount');
        return names;
    }
    static objectids_from_response = (protocol:Protocol, response:SuiTransactionBlockResponse, concat_result?:Map<string, TxbObject[]>): Map<string, TxbObject[]> => {
        let ret = new Map<string, string[]>();
        if (response?.objectChanges) {
            response.objectChanges.forEach((change) => {
                RpcResultParser.Object_Type_Extra().forEach((name) => {
                    let type = protocol.Package() + '::' + name;
                    if (change.type == 'created' && change.objectType.includes(type)) {
                        if (ret.has(name)) {
                            ret.get(name)?.push(change.objectId);
                        } else {
                            ret.set(name, [change.objectId]);
                        }
                    }                    
                })
            });    
        }
        if (concat_result) {
            ret.forEach((value, key) => {
                if (concat_result.has(key)) {
                    concat_result.set(key, concat_result.get(key)!.concat(value));
                } else {
                    concat_result.set(key, value);
                }
            })
        }
        return ret;
    }
}

export type Query_Param = {
    objectid: string;
    callback: (protocol:Protocol, response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions)=>void;
    parser?: (result:any[], guardid: string, chain_sense_bsc:Uint8Array, constant?:GuardConstant)  => boolean;
    data?: any; // response data filted by callback
    constants?: GuardConstant;
};
