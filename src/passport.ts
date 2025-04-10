import { type TransactionObjectInput, Inputs, Transaction as TransactionBlock, TransactionResult, CallArg} from '@mysten/sui/transactions';
import { SuiObjectResponse } from '@mysten/sui/client';
import { FnCallType, GuardObject, Protocol, ContextType, OperatorType, Data_Type,
    ValueType, SER_VALUE, IsValidOperatorType } from './protocol.js';
import { parse_object_type, array_unique, Bcs, ulebDecode, IsValidAddress, IsValidArray, insertAtHead, readOption, readOptionString } from './utils.js';
import { ERROR, Errors } from './exception.js';
import { Guard, GuardMaker } from './guard.js';

export type Guard_Query_Object = {
    target: FnCallType, // object fnCall
    object: TransactionObjectInput | string, // object 
    types: string[], // object type
    id: string, // object id
}

interface GuardInfo {
    id: string; // guard id
    digest?: string;
    version?: string | number;
    input: DeGuardInput[]; // object or witness object query
    constant: DeGuardConstant[]; // witness in constant & ValueType.TYPE_ADDRESS(for Query)
}

export interface DeGuardConstant {
    type: number; // 
    value: any; //
    bWitness: boolean; 
    identifier: number; // ID
}
export interface DeGuardInput {
    type: number; // 
    value?: any; //
    identifier?: number; // ID
    cmd?: number; // 
}
export interface DeGuardData extends DeGuardInput {
    child: DeGuardData[];
    ret_type?: number;
}

export interface WitnessFill {
    guard: string;
    witness?: any;
    cmd: number[];
    cited: number;
    type: ValueType;
    identifier: number;
}

export interface PassportQuery {
    query: Guard_Query_Object[];
    info: GuardInfo[];
}
export class GuardParser {
    protected guard_list: GuardInfo[] = [];
    protected guards: string[];

    private constructor(guards: string[]) { 
        this.guards = guards;
    }
    guardlist = () => { return this.guard_list }

    static DeGuardObject_FromData = (guard_constants:any, guard_input_bytes:any) : {object:DeGuardData, constant:DeGuardConstant[]} => {
        let  constants : DeGuardConstant[] = GuardParser.parse_constant(guard_constants);
        // console.log(constants)
        
        let inputs : DeGuardInput[] = GuardParser.parse_bcs(constants, guard_input_bytes);
        // console.log(data);
        if (!inputs || inputs.length == 0) ERROR(Errors.Fail, 'GuardObject: data parsed error');
        let stack: DeGuardData[] = [];
        inputs.forEach((d) => {
            GuardParser.ResolveData(constants, stack, {...d, child:[]});
        })

        if (stack.length != 1) {
            ERROR(Errors.Fail, 'GuardObject: parse error');
        }
    
        return {object:stack.pop()!, constant:constants};
    }
    /// convert guard-on-chain to js object
    static DeGuardObject = async (protocol: Protocol, guard: string) : Promise<{object:DeGuardData, constant:DeGuardConstant[]}> => {
        if (!IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress,  'GuardObject guard')
        }

        let res = await protocol.query_raw([guard]);
        if (res.length == 0 || !res[0].data || res[0].data?.objectId != guard) {
            ERROR(Errors.Fail, 'GuardObject query error');
        }

        // console.log(res[0].data?.content);
        let content = res[0].data!.content as any;
        if (content?.type != protocol.package('base') + '::guard::Guard') {
            ERROR(Errors.Fail, 'GuardObject object invalid')
        }

        return GuardParser.DeGuardObject_FromData(content.fields.constants, content.fields.input.fields.bytes);
    }

    static ResolveData = (constants:  DeGuardConstant[], stack:DeGuardData[], current: DeGuardData) => {
        switch (current.type) {
            case OperatorType.TYPE_LOGIC_NOT:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 1) ERROR(Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT');

                var param = stack.pop() as DeGuardData;
                if (!param.ret_type || param.ret_type !=  ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT type invalid');
                }

                current.child.push(param);
                stack.push(current);
                return;
            case OperatorType.TYPE_NUMBER_ADDRESS:
                current.ret_type = ValueType.TYPE_ADDRESS;
                if (stack.length < 1) ERROR(Errors.Fail, 'ResolveData: TYPE_NUMBER_ADDRESS');

                var param = stack.pop() as DeGuardData;
                if (!param.ret_type || !GuardMaker.match_u256(param.ret_type)) {
                    ERROR(Errors.Fail, 'ResolveData: TYPE_NUMBER_ADDRESS type invalid');
                }

                current.child.push(param);
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
            case OperatorType.TYPE_NUMBER_ADD:
            case OperatorType.TYPE_NUMBER_DEVIDE:
            case OperatorType.TYPE_NUMBER_MOD:
            case OperatorType.TYPE_NUMBER_MULTIPLY:
            case OperatorType.TYPE_NUMBER_SUBTRACT:
                if (current.type === OperatorType.TYPE_LOGIC_AS_U256_GREATER || current.type === OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL ||
                    current.type === OperatorType.TYPE_LOGIC_AS_U256_LESSER || current.type === OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL ||
                    current.type === OperatorType.TYPE_LOGIC_AS_U256_EQUAL) {
                        current.ret_type = ValueType.TYPE_BOOL;
                } else {
                    current.ret_type = ValueType.TYPE_U256;
                }
                
                if (stack.length < current.value || current.value < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                for (let i = 0; i < current.value; ++i) {
                    var p = stack.pop() as DeGuardData;
                    if (!p.ret_type || !GuardMaker.match_u256(p.ret_type))  ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return
            case OperatorType.TYPE_LOGIC_EQUAL:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                var p0 = stack.pop() as DeGuardData;
                current.child.push(p0);
                for (let i = 1; i < current.value; ++i) {
                    var p = stack.pop() as DeGuardData;
                    if (!p.ret_type || (p.ret_type != p0.ret_type))  ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                for (let i = 0; i < current.value; ++i) {
                    var p = stack.pop() as DeGuardData;
                    if (!p.ret_type || (p.ret_type != ValueType.TYPE_STRING))  ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                for (let i = 0; i < current.value; ++i) {
                    var p = stack.pop() as DeGuardData;
                    if (!p.ret_type || (p.ret_type != ValueType.TYPE_BOOL))  ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return
            case OperatorType.TYPE_QUERY:
                if (!current?.cmd)  ERROR(Errors.Fail, 'OperateParamCount: cmd invalid ' + current.type);
                let r = Guard.GetCmd(current.cmd!);
                if (!r) ERROR(Errors.Fail, 'OperateParamCount: cmd not supported ' + current.type);
                current.ret_type = r?.return;

                if (stack.length < r!.parameters.length) ERROR(Errors.Fail, 'OperateParamCount: cmd param lost ' + current.type);
                r!.parameters.forEach((e:number) => {    
                    let d = stack.pop() as DeGuardData;
                    if (!d?.ret_type || d.ret_type != e) {
                        ERROR(Errors.Fail, 'OperateParamCount: cmd param not match ' + current.type);
                    }
                    current.child.push(d)
                });
               
                stack.push(current);
                return
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U256:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_U8:
            case ValueType.TYPE_VEC_VEC_U8:
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_U8:
            case ValueType.TYPE_STRING:
                current.ret_type = current.type;
                stack.push(current);
                return;
            case ContextType.TYPE_CLOCK:
                current.ret_type = ValueType.TYPE_U64;
                stack.push(current);
                return;
            case ContextType.TYPE_SIGNER:
                current.ret_type = ValueType.TYPE_ADDRESS;
                stack.push(current);
                return;
            case ContextType.TYPE_GUARD:
                current.ret_type = ValueType.TYPE_ADDRESS;
                stack.push(current);
                return;
            case ContextType.TYPE_CONSTANT:
                let  v = constants.find((e) => e.identifier ==  current?.identifier);
                if (!v) ERROR(Errors.Fail, 'OperateParamCount: identifier  invalid ' + current.type);
                
                current.ret_type = v?.type;
                stack.push(current);
                return;
                
        }   
        ERROR(Errors.Fail, 'OperateParamCount: type  invalid ' + current.type);
    }

    private static  Parse_Guard_Helper(guards: string[], res:SuiObjectResponse[]) {
        const protocol = Protocol.Instance();
        const me = new GuardParser(guards);
        res.forEach((r) => {
            const c = r.data?.content as any;
            if (!c) ERROR(Errors.Fail, 'Parse_Guard_Helper invalid content');
            const index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => {return v.includes('guard::Guard') && v == c.type});
            if (index === -1) ERROR(Errors.Fail, 'Parse_Guard_Helper invalid type: ' + c.type);


            if (c.fields.input.type === (protocol.package('base') + '::bcs::BCS')) {
                const constants = GuardParser.parse_constant(c.fields.constants); // MUST first
                const inputs = GuardParser.parse_bcs(constants, Uint8Array.from(c.fields.input.fields.bytes));
                me.guard_list.push({id: c.fields.id.id, input:[...inputs],  constant:[...constants], digest:r.data?.digest??'', version:r.data?.version ?? ''});
            } else {
                ERROR(Errors.Fail, 'Parse_Guard_Helper invalid package: '+c.fields.input.type);
            }
        })
        return me
    }

    static Create = async (guards: string[], onGuardInfo?:(parser:GuardParser|undefined)=>void) => {
        if (!IsValidArray(guards, IsValidAddress)) {
            if (onGuardInfo) onGuardInfo(undefined);
            return undefined;
        }

        let guard_list = array_unique(guards);
        if (onGuardInfo) {
            Protocol.Instance().query_raw(guard_list)
                .then((res) => { 
                    onGuardInfo(GuardParser.Parse_Guard_Helper(guards, res)); 
                }).catch((e) => { 
                    console.log(e);
                    onGuardInfo(undefined); 
                })            
        } else {
            const res = await Protocol.Instance().query_raw(guard_list);
            return GuardParser.Parse_Guard_Helper(guards, res);
        }
    }

    future_fills = () : WitnessFill[] => {
        const ret : WitnessFill[] = [];
        this.guard_list.forEach((g) => {
            // cmd already in query_list, so filter it out.
            //console.log(g.constant); console.log(g.input)
            g.constant.filter((i)=>i.bWitness).forEach((v) => {
                const cmd = g.input.filter((k)=>k.identifier === v.identifier && k.cmd !== undefined).map((k)=>k.cmd!);
                let cited = 0;
                g.input.forEach((k) => {
                    if (k.identifier === v.identifier) cited ++;
                })
                ret.push({guard:g.id,  witness:undefined, identifier:v.identifier, type:v.type, cmd:cmd??[], cited:cited});
            })
        }); return ret;
    }

    static parse_constant = (constants:any) : DeGuardConstant[] => {
        let  ret : DeGuardConstant[] = [];
        constants.forEach((c:any) => {
            let v = c?.fields ?? c; // graphql dosnot 'fields', but rpcall has.
            const data:Uint8Array = Uint8Array.from(v.value);
            const type = data.slice(0, 1)[0];

            if (v.bWitness) { //@ witness
                ret.push({identifier:v.identifier, type:type, bWitness:v.bWitness, value:undefined});
                return 
            }

            var value : any = data.slice(1);
            switch (type) {
                case ValueType.TYPE_ADDRESS:
                    value = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(value)).toString();
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                case ValueType.TYPE_U64:
                case ValueType.TYPE_U128:
                case ValueType.TYPE_U256:
                case ValueType.TYPE_VEC_U8:
                case ValueType.TYPE_VEC_U64:
                case ValueType.TYPE_VEC_U128:
                case ValueType.TYPE_VEC_ADDRESS:
                case ValueType.TYPE_VEC_BOOL:
                case ValueType.TYPE_VEC_VEC_U8:
                case ValueType.TYPE_OPTION_ADDRESS:
                case ValueType.TYPE_OPTION_BOOL: 
                case ValueType.TYPE_OPTION_U128:
                case ValueType.TYPE_OPTION_U8:
                case ValueType.TYPE_OPTION_U64:
                case ValueType.TYPE_OPTION_U256:
                case ValueType.TYPE_VEC_U256:
                case ValueType.TYPE_STRING:
                case ValueType.TYPE_OPTION_STRING:
                case ValueType.TYPE_OPTION_VEC_U8:
                case ValueType.TYPE_VEC_STRING:
                    let de  = SER_VALUE.find(s=>s.type==type);
                    if (!de) ERROR(Errors.Fail, 'GuardObject de error')
                    value = Bcs.getInstance().de(type as number, Uint8Array.from(value));
                    break;

                default:
                    ERROR(Errors.Fail, 'GuardObject constant type invalid:' +type)
            }
            ret.push({identifier:v.identifier, type:type, bWitness:v.bWitness, value:value});
        });
        return ret;
    }

    static parse_bcs = (constants: DeGuardConstant[], chain_bytes: Uint8Array) : DeGuardInput[] => {
        let bytes = Uint8Array.from(chain_bytes);
        let arr = [].slice.call(bytes.reverse());
        let data : DeGuardInput[] = [];
        while (arr.length > 0) {
            let type : unknown = arr.shift() ;
            let value:any; let cmd:any; let identifier:any; 
            switch (type as Data_Type) { 
                case ContextType.TYPE_SIGNER:
                case ContextType.TYPE_CLOCK:
                case ContextType.TYPE_GUARD:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_NUMBER_ADDRESS:
                    break;
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case OperatorType.TYPE_LOGIC_EQUAL:
                case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case OperatorType.TYPE_NUMBER_ADD:
                case OperatorType.TYPE_NUMBER_DEVIDE:
                case OperatorType.TYPE_NUMBER_MOD:
                case OperatorType.TYPE_NUMBER_MULTIPLY:
                case OperatorType.TYPE_NUMBER_SUBTRACT:
                case OperatorType.TYPE_LOGIC_AND: //@ with logics count
                case OperatorType.TYPE_LOGIC_OR:
                    value = arr.shift()! as number; 
                    break;
                case ContextType.TYPE_CONSTANT:
                    identifier = arr.shift()! as number;  // identifier
                    break;
                case ValueType.TYPE_ADDRESS: 
                    value = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                    arr.splice(0, 32); // address     
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as number;
                    arr.shift();
                    break;
                case ValueType.TYPE_U64: 
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as number;
                    arr.splice(0, 8);
                    break;
                case ValueType.TYPE_U128: 
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as bigint;
                    arr.splice(0, 16);
                    break;
                case ValueType.TYPE_U256:
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as bigint;
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_VEC_U8:
                case ValueType.TYPE_VEC_BOOL:
                case ValueType.TYPE_STRING:
                    let r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value+r.length);
                    break;  
                case ValueType.TYPE_VEC_ADDRESS:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*32+r.length);
                    break;  
                case ValueType.TYPE_VEC_U128:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*16+r.length);
                    break;  
                case ValueType.TYPE_VEC_U256:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*32+r.length);
                    break;  
                case ValueType.TYPE_VEC_U64:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*8+r.length);
                    break;              
                case ValueType.TYPE_VEC_VEC_U8:
                case ValueType.TYPE_VEC_STRING:
                    r = ulebDecode(Uint8Array.from(arr)); arr.splice(0, r.length);
                    let res = [];
                    for (let i = 0; i < r.value; i++) {
                        let r2 = ulebDecode(Uint8Array.from(arr)); 
                        res.push(Bcs.getInstance().de(ValueType.TYPE_VEC_U8, Uint8Array.from(arr)));
                        arr.splice(0, r2.length+r2.value);
                    }
                    value = res;
                    break;     
                case OperatorType.TYPE_QUERY:
                    let t = arr.splice(0, 1); // data-type
                    if (t[0] == ValueType.TYPE_ADDRESS) {
                        let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                        arr.splice(0, 32); // address            
                        value = addr;
                        cmd = Bcs.getInstance().de('u16', Uint8Array.from(arr.splice(0, 2))) as number; // cmd(u16)
                    } else if (t[0] == ContextType.TYPE_CONSTANT) {
                        let id = arr.splice(0, 1); // key
                        let v = constants.find((v) => 
                            (v.identifier == id[0]) && 
                            ((v.type == ValueType.TYPE_ADDRESS)));
                        if (!v) { ERROR(Errors.Fail, 'GuardObject: indentifier not in  constant')}
                        identifier = id[0];
                        cmd = Bcs.getInstance().de('u16', Uint8Array.from(arr.splice(0, 2))) as number; // cmd(u16)
                    } else {
                        ERROR(Errors.Fail, 'GuardObject: constant type invalid');
                    }
                    break;
                case ValueType.TYPE_OPTION_ADDRESS:
                    let read = readOption(arr, ValueType.TYPE_ADDRESS);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 32);
                    break;
                case ValueType.TYPE_OPTION_BOOL:
                    read = readOption(arr, ValueType.TYPE_BOOL);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 1);
                    break;
                case ValueType.TYPE_OPTION_U8:
                    read = readOption(arr, ValueType.TYPE_U8);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 1);
                    break;
                case ValueType.TYPE_OPTION_U128:
                    read = readOption(arr, ValueType.TYPE_U128);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 16);
                    break;
                case ValueType.TYPE_OPTION_U256:
                    read = readOption(arr, ValueType.TYPE_U256);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 32);
                    break;
                case ValueType.TYPE_OPTION_U64:
                    read = readOption(arr, ValueType.TYPE_U64);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 8);
                    break;
                case ValueType.TYPE_OPTION_STRING:
                    read = readOptionString(arr); // splice in it
                    value = read.value;
                    break;
                default:
                    ERROR(Errors.Fail, 'GuardObject: parse_bcs types ' + type)
            }
            data.push({type:type as number, value:value, cmd:cmd, identifier:identifier});
        } 
        return data;
    }

    done = async (fill?:WitnessFill[], onPassportQueryReady?:(passport:PassportQuery | undefined)=>void) : Promise<PassportQuery | undefined>=> {
        let objects: string[] = [];
        // check all witness and get all objects to query.
        this.guard_list.forEach((g) => {
            g.constant.forEach((v)=> {
                if (v.bWitness) {
                    const value = fill?.find((i)=>i.identifier === v.identifier);
                    if (!value) {
                        ERROR(Errors.Fail, 'done: invalid witness '+v.identifier);
                    } else {
                        v.value = value.witness;
                    }
                }
            })
            g.input.filter((v)=>v.cmd !== undefined).forEach((i)=> {
                if (i.identifier !== undefined) {
                    const value = g.constant.find((c)=>c.identifier === i.identifier && c.type === ValueType.TYPE_ADDRESS);
                    if (!value || !IsValidAddress(value.value as string)) ERROR(Errors.Fail, 'done: invalid identifier '+i.identifier);
                    objects.push(value!.value);
                } else {
                    objects.push(i.value);
                }
            })
        })
        
        if (onPassportQueryReady) {
            if (objects.length === 0) {
                onPassportQueryReady(this.done_helper([]));
                return
            }
            Protocol.Instance().query_raw(array_unique(objects), {showType:true}).then((res) => {
                onPassportQueryReady(this.done_helper(res));
            }).catch(e => {
                console.log(e);
                onPassportQueryReady(undefined);
            })
            return undefined;
        } else {
            let res:any[] = [];
            if (objects.length > 0) {
                res = await Protocol.Instance().query_raw(array_unique(objects), {showType:true});
            }
            return this.done_helper(res);
        }
    }

    private done_helper(res:SuiObjectResponse[]) {
        let query: Guard_Query_Object[] = [];
        let guards: TransactionObjectInput[] = [];
        this.guard_list.forEach(g => {
            guards.push(g.id);
            g.input.filter((v)=>v.cmd !== undefined).forEach(q => { // query list
                let id = q.value;
                if (!id && q.identifier !== undefined) {
                    id = g.constant.find((i)=>i.identifier == q.identifier)?.value;
                }
                
                let r = res.find(r => r.data?.objectId == id);  
                if (!r)   { ERROR(Errors.Fail, 'query object not match')} 
                let object = this.object_query(r!.data); // build passport query objects
                if (!object) { ERROR(Errors.Fail, 'query object fail')} 
                query.push(object!);
            })
        })

        return {query:query, info:this.guard_list} as PassportQuery;
    }

    // create onchain query for objects : object, movecall-types, id
    private object_query = (data: any, method:'guard_query'|'witness'='guard_query') : Guard_Query_Object | undefined=> {
        for (let k = 0; k < Protocol.Instance().WOWOK_OBJECTS_TYPE().length; k++) {
            if (data.type.includes(Protocol.Instance().WOWOK_OBJECTS_TYPE()[k]) ) { // type: pack::m::Object<...>
                return  { target:Protocol.Instance().WOWOK_OBJECTS_PREFIX_TYPE()[k] + method as FnCallType,
                    object:Inputs.SharedObjectRef({
                        objectId: data.objectId,
                        mutable: false,
                        initialSharedVersion: data.version,
                    }) as TransactionObjectInput,
                    types:parse_object_type(data.type as string),
                    id: data.objectId,
                } as Guard_Query_Object;
            }
        }
    }
}

export class Passport {
    static MAX_GUARD_COUNT = 8;
    protected passport;
    protected txb;

    get_object () { return this.passport }
    // return passport object used
    // bObject(true) in cmd env; (false) in service env
    constructor (txb:TransactionBlock, query:PassportQuery)  {
        if (query.info.length === 0 || query.info.length > Passport.MAX_GUARD_COUNT)   {
            ERROR(Errors.InvalidParam, 'guards' )
        }

        this.txb = txb;  //console.log(query)
        this.passport = this.txb.moveCall({
            target:Protocol.Instance().passportFn('new') as FnCallType,
            arguments: []
        });

        // add others guards, if any
        query.info.forEach((g) => {
            const ids = g.constant.filter((i)=>i.bWitness).map((v)=>v.identifier);
            const values = g.constant.filter((i)=>i.bWitness).map((v)=> {
                const bcs = Bcs.getInstance().ser(v.type, v.value);
                let r = new Uint8Array(bcs.length + 1);
                r.set([v.type], 0); r.set(bcs, 1);
                return [].slice.call(r)
            });

            const guard = g.version !== undefined && g.digest !== undefined ? 
                txb.objectRef({objectId:g.id, version:g.version, digest:g.digest}) :
                txb.object(g.id);
            //console.log(ids); console.log(values)
            this.txb.moveCall({
                target:Protocol.Instance().passportFn('guard_add') as FnCallType,
                arguments:[this.passport, guard, this.txb.pure.vector('u8', [].slice.call(ids)), 
                    this.txb.pure(Bcs.getInstance().ser('vector<vector<u8>>', [...values]))]
            });      
        })

        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        // rules: 'verify' & 'query' in turns; 'verify' at final end.
        query?.query.forEach((q) => {
            this.txb.moveCall({
                target: Protocol.Instance().passportFn('passport_verify') as FnCallType,
                arguments: [ this.passport, this.txb.object(clock)]
            }); 
            this.txb.moveCall({
                target: q.target as FnCallType,
                arguments: [ this.txb.object(q.id), this.passport],
                typeArguments: q.types,
            })
        }) 
        this.txb.moveCall({
            target: Protocol.Instance().passportFn('passport_verify') as FnCallType,
            arguments: [ this.passport,  this.txb.object(clock) ]
        });  
    }
    
    destroy() {
        this.txb.moveCall({
            target: Protocol.Instance().passportFn('destroy') as FnCallType,
            arguments: [ this.passport ]
        });  
    }

    freeze() {
        this.txb.moveCall({
            target: Protocol.Instance().passportFn('freezen') as FnCallType,
            arguments: [ this.passport ]
        });  
    }

    query_result(sender:string, handleResult:OnQueryPassportResult) {
        this.txb.moveCall({
            target: Protocol.Instance().passportFn('query_result') as FnCallType,
            arguments: [ this.passport ]
        });  

        Protocol.Client().devInspectTransactionBlock({sender:sender, transactionBlock:this.txb}).then((res) => {
            const r = Passport.ResolveQueryRes(this.txb, res);
            if (r) handleResult(r);
        }).catch(e=>{
            console.log(e);
        })
    }

    query_result_async = async (sender:string) : Promise<QueryPassportResult | undefined> => {
        this.txb.moveCall({
            target: Protocol.Instance().passportFn('query_result') as FnCallType,
            arguments: [ this.passport ]
        });  

        const res = await Protocol.Client().devInspectTransactionBlock({sender:sender, transactionBlock:this.txb});
        return Passport.ResolveQueryRes(this.txb, res);
    }

    private static  ResolveQueryRes(txb:TransactionBlock, res:any) : QueryPassportResult | undefined {
        for (let i = 0; i < res.results?.length; ++ i) {
            const v = res.results[i];
            if (v?.returnValues && v.returnValues.length === 2 && 
                v.returnValues[0][1] === 'bool' && v.returnValues[1][1] === 'vector<address>') { // (bool, vector<address>)
                const result = Bcs.getInstance().de('bool', Uint8Array.from(v.returnValues[0][0]));
                const guards = Bcs.getInstance().de('vector<address>', Uint8Array.from(v.returnValues[1][0])).map((v:string)=>'0x'+v);
                return {txb:txb, result:result, guards:guards}
            }
        }
        return undefined
    }
}

export interface QueryPassportResult {
    txb: TransactionBlock;
    result: boolean;
    guards: string[];
}

export type OnQueryPassportResult = (result:QueryPassportResult) => void;


