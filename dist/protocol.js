import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromHEX } from '@mysten/bcs';
import { TransactionBlock, Inputs } from '@mysten/sui.js/transactions';
import { capitalize, IsValidArray } from './utils';
export var MODULES;
(function (MODULES) {
    MODULES["machine"] = "machine";
    MODULES["node"] = "node";
    MODULES["progress"] = "progress";
    MODULES["community"] = "community";
    MODULES["repository"] = "repository";
    MODULES["permission"] = "permission";
    MODULES["passport"] = "passport";
    MODULES["guard"] = "guard";
    MODULES["vote"] = "vote";
    MODULES["demand"] = "demand";
    MODULES["order"] = "order";
    MODULES["reward"] = "reward";
    MODULES["service"] = "service";
    MODULES["wowok"] = "wowok";
})(MODULES || (MODULES = {}));
export var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["TYPE_QUERY"] = 1] = "TYPE_QUERY";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER"] = 11] = "TYPE_LOGIC_AS_U256_GREATER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER_EQUAL"] = 12] = "TYPE_LOGIC_AS_U256_GREATER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER"] = 13] = "TYPE_LOGIC_AS_U256_LESSER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER_EQUAL"] = 14] = "TYPE_LOGIC_AS_U256_LESSER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_EQUAL"] = 15] = "TYPE_LOGIC_AS_U256_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_EQUAL"] = 16] = "TYPE_LOGIC_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_HAS_SUBSTRING"] = 17] = "TYPE_LOGIC_HAS_SUBSTRING";
    OperatorType[OperatorType["TYPE_LOGIC_ALWAYS_TRUE"] = 18] = "TYPE_LOGIC_ALWAYS_TRUE";
    OperatorType[OperatorType["TYPE_LOGIC_NOT"] = 19] = "TYPE_LOGIC_NOT";
    OperatorType[OperatorType["TYPE_LOGIC_AND"] = 20] = "TYPE_LOGIC_AND";
    OperatorType[OperatorType["TYPE_LOGIC_OR"] = 21] = "TYPE_LOGIC_OR";
})(OperatorType || (OperatorType = {}));
export var ValueType;
(function (ValueType) {
    ValueType[ValueType["TYPE_BOOL"] = 100] = "TYPE_BOOL";
    ValueType[ValueType["TYPE_ADDRESS"] = 101] = "TYPE_ADDRESS";
    ValueType[ValueType["TYPE_U64"] = 102] = "TYPE_U64";
    ValueType[ValueType["TYPE_U8"] = 103] = "TYPE_U8";
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
    ValueType[ValueType["TYPE_U256"] = 116] = "TYPE_U256";
})(ValueType || (ValueType = {}));
export var ContextType;
(function (ContextType) {
    ContextType[ContextType["TYPE_SIGNER"] = 60] = "TYPE_SIGNER";
    ContextType[ContextType["TYPE_CLOCK"] = 61] = "TYPE_CLOCK";
    ContextType[ContextType["TYPE_WITNESS_ID"] = 62] = "TYPE_WITNESS_ID";
    ContextType[ContextType["TYPE_VARIABLE"] = 80] = "TYPE_VARIABLE";
})(ContextType || (ContextType = {}));
export var ENTRYPOINT;
(function (ENTRYPOINT) {
    ENTRYPOINT["mainnet"] = "mainnet";
    ENTRYPOINT["testnet"] = "testnet";
    ENTRYPOINT["devnet"] = "devnet";
    ENTRYPOINT["localnet"] = "localnet";
})(ENTRYPOINT || (ENTRYPOINT = {}));
export class Protocol {
    network = '';
    package = '';
    signer = '';
    everyone_guard = '';
    graphql = '';
    txb;
    constructor(network = ENTRYPOINT.testnet) {
        this.UseNetwork(network);
        this.NewSession();
    }
    UseNetwork(network = ENTRYPOINT.testnet) {
        this.network = network;
        switch (network) {
            case ENTRYPOINT.localnet:
                this.package = "0xe9721254e97dd074e06c5efe5c57be169b64b39ae48939d89c00bf2f62b19e10";
                this.everyone_guard = "0xb2a3fe7881cb883743c4e962b7e3c7716a1cd47a67adad01dc79795def4f769d";
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = "0xffd87461cb8e54e0ae612a0d6a323d8c6fb4a85933e7481d3f4926ced3e6d7c7";
                this.everyone_guard = "0x78a41fcc4f566360839613f6b917fb101ae015e56b43143f496f265b6422fddc";
                this.graphql = 'https://sui-testnet.mystenlabs.com/graphql';
                break;
            case ENTRYPOINT.mainnet:
                break;
        }
        ;
    }
    Package() { return this.package; }
    EveryoneGuard() { return this.everyone_guard; }
    GraphqlUrl() { return this.graphql; }
    NetworkUrl() {
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
    MachineFn = (fn) => { return `${this.package}::${MODULES.machine}::${fn}`; };
    NodeFn = (fn) => { return `${this.package}::${MODULES.node}::${fn}`; };
    ProgressFn = (fn) => { return `${this.package}::${MODULES.progress}::${fn}`; };
    CommunityFn = (fn) => { return `${this.package}::${MODULES.community}::${fn}`; };
    RepositoryFn = (fn) => { return `${this.package}::${MODULES.repository}::${fn}`; };
    PermissionFn = (fn) => { return `${this.package}::${MODULES.permission}::${fn}`; };
    PassportFn = (fn) => { return `${this.package}::${MODULES.passport}::${fn}`; };
    GuardFn = (fn) => { return `${this.package}::${MODULES.guard}::${fn}`; };
    VoteFn = (fn) => { return `${this.package}::${MODULES.vote}::${fn}`; };
    DemandFn = (fn) => { return `${this.package}::${MODULES.demand}::${fn}`; };
    OrderFn = (fn) => { return `${this.package}::${MODULES.order}::${fn}`; };
    RewardFn = (fn) => { return `${this.package}::${MODULES.reward}::${fn}`; };
    ServiceFn = (fn) => { return `${this.package}::${MODULES.service}::${fn}`; };
    WowokFn = (fn) => { return `${this.package}::${MODULES.wowok}::${fn}`; };
    Query = async (objects, options = { showContent: true }) => {
        const client = new SuiClient({ url: this.NetworkUrl() });
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
    Query_Raw = async (objects, options = { showContent: true }) => {
        const client = new SuiClient({ url: this.NetworkUrl() });
        return await client.call('sui_multiGetObjects', [objects, options]);
    };
    NewSession = () => {
        this.txb = new TransactionBlock();
        return this.txb;
    };
    CurrentSession = () => { return this.txb ? this.txb : this.NewSession(); };
    SignExcute = async (exes, priv_key, param, options = { showObjectChanges: true }) => {
        const client = new SuiClient({ url: this.NetworkUrl() });
        exes.forEach((e) => { e(this, param); });
        const privkey = fromHEX(priv_key);
        const keypair = Ed25519Keypair.fromSecretKey(privkey);
        const response = await client.signAndExecuteTransactionBlock({
            transactionBlock: this.CurrentSession(),
            signer: keypair,
            options,
        });
        this.txb = undefined; // reset the txb to undefine
        return response;
    };
    // used in service, discount, order, because service has COIN wrapper for TOKEN
    static SUI_TOKEN_TYPE = '0x2::sui::SUI'; // TOKEN_TYPE
    // used in demand, reward, ...
    static SUI_COIN_TYPE = '0x2::coin::Coin<0x2::sui::SUI>'; // COIN TYPE
    WOWOK_TOKEN_TYPE = () => { return this.package + '::wowok::WOWOK'; };
    WOWOK_COIN_TYPE = () => { return '0x2::coin::Coin<' + this.package + '::wowok::WOWOK>'; };
    static CLOCK_OBJECT = Inputs.SharedObjectRef({
        objectId: "0x6",
        mutable: false,
        initialSharedVersion: 1,
    });
    static TXB_OBJECT(txb, arg) {
        if (typeof arg == 'string')
            return txb.object(arg);
        return arg;
    }
    static IsValidObjects = (arr) => {
        return IsValidArray(arr, (v) => {
            if (!v)
                return false;
            return true;
        });
    };
    WOWOK_OBJECTS_TYPE = () => Object.keys(MODULES).map((key) => { let i = this.package + '::' + key + '::'; return i + capitalize(key); });
    WOWOK_OBJECTS_PREFIX_TYPE = () => Object.keys(MODULES).map((key) => { return this.package + '::' + key + '::'; });
    object_name_from_type_repr = (type_repr) => {
        let i = type_repr.indexOf('::');
        if (i > 0 && type_repr.slice(0, i) === this.package) {
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
}
export class RpcResultParser {
    static Object_Type_Extra = () => {
        let names = Object.keys(MODULES).map((key) => { return key + '::' + capitalize(key); });
        names.push('order::Discount');
        return names;
    };
    static objectids_from_response = (protocol, response, concat_result) => {
        let ret = new Map();
        if (response?.objectChanges) {
            response.objectChanges.forEach((change) => {
                RpcResultParser.Object_Type_Extra().forEach((name) => {
                    let type = protocol.Package() + '::' + name;
                    if (change.type == 'created' && change.objectType.includes(type)) {
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
}
