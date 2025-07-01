import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { capitalize, IsValidAddress, IsValidArray, IsValidU128, IsValidU256, IsValidU64, IsValidU8 } from './utils.js';
import { isValidSuiObjectId } from '@mysten/sui/utils';
export var MODULES;
(function (MODULES) {
    MODULES["machine"] = "machine";
    MODULES["progress"] = "progress";
    MODULES["repository"] = "repository";
    MODULES["permission"] = "permission";
    MODULES["passport"] = "passport";
    MODULES["guard"] = "guard";
    MODULES["demand"] = "demand";
    MODULES["order"] = "order";
    MODULES["service"] = "service";
    MODULES["resource"] = "resource";
    MODULES["entity"] = "entity";
    MODULES["wowok"] = "wowok";
    MODULES["treasury"] = "treasury";
    MODULES["payment"] = "payment";
    MODULES["arbitration"] = "arbitration";
    MODULES["arb"] = "arb";
})(MODULES || (MODULES = {}));
export var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["TYPE_QUERY"] = 1] = "TYPE_QUERY";
    OperatorType[OperatorType["TYPE_NUMBER_ADD"] = 2] = "TYPE_NUMBER_ADD";
    OperatorType[OperatorType["TYPE_NUMBER_SUBTRACT"] = 3] = "TYPE_NUMBER_SUBTRACT";
    OperatorType[OperatorType["TYPE_NUMBER_MULTIPLY"] = 4] = "TYPE_NUMBER_MULTIPLY";
    OperatorType[OperatorType["TYPE_NUMBER_DEVIDE"] = 5] = "TYPE_NUMBER_DEVIDE";
    OperatorType[OperatorType["TYPE_NUMBER_MOD"] = 6] = "TYPE_NUMBER_MOD";
    OperatorType[OperatorType["TYPE_NUMBER_ADDRESS"] = 7] = "TYPE_NUMBER_ADDRESS";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER"] = 11] = "TYPE_LOGIC_AS_U256_GREATER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER_EQUAL"] = 12] = "TYPE_LOGIC_AS_U256_GREATER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER"] = 13] = "TYPE_LOGIC_AS_U256_LESSER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER_EQUAL"] = 14] = "TYPE_LOGIC_AS_U256_LESSER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_EQUAL"] = 15] = "TYPE_LOGIC_AS_U256_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_EQUAL"] = 16] = "TYPE_LOGIC_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_HAS_SUBSTRING"] = 17] = "TYPE_LOGIC_HAS_SUBSTRING";
    OperatorType[OperatorType["TYPE_LOGIC_NOT"] = 18] = "TYPE_LOGIC_NOT";
    OperatorType[OperatorType["TYPE_LOGIC_AND"] = 19] = "TYPE_LOGIC_AND";
    OperatorType[OperatorType["TYPE_LOGIC_OR"] = 20] = "TYPE_LOGIC_OR";
})(OperatorType || (OperatorType = {}));
export const LogicsInfo = [
    [OperatorType.TYPE_LOGIC_AS_U256_GREATER, 'Unsigned Integer >', 'The first item > anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL, 'Unsigned Integer >=', 'The first item >= anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_LESSER, 'Unsigned Integer <', 'The first item < anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL, 'Unsigned Integer <=', 'The first item <= anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_EQUAL, 'Unsigned Integer =', 'The first item = anything that follows'],
    [OperatorType.TYPE_LOGIC_EQUAL, 'Equal', 'Data and type are exactly equal for all items'],
    [OperatorType.TYPE_LOGIC_HAS_SUBSTRING, 'Has Sub String', 'The first string contains anything that follows'],
    [OperatorType.TYPE_LOGIC_NOT, 'Not', 'Not operation'],
    [OperatorType.TYPE_LOGIC_AND, 'And', 'All Items And operations'],
    [OperatorType.TYPE_LOGIC_OR, 'Or', 'All Items Or operations'],
];
export var ValueType;
(function (ValueType) {
    ValueType[ValueType["TYPE_BOOL"] = 100] = "TYPE_BOOL";
    ValueType[ValueType["TYPE_ADDRESS"] = 101] = "TYPE_ADDRESS";
    ValueType[ValueType["TYPE_U8"] = 102] = "TYPE_U8";
    ValueType[ValueType["TYPE_U64"] = 103] = "TYPE_U64";
    ValueType[ValueType["TYPE_VEC_U8"] = 104] = "TYPE_VEC_U8";
    ValueType[ValueType["TYPE_U128"] = 105] = "TYPE_U128";
    ValueType[ValueType["TYPE_VEC_ADDRESS"] = 106] = "TYPE_VEC_ADDRESS";
    ValueType[ValueType["TYPE_VEC_BOOL"] = 107] = "TYPE_VEC_BOOL";
    ValueType[ValueType["TYPE_VEC_VEC_U8"] = 108] = "TYPE_VEC_VEC_U8";
    ValueType[ValueType["TYPE_VEC_U64"] = 109] = "TYPE_VEC_U64";
    ValueType[ValueType["TYPE_VEC_U128"] = 110] = "TYPE_VEC_U128";
    ValueType[ValueType["TYPE_OPTION_ADDRESS"] = 111] = "TYPE_OPTION_ADDRESS";
    ValueType[ValueType["TYPE_OPTION_BOOL"] = 112] = "TYPE_OPTION_BOOL";
    ValueType[ValueType["TYPE_OPTION_U8"] = 113] = "TYPE_OPTION_U8";
    ValueType[ValueType["TYPE_OPTION_U64"] = 114] = "TYPE_OPTION_U64";
    ValueType[ValueType["TYPE_OPTION_U128"] = 115] = "TYPE_OPTION_U128";
    ValueType[ValueType["TYPE_OPTION_U256"] = 116] = "TYPE_OPTION_U256";
    ValueType[ValueType["TYPE_OPTION_STRING"] = 117] = "TYPE_OPTION_STRING";
    ValueType[ValueType["TYPE_OPTION_VEC_U8"] = 118] = "TYPE_OPTION_VEC_U8";
    ValueType[ValueType["TYPE_VEC_U256"] = 119] = "TYPE_VEC_U256";
    ValueType[ValueType["TYPE_STRING"] = 120] = "TYPE_STRING";
    ValueType[ValueType["TYPE_VEC_STRING"] = 121] = "TYPE_VEC_STRING";
    ValueType[ValueType["TYPE_U256"] = 122] = "TYPE_U256";
})(ValueType || (ValueType = {}));
export var RepositoryValueType;
(function (RepositoryValueType) {
    RepositoryValueType[RepositoryValueType["Address"] = 200] = "Address";
    RepositoryValueType[RepositoryValueType["Address_Vec"] = 201] = "Address_Vec";
    RepositoryValueType[RepositoryValueType["PositiveNumber"] = 202] = "PositiveNumber";
    RepositoryValueType[RepositoryValueType["PositiveNumber_Vec"] = 203] = "PositiveNumber_Vec";
    RepositoryValueType[RepositoryValueType["String"] = 204] = "String";
    RepositoryValueType[RepositoryValueType["String_Vec"] = 205] = "String_Vec";
    RepositoryValueType[RepositoryValueType["Bool"] = 206] = "Bool";
})(RepositoryValueType || (RepositoryValueType = {}));
export const RepositoryValueTypeInfo = [
    { type: RepositoryValueType.String, name: 'string', description: 'String.' },
    { type: RepositoryValueType.Address, name: 'address', description: 'Object id or Personal address.' },
    { type: RepositoryValueType.PositiveNumber, name: 'unsigned integer', description: 'Including u8, u16 ,..., u256' },
    { type: RepositoryValueType.String_Vec, name: 'string vector', description: 'Vector of string.' },
    { type: RepositoryValueType.Address_Vec, name: 'address vector', description: 'Vector of address.' },
    { type: RepositoryValueType.PositiveNumber_Vec, name: 'unsigned integer vector', description: 'Vector of unsigned integer' },
    { type: RepositoryValueType.Bool, name: 'bool', description: 'True or False.' },
];
export const OperatorTypeArray = Object.values(OperatorType).filter((v) => typeof (v) === 'number');
export const ValueTypeArray = Object.values(ValueType).filter((v) => typeof (v) === 'number');
export const IsValidOperatorType = (type) => { return OperatorTypeArray.includes(type); };
export const IsValidValueType = (type) => { return ValueTypeArray.includes(type); };
export const IsNumberType = (type) => {
    return type === ValueType.TYPE_U128 || type === ValueType.TYPE_U256 ||
        type === ValueType.TYPE_U64 || type === ValueType.TYPE_U8;
};
export var ContextType;
(function (ContextType) {
    ContextType[ContextType["TYPE_SIGNER"] = 60] = "TYPE_SIGNER";
    ContextType[ContextType["TYPE_CLOCK"] = 61] = "TYPE_CLOCK";
    ContextType[ContextType["TYPE_GUARD"] = 62] = "TYPE_GUARD";
    //TYPE_STACK_ADDRESS = 63, // object queried from current stack top
    ContextType[ContextType["TYPE_CONSTANT"] = 80] = "TYPE_CONSTANT";
})(ContextType || (ContextType = {}));
export const SER_VALUE = [
    { type: ValueType.TYPE_BOOL, name: 'bool', description: 'boolean. eg:true or false', validator: (value) => { return (value === true || value === false); } },
    { type: ValueType.TYPE_ADDRESS, name: 'address', description: 'address or object-id. eg:0x6789af', validator: IsValidAddress },
    { type: ContextType.TYPE_SIGNER, name: 'txn signer', description: "signer address of the transaction" },
    { type: ContextType.TYPE_GUARD, name: 'guard address', description: "current guard address" },
    { type: ContextType.TYPE_CLOCK, name: 'txn time', description: "unsigned-64 number for the transaction time" },
    { type: ValueType.TYPE_U64, name: 'number', description: 'unsigned-64 number. eg:23870233', validator: IsValidU64 },
    { type: ValueType.TYPE_U8, name: 'number', description: 'unsigned-8 number. eg:255', validator: IsValidU8 },
    { type: ValueType.TYPE_VEC_U8, name: 'string', description: 'string or unsigned-8 number array. eg:"[1,2,3]"' },
    { type: ValueType.TYPE_U128, name: 'number', description: 'unsigned-8 number. eg:12348900999', validator: IsValidU128 },
    { type: ValueType.TYPE_VEC_ADDRESS, name: '[address]', description: 'address array. eg:[0x2277f2, 0x3344af]' },
    { type: ValueType.TYPE_VEC_BOOL, name: '[bool]', description: 'boolean array. eg:[true, false, true]' },
    { type: ValueType.TYPE_VEC_VEC_U8, name: '[[number]]', description: 'array of unsigned-8 number array. eg:["i", "like", "wowok"]' },
    { type: ValueType.TYPE_VEC_U64, name: '[number]', description: 'unsigned-64 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_VEC_U128, name: '[number]', description: 'unsigned-128 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_OPTION_ADDRESS, name: 'option', description: 'option of address. eg:none or address' },
    { type: ValueType.TYPE_OPTION_BOOL, name: 'option', description: 'option of bool. eg:none or boolean value' },
    { type: ValueType.TYPE_OPTION_U8, name: 'option', description: 'option of u8. eg:none or u8 value' },
    { type: ValueType.TYPE_OPTION_U64, name: 'option', description: 'option of u64. eg:none or u64 value' },
    { type: ValueType.TYPE_OPTION_U128, name: 'option', description: 'option of u128. eg:none or u128 value' },
    { type: ValueType.TYPE_OPTION_U256, name: 'option', description: 'option of u256. eg:none or u256 value' },
    { type: ValueType.TYPE_VEC_U256, name: '[number]', description: 'unsigned-256 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_VEC_STRING, name: '[string]', description: 'ascii string array. eg:["abc", "hi"]' },
    { type: ValueType.TYPE_STRING, name: 'string', description: 'eg:"wowok"', },
    { type: ValueType.TYPE_OPTION_STRING, name: 'option', description: 'option of string. eg:none or string value' },
    { type: ValueType.TYPE_U256, name: 'number', description: 'unsigned-256 number. eg:12345678901233', validator: IsValidU256 },
];
export var ENTRYPOINT;
(function (ENTRYPOINT) {
    ENTRYPOINT["mainnet"] = "mainnet";
    ENTRYPOINT["testnet"] = "testnet";
    ENTRYPOINT["devnet"] = "devnet";
    ENTRYPOINT["localnet"] = "localnet";
})(ENTRYPOINT || (ENTRYPOINT = {}));
const TESTNET = {
    wowok: "0xd1ed1921f385bb6c016070325950e87f1d0e3b6a5dcc67c7a9a7b66618f29239",
    wowok_origin: '0xd1ed1921f385bb6c016070325950e87f1d0e3b6a5dcc67c7a9a7b66618f29239',
    base: '0xd9705a4f0b7ae3400d3af4ba781b2d2f6b4dc5dd81e2e1ce2bc949c16583df7f',
    base_origin: '0xd9705a4f0b7ae3400d3af4ba781b2d2f6b4dc5dd81e2e1ce2bc949c16583df7f',
    wowok_object: '0x04bc9f2680baa9e1cc1e52b329f7d7790afeb95f097b704c10116c257c5d07c4',
    entity_object: '0x70623568c63000b21b7b5e180c7e5415970763335c3e3b90b1795b0fc164c60d',
    treasury_cap: '0xfe7b18c27914fef876dfefd018350cfe33c45b6c5fbe5931f9449048e834da5b',
    oracle_object: '0x70b4a282626aef7d31822079a1727a6576c718e9640cb30ad4c385d632138689',
};
const MAINNET = {
    wowok: "",
    wowok_origin: "",
    base: "",
    base_origin: "",
    wowok_object: '',
    entity_object: '',
    treasury_cap: '',
    oracle_object: '',
};
export class Protocol {
    constructor(network = ENTRYPOINT.testnet) {
        this.network = '';
        this.packages = new Map();
        this.signer = '';
        this.wowok_object = '';
        this.entity_object = '';
        this.treasury_cap = '';
        this.oracle_object = '';
        this.machineFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.machine}::${fn}`; };
        this.progressFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.progress}::${fn}`; };
        this.repositoryFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.repository}::${fn}`; };
        this.permissionFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.permission}::${fn}`; };
        this.passportFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.passport}::${fn}`; };
        this.demandFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.demand}::${fn}`; };
        this.orderFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.order}::${fn}`; };
        this.serviceFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.service}::${fn}`; };
        this.resourceFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.resource}::${fn}`; };
        this.entityFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.entity}::${fn}`; };
        this.wowokFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.wowok}::${fn}`; };
        this.treasuryFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.treasury}::${fn}`; };
        this.paymentFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.payment}::${fn}`; };
        this.guardFn = (fn) => { return `${this.packages.get('base')}::${MODULES.guard}::${fn}`; };
        this.baseWowokFn = (fn) => { return `${this.packages.get('base')}::${MODULES.wowok}::${fn}`; };
        this.arbitrationFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.arbitration}::${fn}`; };
        this.arbFn = (fn) => { return `${this.packages.get('wowok')}::${MODULES.arb}::${fn}`; };
        this.query = async (objects, options = { showContent: true }) => {
            const client = new SuiClient({ url: this.networkUrl() });
            const ids = objects.map((value) => value.objectid);
            const res = await client.call('sui_multiGetObjects', [ids, options]);
            let ret = [];
            for (let i = 0; i < res.length; i++) {
                objects.forEach((object) => {
                    object.callback(this, res[i], object, options);
                });
            }
            return res;
        };
        this.query_raw = async (objects, options = { showContent: true }) => {
            const client = new SuiClient({ url: this.networkUrl() });
            return await client.call('sui_multiGetObjects', [objects, options]);
        };
        this.new_session = () => {
            this.txb = new TransactionBlock();
            return this.txb;
        };
        this.sessionCurrent = () => { return this.txb ? this.txb : this.new_session(); };
        this.sign_excute = async (exes, priv_key, param, options = { showObjectChanges: true }) => {
            const client = new SuiClient({ url: this.networkUrl() });
            exes.forEach((e) => { e(this, param); });
            const keypair = Ed25519Keypair.fromSecretKey(priv_key);
            const response = await client.signAndExecuteTransaction({
                transaction: this.sessionCurrent(),
                signer: keypair,
                options,
            });
            this.txb = undefined; // reset the txb to undefine
            return response;
        };
        this.WOWOK_TOKEN_TYPE = () => { return this.packages.get('base') + '::wowok::WOWOK'; };
        this.WOWOK_COIN_TYPE = () => { return '0x2::coin::Coin<' + this.packages.get('base') + '::wowok::WOWOK>'; };
        this.COINS_TYPE = () => {
            switch (this.network) {
                case ENTRYPOINT.testnet:
                    return this.CoinTypes_Testnet.filter((v) => v.alias !== true);
                case ENTRYPOINT.mainnet:
                    return this.CoinTypes_Mainnet.filter((v) => v.alias !== true);
            }
            ;
            return [];
        };
        this.update_coinType = (token_type, decimals, symbol) => {
            if (!symbol || !token_type)
                return;
            switch (this.network) {
                case ENTRYPOINT.testnet:
                    var r = this.CoinTypes_Testnet.filter((v) => v?.type !== token_type);
                    r.push({ symbol: symbol, type: token_type, decimals: decimals });
                    this.CoinTypes_Testnet = r;
                    break;
                case ENTRYPOINT.mainnet:
                    var r = this.CoinTypes_Mainnet.filter((v) => v?.type !== token_type);
                    r.push({ symbol: symbol, type: token_type, decimals: decimals });
                    this.CoinTypes_Mainnet = r;
                    break;
            }
            ;
        };
        this.explorerUrl = (objectid, type = 'object') => {
            if (this.network === ENTRYPOINT.testnet) {
                return 'https://testnet.suivision.xyz/' + type + '/' + objectid;
            }
            else if (this.network === ENTRYPOINT.mainnet) {
                return 'https://suivision.xyz/' + type + '/' + objectid;
            }
            ;
            return '';
        };
        this.CoinTypes_Testnet = [
            { symbol: 'SUI', type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals: 9, alias: true },
            { symbol: 'SUI', type: '0x2::sui::SUI', decimals: 9, },
            { symbol: 'WOW', type: TESTNET.base + '::wowok::WOWOK', decimals: 9 },
        ];
        this.CoinTypes_Mainnet = [
            { symbol: 'SUI', type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals: 9, alias: true },
            { symbol: 'SUI', type: '0x2::sui::SUI', decimals: 9, },
            { symbol: 'WOW', type: TESTNET.base + '::wowok::WOWOK', decimals: 9 },
            { symbol: 'USDT', type: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN', decimals: 6 },
            { symbol: 'USDC', type: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN', decimals: 6 },
            { symbol: 'WETH', type: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN', decimals: 8 },
            { symbol: 'WBNB', type: '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN', decimals: 8 },
        ];
        this.coinTypeInfo = (token_type, handler) => {
            if (!token_type)
                return 'loading';
            let r = this.COINS_TYPE().find((v) => v?.type === token_type);
            if (!r) {
                Protocol.Client().getCoinMetadata({ coinType: token_type }).then((res) => {
                    if (res?.decimals && res?.symbol) {
                        this.update_coinType(token_type, res?.decimals, res?.symbol);
                        handler({ symbol: res.symbol, decimals: res.decimals, type: token_type });
                    }
                }).catch((e) => {
                    console.log(e);
                });
            }
            else {
                return r;
            }
            ;
            return 'loading';
        };
        this.WOWOK_OBJECTS_TYPE = () => Object.keys(MODULES).map((key) => { let i = (key === MODULES.guard ? this.packages.get('base') : this.packages.get('wowok')) + '::' + key + '::'; return i + capitalize(key); });
        this.WOWOK_OBJECTS_PREFIX_TYPE = () => Object.keys(MODULES).map((key) => { return (key === MODULES.guard ? this.packages.get('base') : this.packages.get('wowok')) + '::' + key + '::'; });
        this.object_name_from_type_repr = (type_repr) => {
            if (!type_repr)
                return '';
            let i = type_repr.indexOf('::');
            if (i > 0 && this.hasPackage(type_repr.slice(0, i))) {
                i = type_repr.indexOf('<');
                if (i > 0) {
                    type_repr = type_repr.slice(0, i);
                }
                let n = type_repr.lastIndexOf('::');
                if (n > 0) {
                    return type_repr.slice(n + 2);
                }
            }
            return '';
        };
        this.module_object_name_from_type_repr = (type_repr) => {
            if (!type_repr)
                return '';
            let i = type_repr.indexOf('::');
            if (i > 0 && this.hasPackage(type_repr.slice(0, i))) {
                i = type_repr.indexOf('<');
                if (i > 0) {
                    type_repr = type_repr.slice(0, i);
                }
                let n = type_repr.indexOf('::');
                if (n > 0) {
                    return type_repr.slice(n + 2);
                }
            }
            return '';
        };
        this.use_network(network);
        this.new_session();
    }
    static Instance() {
        if (!Protocol._instance) {
            Protocol._instance = new Protocol();
        }
        ;
        return Protocol._instance;
    }
    static Client() {
        return new SuiClient({ url: Protocol.Instance().networkUrl() });
    }
    client() { return new SuiClient({ url: this.networkUrl() }); }
    use_network(network = ENTRYPOINT.testnet) {
        this.network = network;
        switch (network) {
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
                this.entity_object = TESTNET.entity_object;
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
                this.entity_object = MAINNET.entity_object;
                this.treasury_cap = MAINNET.treasury_cap;
                //this.graphql = 'https://sui-mainnet.mystenlabs.com/graphql';
                this.oracle_object = MAINNET.oracle_object;
                break;
        }
        ;
    }
    package(type) {
        return this.packages.get(type) ?? '';
    }
    objectWowok() { return this.wowok_object; }
    objectEntity() { return this.entity_object; }
    objectOracle() { return this.oracle_object; }
    objectTreasuryCap() { return this.treasury_cap; }
    networkUrl() {
        switch (this.network) {
            case ENTRYPOINT.localnet:
                return "http://127.0.0.1:9000";
            case ENTRYPOINT.devnet:
                return "https://fullnode.devnet.sui.io:443";
            case ENTRYPOINT.testnet:
                return "https://fullnode.testnet.sui.io:443";
            case ENTRYPOINT.mainnet:
                return "https://fullnode.mainnet.sui.io:443";
        }
        ;
        return "";
    }
    ;
    static TXB_OBJECT(txb, arg) {
        if (typeof (arg) == 'string')
            return txb.object(arg);
        return arg;
    }
    hasPackage(pack) {
        for (let value of this.packages.values()) {
            if (pack.includes(value)) {
                return true;
            }
        }
        return false;
    }
}
// used in service, discount, order, because service has COIN wrapper for TOKEN
Protocol.SUI_TOKEN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'; // TOKEN_TYPE
// used in demand, reward, ...
Protocol.SUI_COIN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x2::sui::SUI>'; // COIN TYPE
Protocol.CLOCK_OBJECT = { objectId: '0x6', mutable: false, initialSharedVersion: 1 };
Protocol.IsValidObjects = (arr) => {
    return IsValidArray(arr, (v) => {
        if (!v)
            return false;
        if (typeof (v) === 'string' && !isValidSuiObjectId(v)) {
            return false;
        }
        return true;
    });
};
export class RpcResultParser {
}
RpcResultParser.Object_Type_Extra = () => {
    let names = Object.keys(MODULES).map((key) => { return key + '::' + capitalize(key); });
    names.push('order::Discount');
    return names;
};
RpcResultParser.objectids_from_response = (protocol, response, concat_result) => {
    //console.log(response)
    let ret = new Map();
    if (response?.objectChanges) {
        response.objectChanges.forEach((change) => {
            RpcResultParser.Object_Type_Extra().forEach((name) => {
                if (change.type == 'created' && protocol.module_object_name_from_type_repr(change.objectType) === name) {
                    if (ret.has(name)) {
                        ret.get(name)?.push(change.objectId);
                    }
                    else {
                        ret.set(name, [change.objectId]);
                    }
                }
            });
        });
    }
    if (concat_result) {
        ret.forEach((value, key) => {
            if (concat_result.has(key)) {
                concat_result.set(key, concat_result.get(key).concat(value));
            }
            else {
                concat_result.set(key, value);
            }
        });
    }
    return ret;
};
//# sourceMappingURL=protocol.js.map