import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, 
    SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX } from '@mysten/bcs';
import { Transaction as TransactionBlock, TransactionResult, TransactionArgument } from '@mysten/sui/transactions';
import { capitalize, IsValidAddress, IsValidArray, IsValidU128, IsValidU256, IsValidU64, IsValidU8 } from './utils'
import { GuardConstant } from './guard';
import { isValidSuiObjectId } from '@mysten/sui/utils'

export enum MODULES {
    machine = 'machine',
    progress = 'progress',
    repository = 'repository',
    permission = 'permission',
    passport = 'passport',
    guard = 'guard',
    demand = 'demand',
    order = 'order',
    service = 'service',
    resource = 'resource',
    entity = 'entity',
    wowok = 'wowok',
    treasury = 'treasury',
    payment = 'payment',
    arbitration = 'arbitration',
    arb = 'arb',
}

export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult | string | TransactionArgument;
export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult | string | TransactionArgument;
export type GuardAddress = TransactionResult;
export type GuardObject = TransactionResult | string | TransactionArgument ;
export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult | string | TransactionArgument;
export type PassportObject = TransactionResult;
export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult | string | TransactionArgument;
export type ServiceObject = TransactionResult  | string | TransactionArgument;
export type ServiceAddress = TransactionResult;
export type ArbitrationObject = TransactionResult  | string | TransactionArgument;
export type ArbitrationAddress = TransactionResult;
export type ArbObject = TransactionResult  | string | TransactionArgument;
export type ArbAddress = TransactionResult;
export type ProgressObject = TransactionResult | string | TransactionArgument;
export type ProgressAddress = TransactionResult;
export type TreasuryObject = TransactionResult | string | TransactionArgument;
export type TreasuryAddress = TransactionResult;
//export type RewardObject = TransactionResult | string | TransactionArgument;
//export type RewardAddress = TransactionResult;
export type OrderObject = TransactionResult | string | TransactionArgument;
export type OrderAddress = TransactionResult;
export type DiscountObject = TransactionResult | string | TransactionArgument;
export type CoinObject = TransactionResult | string | TransactionArgument;
//export type VoteObject = TransactionResult | string | TransactionArgument;
//export type VoteAddress = TransactionResult;
export type ResourceObject = TransactionResult | string | TransactionArgument;
export type ResourceAddress = TransactionResult;
export type EntityObject = TransactionResult | string | TransactionArgument;
export type EntityAddress = TransactionResult;
export type PaymentObject = TransactionResult | string | TransactionArgument;
export type PaymentAddress = TransactionResult;
export type ReceivedObject = TransactionResult | string | TransactionArgument;
export type CoinWrapperObject = TransactionResult;

export type TxbAddress = string | TransactionResult;
export type TxbObject = string | TransactionResult | TransactionArgument | GuardObject |  RepositoryObject | PermissionObject | MachineObject | PassportObject |
    DemandObject | ServiceObject  | OrderObject | DiscountObject  | DemandObject | ResourceObject | EntityObject | ArbitrationObject | ArbObject | TreasuryObject;

export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;

export enum OperatorType {
    TYPE_QUERY = 1, // query wowok object
    TYPE_NUMBER_ADD = 2,
    TYPE_NUMBER_SUBTRACT = 3, 
    TYPE_NUMBER_MULTIPLY = 4, 
    TYPE_NUMBER_DEVIDE = 5, 
    TYPE_NUMBER_MOD = 6,
    TYPE_NUMBER_ADDRESS = 7,

    TYPE_LOGIC_AS_U256_GREATER = 11,
    TYPE_LOGIC_AS_U256_GREATER_EQUAL = 12,
    TYPE_LOGIC_AS_U256_LESSER = 13,
    TYPE_LOGIC_AS_U256_LESSER_EQUAL = 14,
    TYPE_LOGIC_AS_U256_EQUAL = 15,
    TYPE_LOGIC_EQUAL = 16, // TYPE&DATA(vector<u8>) MUST BE EQUAL
    TYPE_LOGIC_HAS_SUBSTRING = 17, // SUBSTRING
    TYPE_LOGIC_NOT = 18, // NOT
    TYPE_LOGIC_AND = 19, // AND
    TYPE_LOGIC_OR = 20, // OR
}       

export const LogicsInfo = [
    [OperatorType.TYPE_LOGIC_AS_U256_GREATER, 'Unsigned Integer >', 'The first item > anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL, 'Unsigned Integer >=', 'The first item >= anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_LESSER, 'Unsigned Integer <', 'The first item < anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL, 'Unsigned Integer <=', 'The first item <= anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_EQUAL, 'Unsigned Integer =', 'The first item = anything that follows'],
    [OperatorType.TYPE_LOGIC_EQUAL, 'Equal', 'Data and type are exactly equal for all items'],
    [OperatorType.TYPE_LOGIC_HAS_SUBSTRING, 'Has Sub String', 'The first item contains anything that follows'],
    [OperatorType.TYPE_LOGIC_NOT, 'Not', 'Not operation'],
    [OperatorType.TYPE_LOGIC_AND, 'And', 'All Items And operations'],
    [OperatorType.TYPE_LOGIC_OR, 'Or', 'All Items Or operations'], 
];

export enum ValueType {
    TYPE_BOOL = 100,
    TYPE_ADDRESS = 101,
    TYPE_U8 = 102,
    TYPE_U64 = 103,
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
    TYPE_OPTION_STRING = 117,
    TYPE_OPTION_VEC_U8 = 118,
    TYPE_VEC_U256 = 119,
    TYPE_STRING = 120,
    TYPE_VEC_STRING = 121,
    TYPE_U256 = 122,
}

export enum RepositoryValueType {
    Address = 200,
    Address_Vec = 201,
    PositiveNumber = 202,
    PositiveNumber_Vec = 203,
    String = 204,
    String_Vec = 205,
    Bool = 206,
}

export const RepositoryValueTypeInfo = [
    {type: RepositoryValueType.String, name:'string', description:'String.'},
    {type: RepositoryValueType.Address, name:'address', description:'Object id or Personal address.'},
    {type: RepositoryValueType.PositiveNumber, name:'unsigned integer', description:'Including u8, u16 ,..., u256'},
    {type: RepositoryValueType.String_Vec, name:'string vector',  description:'Vector of string.'},
    {type: RepositoryValueType.Address_Vec, name:'address vector', description:'Vector of address.'},
    {type: RepositoryValueType.PositiveNumber_Vec, name:'unsigned integer vector', description:'Vector of unsigned integer'},
    {type: RepositoryValueType.Bool, name:'bool', description:'True or False.'},
]

export const OperatorTypeArray = (Object.values(OperatorType) as []).filter((v)=>typeof(v) === 'number') as number[];
export const ValueTypeArray = (Object.values(ValueType) as []).filter((v)=>typeof(v) === 'number') as number[];
export const IsValidOperatorType = (type:number) : boolean => { return OperatorTypeArray.includes(type)}
export const IsValidValueType = (type:number) : boolean => { return ValueTypeArray.includes(type)}
export const IsNumberType = (type:ValueType | any) : boolean => { return type===ValueType.TYPE_U128 || type===ValueType.TYPE_U256 ||
    type===ValueType.TYPE_U64 || type===ValueType.TYPE_U8 
}

export enum ContextType {
    TYPE_SIGNER  = 60, // address type; the signer address on verifying
    TYPE_CLOCK = 61, // u64 type; On-chain time at validation
    TYPE_GUARD = 62, // address type; the address of the guard being verified
    //TYPE_STACK_ADDRESS = 63, // object queried from current stack top
    TYPE_CONSTANT = 80,
}
interface ValueTypeString {
    type: ValueType | ContextType;
    name: string;
    description: string;
    validator?: (value:any) => boolean;
}

export const SER_VALUE: ValueTypeString[] = [
    {type: ValueType.TYPE_BOOL, name: 'bool', description:'boolean. eg:true or false', validator:(value:any) => { return (value === true || value === false)}},
    {type: ValueType.TYPE_ADDRESS, name: 'address', description:'address or object-id. eg:0x6789af', validator:IsValidAddress},
    {type: ContextType.TYPE_SIGNER, name: 'txn signer', description:"signer address of the transaction"},
    {type: ContextType.TYPE_GUARD, name: 'guard address', description:"current guard address"},
    {type: ContextType.TYPE_CLOCK, name: 'txn time', description:"unsigned-64 number for the transaction time"},
    {type: ValueType.TYPE_U64, name: 'number', description:'unsigned-64 number. eg:23870233', validator:IsValidU64},
    {type: ValueType.TYPE_U8, name: 'number', description:'unsigned-8 number. eg:255', validator:IsValidU8},
    {type: ValueType.TYPE_VEC_U8, name: 'string', description:'string or unsigned-8 number array. eg:"[1,2,3]"'},
    {type: ValueType.TYPE_U128, name: 'number', description:'unsigned-8 number. eg:12348900999', validator:IsValidU128},
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
    {type: ValueType.TYPE_VEC_STRING, name: '[string]', description:'ascii string array. eg:["abc", "hi"]'},
    {type: ValueType.TYPE_STRING, name: 'string', description:'eg:"wowok"', },
    {type: ValueType.TYPE_OPTION_STRING, name: 'option', description:'option of string. eg:none or string value'},
    {type: ValueType.TYPE_U256, name: 'number', description:'unsigned-256 number. eg:12345678901233', validator:IsValidU256},
]

//export type ConstantType = ValueType | ContextType.TYPE_WITNESS_ID;
export type Data_Type = ValueType | OperatorType | ContextType;

export enum ENTRYPOINT {
    mainnet = 'mainnet',
    testnet = 'testnet',
    devnet = 'devnet',
    localnet = 'localnet'
}

const TESTNET = {
    wowok: "0x82b571c4476f1d7213906c3f76731256f5c9a55f28a74660cf54e8ad56d77a57",
    wowok_origin:'0x82b571c4476f1d7213906c3f76731256f5c9a55f28a74660cf54e8ad56d77a57' ,
    base: '0x00b283ff2f3a0c706497faaa4e52536002c2a4908780d06582a98e2bc4a0a332',
    base_origin: '0x00b283ff2f3a0c706497faaa4e52536002c2a4908780d06582a98e2bc4a0a332',

    wowok_object: '0xe81643d04fcf6403adde4e9218de53fd66f2c7a715337b4710e573f6d272a4e5',
    entity_object: '0x2b2ef38ef38459397a137d807f3f5a914c98e2c6ae9878849def71aea0cc8ca9',
    treasury_cap:'0x176f957de5a0f8a5a47484a3dc8462c37df88a503781a0ac82cadd005aa80535',
    oracle_object:'0x43d91c12ffc66111767f93cc49a5c87db23465996cfaee2c0b1cc072adc0b68e',
}
const MAINNET = {
    wowok: "",
    wowok_origin:"",
    base:"",
    base_origin:"",

    wowok_object: '',
    entity_object: '',
    treasury_cap:'',
    oracle_object:'',
}

export interface CoinTypeInfo {
    symbol: string;
    type: string;
    decimals: number;
    alias ?: boolean;
}
export class Protocol {
    protected network = '';
    protected packages = new Map<string, string>();
    protected signer = '';
    protected wowok_object = '';
    protected entity_object = '';
    protected treasury_cap = '';
    protected oracle_object = '';
    //protected graphql = '';
    protected txb: TransactionBlock | undefined;
    static _instance: any;

    constructor(network:ENTRYPOINT=ENTRYPOINT.testnet) {
        this.use_network(network);
        this.new_session();
    }

    static Instance() : Protocol {
        if (!Protocol._instance) {
            Protocol._instance = new Protocol();
        }; return Protocol._instance
    }
    static Client() : SuiClient {
        return  new SuiClient({ url: Protocol.Instance().networkUrl() });  
    }
    
    client() { return new SuiClient({url: this.networkUrl() })}
    use_network(network:ENTRYPOINT=ENTRYPOINT.testnet) {
        this.network = network;
        switch(network) {
            case ENTRYPOINT.localnet:
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.packages.set('wowok', TESTNET.wowok);
                this.packages.set('base', TESTNET.base);
                this.packages.set('wowok_origin', TESTNET.wowok_origin); //@ orgin package!!!
                this.packages.set('base_origin', TESTNET.base_origin);
                this.wowok_object = TESTNET.wowok_object;
                this.entity_object= TESTNET.entity_object;
                this.treasury_cap = TESTNET.treasury_cap;
                //this.graphql = 'https://sui-testnet.mystenlabs.com/graphql';
                this.oracle_object = TESTNET.oracle_object;
                break;
            case ENTRYPOINT.mainnet:
                this.packages.set('wowok', MAINNET.wowok);
                this.packages.set('base', MAINNET.base);
                this.packages.set('wowok_origin', MAINNET.wowok_origin); //@ orgin package!!!
                this.packages.set('base_origin', MAINNET.base_origin);
                this.wowok_object = MAINNET.wowok_object;
                this.entity_object= MAINNET.entity_object;
                this.treasury_cap = MAINNET.treasury_cap;
                //this.graphql = 'https://sui-mainnet.mystenlabs.com/graphql';
                this.oracle_object = MAINNET.oracle_object;
                break;
        };
    }
    package(type:string): string { 
        return this.packages.get(type) ?? ''
    }

    objectWowok(): string { return this.wowok_object }
    objectEntity(): string { return this.entity_object }
    objectOracle(): string { return this.oracle_object }
    objectTreasuryCap() : string { return this.treasury_cap }
    
    networkUrl() : string { 
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
    
    machineFn = (fn:any) => { return `${this.packages.get('wowok')}::${MODULES.machine}::${fn}`};
    progressFn = (fn:any) => { return `${this.packages.get('wowok')}::${MODULES.progress}::${fn}`};
    repositoryFn = (fn:any) => { return `${this.packages.get('wowok')}::${MODULES.repository}::${fn}`};
    permissionFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.permission}::${fn}`};
    passportFn = (fn:any) => { return `${this.packages.get('wowok')}::${MODULES.passport}::${fn}`};
    demandFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.demand}::${fn}`};
    orderFn = (fn:any) => { return `${this.packages.get('wowok')}::${MODULES.order}::${fn}`};
    serviceFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.service}::${fn}`};
    resourceFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.resource}::${fn}`};
    entityFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.entity}::${fn}`};
    wowokFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.wowok}::${fn}`};
    treasuryFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.treasury}::${fn}`};
    paymentFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.payment}::${fn}`};
    guardFn = (fn: any) => { return `${this.packages.get('base')}::${MODULES.guard}::${fn}`};
    baseWowokFn = (fn: any) => { return `${this.packages.get('base')}::${MODULES.wowok}::${fn}`};
    arbitrationFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.arbitration}::${fn}`};
    arbFn = (fn: any) => { return `${this.packages.get('wowok')}::${MODULES.arb}::${fn}`};

    query = async (objects: Query_Param[], options:SuiObjectDataOptions={showContent:true}) : Promise<SuiObjectResponse[]> => {
        const client =  new SuiClient({ url: this.networkUrl() });  
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
    query_raw = async (objects: string[], options:SuiObjectDataOptions={showContent:true}) : Promise<SuiObjectResponse[]> => {
        const client =  new SuiClient({ url: this.networkUrl() });  
        return await client.call('sui_multiGetObjects', [objects, options]) as SuiObjectResponse[];
    }

    new_session = () : TransactionBlock => {
        this.txb = new  TransactionBlock();
        return this.txb
    }
    sessionCurrent = () : TransactionBlock => { return this.txb ? this.txb : this.new_session() }

    sign_excute = async (exes: ((protocol:Protocol, param:any) => void)[], priv_key:string, param?:any, options:SuiTransactionBlockResponseOptions={showObjectChanges:true}) : Promise<SuiTransactionBlockResponse> => {
        const client =  new SuiClient({ url: this.networkUrl() });  
        exes.forEach((e) => { e(this, param) });

        const privkey = fromHEX(priv_key);
        const keypair = Ed25519Keypair.fromSecretKey(privkey);
        const response = await client.signAndExecuteTransaction({
            transaction: this.sessionCurrent(), 
            signer: keypair,
            options,
        });
        this.txb = undefined; // reset the txb to undefine
        return response;
    }

    // used in service, discount, order, because service has COIN wrapper for TOKEN
    static SUI_TOKEN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'; // TOKEN_TYPE
    // used in demand, reward, ...
    static SUI_COIN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x2::sui::SUI>'; // COIN TYPE
    WOWOK_TOKEN_TYPE = () => { return this.packages.get('base') + '::wowok::WOWOK' }
    WOWOK_COIN_TYPE = () => {  return '0x2::coin::Coin<' + this.packages.get('base') + '::wowok::WOWOK>'}
    COINS_TYPE = () => { 
        switch(this.network) {
            case ENTRYPOINT.testnet:
                return this.CoinTypes_Testnet.filter((v)=>v.alias !== true);
            case ENTRYPOINT.mainnet:
                return this.CoinTypes_Mainnet.filter((v)=>v.alias !== true);
        }; return [];
    }
    update_coinType = (token_type: string, decimals:number, symbol: string) => {
        if (!symbol || !token_type) return ;
        switch(this.network) {
            case ENTRYPOINT.testnet:
                var r = this.CoinTypes_Testnet.filter((v) => v?.type !== token_type);
                r.push({symbol:symbol, type:token_type, decimals:decimals}); 
                this.CoinTypes_Testnet = r;
                break;
            case ENTRYPOINT.mainnet:
                var r = this.CoinTypes_Mainnet.filter((v) => v?.type !== token_type);
                r.push({symbol:symbol, type:token_type, decimals:decimals}); 
                this.CoinTypes_Mainnet = r;
                break;
        }; 
    }
    explorerUrl = (objectid: string, type:'object' | 'txblock' | 'account'='object') => {
        if (this.network === ENTRYPOINT.testnet) {
            return 'https://testnet.suivision.xyz/' + type + '/' + objectid;
        } else if (this.network === ENTRYPOINT.mainnet) {
            return 'https://suivision.xyz/' + type + '/' + objectid;
        }; return ''
    }

    CoinTypes_Testnet:CoinTypeInfo[] = [
        {symbol:'SUI', type:'0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals:9, alias:true},
        {symbol:'SUI', type:'0x2::sui::SUI', decimals:9, },
        {symbol:'WOW', type:TESTNET.base + '::wowok::WOWOK', decimals:9},
    ];

    CoinTypes_Mainnet:CoinTypeInfo[] = [
        {symbol:'SUI', type:'0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals:9, alias:true},
        {symbol:'SUI', type:'0x2::sui::SUI', decimals:9, },
        {symbol:'WOW', type:TESTNET.base + '::wowok::WOWOK', decimals:9},
        {symbol:'USDT', type:'0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN', decimals:6},
        {symbol:'USDC', type:'0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN', decimals:6},              
        {symbol:'WETH', type:'0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN', decimals:8},
        {symbol:'WBNB', type:'0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN', decimals:8},
    ];

    coinTypeInfo = (token_type: string, handler:(info:CoinTypeInfo)=>void) : CoinTypeInfo | 'loading' => {
        if (!token_type) return 'loading';
        let r = this.COINS_TYPE().find((v) => v?.type === token_type);
        if (!r) {
            Protocol.Client().getCoinMetadata({coinType:token_type}).then((res) => {
                if (res?.decimals && res?.symbol) {
                    this.update_coinType(token_type, res?.decimals, res?.symbol); 
                    handler({symbol:res.symbol, decimals:res.decimals, type:token_type});
                }
            }).catch((e) => {
                console.log(e);
            })
        } else {
            return r;
        }; return 'loading';
    }

    static CLOCK_OBJECT = {objectId:'0x6', mutable:false, initialSharedVersion:1};

    static TXB_OBJECT(txb:TransactionBlock, arg:TxbObject) : TransactionArgument {
        if (typeof(arg) == 'string') return txb.object(arg) as TransactionArgument;
        return arg;
    }
    static IsValidObjects = (arr:TxbObject[]) : boolean => { 
        return IsValidArray(arr, (v:TxbObject)=>{ 
            if (!v)  return false
            if (typeof(v) === 'string' && !isValidSuiObjectId(v)) {
                return false
            }
            return true
        })
    }  
    WOWOK_OBJECTS_TYPE = () => (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => 
        { let i = (key === MODULES.guard ? this.packages.get('base') : this.packages.get('wowok')) + '::' + key + '::';  return i + capitalize(key); })
    WOWOK_OBJECTS_PREFIX_TYPE = () => (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => 
        { return (key === MODULES.guard ? this.packages.get('base') : this.packages.get('wowok'))  + '::' + key + '::'; })
    hasPackage(pack:string) : boolean {
        for (let value of this.packages.values()) {
            if (pack.includes(value)) {
                return true;
            }
        } return false;
    }
    object_name_from_type_repr = (type_repr:string) : string => {
        if (!type_repr) return ''
        let i = type_repr.indexOf('::');
        if (i > 0 && this.hasPackage(type_repr.slice(0, i))) {
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
    module_object_name_from_type_repr = (type_repr:string) : string => {
        if (!type_repr) return ''
        let i = type_repr.indexOf('::');
        if (i > 0 && this.hasPackage(type_repr.slice(0, i))) {
            i = type_repr.indexOf('<');
            if (i > 0) {
                type_repr = type_repr.slice(0, i);
            }
            
            let n = type_repr.indexOf('::');
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
        //console.log(response)
        let ret = new Map<string, string[]>();
        if (response?.objectChanges) {
            response.objectChanges.forEach((change) => {
                RpcResultParser.Object_Type_Extra().forEach((name) => {
                    if (change.type == 'created' && protocol.module_object_name_from_type_repr(change.objectType)===name)  {
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

