
import { SuiObjectResponse, DynamicFieldPage } from '@mysten/sui/client';
import { ERROR, Errors } from './exception.js';
import { isValidSuiAddress, normalizeSuiAddress} from '@mysten/sui/utils'
import { RepositoryValueType, ValueType, Protocol, ContextType, OperatorType } from './protocol.js'
import { bcs } from '@mysten/sui/bcs';

export const MAX_U8 = BigInt('255');
export const MAX_U64 = BigInt('18446744073709551615');
export const MAX_U128 = BigInt('340282366920938463463374607431768211455');
export const MAX_U256 = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935');

export const OPTION_NONE = 0;

export const ValueTypeConvert = (type:ValueType | null | undefined) : RepositoryValueType | number => {
    if (type === ValueType.TYPE_U8 || type === ValueType.TYPE_U64 || type === ValueType.TYPE_U128 || 
        type === ValueType.TYPE_U256) {
            return RepositoryValueType.PositiveNumber
    } else if (type === ValueType.TYPE_VEC_U8 || type === ValueType.TYPE_VEC_U64 || type === ValueType.TYPE_VEC_U128 || 
        type === ValueType.TYPE_VEC_U256|| type === ValueType.TYPE_VEC_BOOL) {
            return RepositoryValueType.PositiveNumber_Vec
    } else if (type === ValueType.TYPE_ADDRESS) {
        return RepositoryValueType.Address
    } else if (type === ValueType.TYPE_VEC_ADDRESS) {
        return RepositoryValueType.Address_Vec
    } else if (type === ValueType.TYPE_STRING) {
        return RepositoryValueType.String
    } else if (type === ValueType.TYPE_VEC_STRING) {
        return RepositoryValueType.String_Vec
    } else if (type === ValueType.TYPE_BOOL) {
        return RepositoryValueType.Bool
    }
    return -1;
}

export const readOption = (arr: number[], de:ValueType) : {bNone:boolean, value:any} => {
    let o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        return {bNone:false,  value:Bcs.getInstance().de(de, Uint8Array.from(arr))};
    } else if (o[0] == 0) {
        return {bNone:true, value:OPTION_NONE};
    } else {
        ERROR(Errors.Fail, 'readOption: option invalid')
        return {bNone:true, value:OPTION_NONE}
    }
}

export const readOptionString = (arr: number[]) : {bNone:boolean, value:any}=> {
    let o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        let r = ulebDecode(Uint8Array.from(arr));
        let value = Bcs.getInstance().de(ValueType.TYPE_STRING, Uint8Array.from(arr));
        arr.splice(0, r.value+r.length);
        return {bNone:false,  value:value};
    } else if (o[0] == 0) {
        return {bNone:true, value:OPTION_NONE};
    } else {
        ERROR(Errors.Fail, 'readOption: option invalid')
        return {bNone:true, value:OPTION_NONE}
    }
}

export const ulebDecode = (arr: Uint8Array) : {value: number, length: number} => {
	let total = 0;
	let shift = 0;
	let len = 0;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		let byte = arr[len];
		len += 1;
		total |= (byte & 0x7f) << shift;
		if ((byte & 0x80) === 0) {
			break;
		}
		shift += 7;
	}

	return {
		value: total,
		length: len,
	};
}

export const readVec = (arr: any[], cb:(arr:any[], i:number, length:number) => any) : any[] => {
    let r = ulebDecode(Uint8Array.from(arr));
    arr.splice(0, r.length) ;

    let result = [];
    for (let i = 0; i < r.value; i++) {
        result.push(cb(arr, i, r.value));
    }    
    return result;
}

export const cb_U8 = (arr:any[], i:number, length:number) : any => {
    return arr.shift();
}
export const cb_U64 = (arr:any[], i:number, length:number) : any => {
    return arr.splice(0, 8);
}
export const cb_U128 = (arr:any[], i:number, length:number) : any => {
    return arr.splice(0, 16);
}
export const cb_U256 = (arr:any[], i:number, length:number) : any => {
    return arr.splice(0, 32);
}

export const concatenate = (resultConstructor:any, ...arrays:any[]) => {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new resultConstructor(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

export function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
 
  const copy: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}

export const parseObjectType = (chain_type:string | null | undefined, header:string='payment::Payment<') : string =>  {
    if (chain_type) {
        const i = chain_type.indexOf(header);
        if (i > 0) {
            let r = chain_type.slice(i + header.length, chain_type.length-1);
            return r
        }
    }
    return '';
}

export const array_equal =  (arr1: any[], arr2: any[]) => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return !arr1.some((item) => !arr2.includes(item));
}

export const array_unique = (arr:any[]) : any[] =>  {
    var newArr = [];
    for(var i = 0; i < arr.length; i++) {
        if(newArr.indexOf(arr[i]) == -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

export function capitalize (s:string) : string { 
    return s && s[0].toUpperCase() + s.slice(1)
}

// for: "0xsdjfkskf<0x2::sui::coin<xxx>, 0xfdfff<>>"
export function parse_object_type(object_data:string) : string[] {
    var object_type : string[] = [];
    let type_pos = object_data.indexOf('<');
    if (type_pos >= 0) { 
        let t = object_data.slice((type_pos+1), object_data.length-1);
        object_type = t.split(',');
    }
    return object_type;
}

export interface Entity_Info {
    name: string;
    description?: string;
    avatar?: string;
    twitter?: string;
    discord?: string;
    homepage?: string;
}

export class Bcs {
    private static _instance : any;
    private EntStruct = bcs.struct('EntStruct', {
        avatar: bcs.vector(bcs.u8()),
        resource: bcs.option(bcs.Address),
        safer_name: bcs.vector(bcs.string()),
        safer_value: bcs.vector(bcs.string()),
        like: bcs.u32(),
        dislike: bcs.u32(),
    });
    private TagStruct = bcs.struct('TagStruct', {
        nick: bcs.string(),
        tags: bcs.vector(bcs.string()),
    })
    private PersonalInfo = bcs.struct('PersonalInfo', {
        name: bcs.string(),
        description: bcs.string(),
        avatar: bcs.string(),
        twitter: bcs.string(),
        discord: bcs.string(),
        homepage: bcs.string(),
    })
    private Guards = bcs.struct('Guards', {
        address: bcs.option(bcs.Address),
    })
    private Perm = bcs.struct('Perm', {
        index: bcs.u64(),
        guard: bcs.option(bcs.Address)
    })
    private Perms = bcs.struct('Perms', {
        perms: bcs.vector(this.Perm),
    })

    private constructor() { }
    static getInstance() : Bcs { 
        if (!Bcs._instance) {
            Bcs._instance =  new Bcs();
        };
        return Bcs._instance;
     }

    ser_option_u32(data:Uint8Array | any) : Uint8Array {
        return bcs.option(bcs.u32()).serialize(data).toBytes();
    }

    ser(type:ValueType | ContextType, data:Uint8Array | any) : Uint8Array {
        switch(type) {
            case ValueType.TYPE_BOOL:
                return bcs.bool().serialize(data).toBytes();
            case ValueType.TYPE_ADDRESS:
                return bcs.Address.serialize(data).toBytes();
            case ValueType.TYPE_U64:
                return bcs.u64().serialize(data).toBytes();
            case ValueType.TYPE_U8:
                return bcs.u8().serialize(data).toBytes();
            case ValueType.TYPE_VEC_U8:
                return bcs.vector(bcs.u8()).serialize(data).toBytes();
            case ValueType.TYPE_U128:
                return bcs.u128().serialize(data).toBytes();
            case ValueType.TYPE_VEC_ADDRESS:
                return bcs.vector(bcs.Address).serialize(data).toBytes();
            case ValueType.TYPE_VEC_BOOL:
                return bcs.vector(bcs.bool()).serialize(data).toBytes();
            case ValueType.TYPE_VEC_VEC_U8:
                return bcs.vector(bcs.vector(bcs.u8())).serialize(data).toBytes();
            case ValueType.TYPE_VEC_U64:
                return bcs.vector(bcs.u64()).serialize(data).toBytes();
            case ValueType.TYPE_VEC_U128:
                return bcs.vector(bcs.u128()).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_ADDRESS:
                return bcs.option(bcs.Address).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_BOOL:
                return bcs.option(bcs.bool()).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_U8:
                return bcs.option(bcs.u8()).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_U64:
                return bcs.option(bcs.u64()).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_U128:
                return bcs.option(bcs.u128()).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_U256:
                return bcs.option(bcs.u256()).serialize(data).toBytes();
            case ValueType.TYPE_OPTION_STRING:
                return bcs.option(bcs.string()).serialize(data).toBytes();
            case ValueType.TYPE_VEC_U256:
                return bcs.vector(bcs.u256()).serialize(data).toBytes();
            case ValueType.TYPE_U256:
                return bcs.u256().serialize(data).toBytes();
            case ValueType.TYPE_STRING:
                return bcs.string().serialize(data).toBytes();
            case ValueType.TYPE_VEC_STRING:
                return bcs.vector(bcs.string()).serialize(data).toBytes();
            default:
                ERROR(Errors.bcsTypeInvalid, 'ser');
        }
        return new Uint8Array();
    }

    de(type:ValueType,  data:Uint8Array | any) : any {
        switch(type) {
            case ValueType.TYPE_BOOL:
                return bcs.bool().parse(data);
            case ValueType.TYPE_ADDRESS:
                return bcs.Address.parse(data);
            case ValueType.TYPE_U64:
                return bcs.u64().parse(data);
            case ValueType.TYPE_U8:
                return bcs.u8().parse(data);
            case ValueType.TYPE_VEC_U8:
                return bcs.vector(bcs.u8()).parse(data);
            case ValueType.TYPE_U128:
                return bcs.u128().parse(data);
            case ValueType.TYPE_VEC_ADDRESS:
                return bcs.vector(bcs.Address).parse(data);
            case ValueType.TYPE_VEC_BOOL:
                return bcs.vector(bcs.bool()).parse(data);
            case ValueType.TYPE_VEC_VEC_U8:
                return bcs.vector(bcs.vector(bcs.u8())).parse(data);
            case ValueType.TYPE_VEC_U64:
                return bcs.vector(bcs.u64()).parse(data);
            case ValueType.TYPE_VEC_U128:
                return bcs.vector(bcs.u128()).parse(data);  
            case ValueType.TYPE_OPTION_ADDRESS:
                return bcs.option(bcs.Address).parse(data);
            case ValueType.TYPE_OPTION_BOOL:
                return bcs.option(bcs.bool()).parse(data);
            case ValueType.TYPE_OPTION_U8:
                return bcs.option(bcs.u8()).parse(data);
            case ValueType.TYPE_OPTION_U64:
                return bcs.option(bcs.u64()).parse(data);
            case ValueType.TYPE_OPTION_U128:
                return bcs.option(bcs.u128()).parse(data);
            case ValueType.TYPE_OPTION_U256:
                return bcs.option(bcs.u256()).parse(data);  
            case ValueType.TYPE_OPTION_STRING:
                return bcs.option(bcs.string()).parse(data);
            case ValueType.TYPE_VEC_U256:
                return bcs.vector(bcs.u256()).parse(data);
            case ValueType.TYPE_STRING:
                return bcs.string().parse(data);
            case ValueType.TYPE_VEC_STRING:
                return bcs.vector(bcs.string()).parse(data);
            case ValueType.TYPE_U256:
                return bcs.u256().parse(data);
            default:
                ERROR(Errors.bcsTypeInvalid, 'de');
        }
    }

    de_ent(data:Uint8Array | undefined) : any | undefined {
        if (!data || data.length < 2) return undefined
        const struct_vec = bcs.vector(bcs.u8()).parse(data);
        return this.EntStruct.parse(Uint8Array.from(struct_vec))
    }  
    se_entInfo(info: Entity_Info) {
        return this.PersonalInfo.serialize({
            name: info.name ?? '',
            description: info.description ?? '',
            avatar: info.avatar ?? '',
            twitter: info.twitter ?? '',
            discord: info.discord ?? '',
            homepage: info.homepage ?? '',
        }).toBytes();
    }
    de_entInfo(data:Uint8Array | undefined) : any | undefined {
        if (!data || data.length === 0) return undefined
        return this.PersonalInfo.parse(data);
    }    
    de_tags(data:Uint8Array | undefined) : any | undefined {
        if (!data || data.length === 0) return undefined;
        const struct_vec = bcs.vector(bcs.u8()).parse(data);
        return this.TagStruct.parse(Uint8Array.from(struct_vec));
    }   
    de_perms(data:Uint8Array | undefined) : any | undefined {
        if (!data || data.length  < 1) return undefined
        const r = this.Perms.parse(data);
        return r.perms.map((v:any) => { //@ none, some
            return {index: v?.index, guard:v?.guard ?? undefined }
        })
    }   
}

export function stringToUint8Array(str:string) {
    const encoder = new TextEncoder();
    const view = encoder.encode(str);
    return new Uint8Array(view.buffer);
}

export function numToUint8Array(num:number) : Uint8Array {
    if (!num) return new Uint8Array(0)
    const a = [];
    a.unshift(num & 255)
    while (num >= 256) {
        num = num >>> 8
        a.unshift(num & 255)
    }
    return new Uint8Array(a)
} 

export const isArr = (origin: any): boolean => {
    let str = '[object Array]'
    return Object.prototype.toString.call(origin) == str ? true : false
}


export const deepClone = <T>(origin: T, target?: Record<string, any> | T ): T => {
    let tar = target || {}

    for (const key in origin) {
        if (Object.prototype.hasOwnProperty.call(origin, key)) {
            if (typeof origin[key] === 'object' && origin[key] !== null) {
                tar[key] = isArr(origin[key]) ? [] : {}
                deepClone(origin[key], tar[key])
            } else {
                tar[key] = origin[key]
            }
        }
    }

    return tar as T
}

export const MAX_DESCRIPTION_LENGTH = 4000;
export const MAX_LOCATION_LENGTH = 256;
export const MAX_NAME_LENGTH = 64;
export const MAX_ENDPOINT_LENGTH = 1024;
// export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };
export const IsValidStringLength = (str: string, max_len:number) : boolean => {
    return Bcs.getInstance().ser(ValueType.TYPE_STRING, str).length <= max_len
}
export const IsValidDesription = (description:string) : boolean => { 
    return IsValidStringLength(description, MAX_DESCRIPTION_LENGTH)
} 
export const IsValidLocation = (location:string) : boolean => {
    return IsValidStringLength(location, MAX_LOCATION_LENGTH)
}
export const IsValidName = (name?:string) : boolean => { 
    if(!name || name.length === 0) {
        return false;
    } 
    return IsValidStringLength(name, MAX_NAME_LENGTH) 
}

export const IsValidName_AllowEmpty = (name:string) : boolean => { return IsValidStringLength(name, MAX_NAME_LENGTH)}
export const IsValidEndpoint = (endpoint:string) : boolean => { 
    return (endpoint.length > 0 && endpoint.length <= MAX_ENDPOINT_LENGTH && isValidHttpUrl(endpoint)) ;
}
export const IsValidAddress = (addr:string | undefined | null) : boolean => { 
    if (!addr || !isValidSuiAddress(addr)) {
        return false; 
    }
    return true
}
export const IsValidCoinType = (coin_type?:string | null) : boolean => { 
    if (!coin_type) {
        return false; 
    }
    return coin_type.startsWith('0x2::coin::Coin') || coin_type.startsWith('0x0000000000000000000000000000000000000000000000000000000000000002')
}


export const getUTCDayStartByDivision = (interval=86400000): number => { // 1 day default
    const now = Date.now(); 
    return Math.floor(now / interval) * interval;
}

export const IsValidBigint = (value:string | number | undefined | bigint, max:bigint=MAX_U256, min?:bigint) : boolean => {
    if (value === '' || value === undefined) return false;
    try {
        const v = BigInt(value);
        if (v <= max) {
            if (min !== undefined) {
                return v >= min;
            }
            return true   
        }
    } catch (e) {
    }; return false
}

export const IsValidU8 = (value:string | number | undefined | bigint, min=0) : boolean => {
    return IsValidBigint(value, MAX_U8, BigInt(min))
}
export const IsValidU64 = (value:string | number | undefined | bigint, min=0) : boolean => {
    return IsValidBigint(value, MAX_U64, BigInt(min))
}
export const IsValidU128 = (value:string | number | undefined | bigint, min=0) : boolean => {
    return IsValidBigint(value, MAX_U128, BigInt(min))
}
export const IsValidU256 = (value:string | number | undefined | bigint, min=0) : boolean => {
    return IsValidBigint(value, MAX_U256, BigInt(min))
}

export const IsValidTokenType = (argType?: string) : boolean => { 
    if (!argType || argType.length === 0) {
        return false; 
    }
    let arr = argType.split('::');
    if (arr.length !== 3) {
        return false;
    } 
    if ((!IsValidAddress(arr[0]) && arr[0] != '0x2') || arr[1].length === 0 || arr[2].length === 0) {
        return false;
    }
    return true;
}
export const IsValidArgType = (argType?: string) : boolean => { 
    if (!argType || argType.length === 0) {
        return false; 
    }
    let arr = argType.split('::');
    if (arr.length < 3) {
        return false;
    } 
    return true;
}
export const IsValidInt = (value: number | string) : boolean => { 
    if (typeof(value) === 'string') {
        value = parseInt(value as string);
    }
    return Number.isSafeInteger(value) 
}
export const IsValidPercent = (value: number | string | bigint) : boolean => { 
    return IsValidBigint(value, BigInt(100), BigInt(0))
}

export const IsValidArray = (arr: any, validFunc:any) : boolean => {
    for (let i = 0; i < arr.length; i++) {
        if (!validFunc(arr[i])) {
            return false
        }
    }
    return true
}

export const ResolveU64 = (value:bigint) : bigint => {
    const max = MAX_U64;
    if (value > max) {
        return max;
    } else {
        return value
    }
}

function removeTrailingZeros(numberString: string): string {
    const trimmedString = numberString.trim();
    const decimalIndex = trimmedString.indexOf('.');
    
    if (decimalIndex !== -1) {
      let endIndex = trimmedString.length - 1;
      
      while (trimmedString[endIndex] === '0') {
        endIndex--;
      }
      
      if (trimmedString[endIndex] === '.') {
        endIndex--; 
      }
      
      return trimmedString.slice(0, endIndex + 1);
    }
    
    return trimmedString;
  }

export const ResolveBalance = (balance:string, decimals:number) : string => {
    if (!balance) return ''
    if (balance === '0') return '0'
    if (decimals <= 0) return balance;
    var pos = decimals - balance.length;
    if (pos === 0) {
       return removeTrailingZeros('.' + (balance));
    } else if (pos < 0) {
        let start = balance.slice(0, Math.abs(pos));
        let end = balance.slice(Math.abs(pos));
        return removeTrailingZeros(start + '.' + end);
    } else {
        return removeTrailingZeros('.' + balance.padStart(decimals, '0'));
    }
}

export type ArgType = {
    isCoin: boolean;
    coin: string;
    token: string;
}
export const ParseType = (type:string) : ArgType => {
    if (type) {
        const COIN = '0x2::coin::Coin<';
        let i = type.indexOf(COIN);
        if (i >= 0) {
            let coin = type.slice(i+COIN.length, type.length-1);
            if (coin.indexOf('<') === -1) {
                while (coin[coin.length-1] == '>') {
                    coin = coin.slice(0, -1);
                };
                let t = coin.lastIndexOf('::');      
                return {isCoin:true, coin:coin, token:coin.slice(t+2)}         
            }
        }
    }
    return  {isCoin:false, coin:'', token:''}
}


export function insertAtHead(array:Uint8Array, value:number) {
    const newLength = array.length + 1;
    const newArray = new Uint8Array(newLength);
    newArray.set([value], 0); 
    newArray.set(array, 1);
    return newArray;
}

export function toFixed(x:number) {
    let res = '';
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          res = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          res = x + (new Array(e+1)).join('0');
      }
    }
    return res;
  }

export function isValidHttpUrl(url:string) : boolean {
    let r:any;
    try {
      r = new URL(url);
    } catch (_) {
      return false;  
    }
  
    return r.protocol === "http:" || r.protocol === "https:" || r.protocol === 'ipfs:';
}

export interface query_object_param {
    id:string;
    onBegin?:(id:string)=>void;
    onObjectRes?:(id:string, res:SuiObjectResponse)=>void;
    onDynamicRes?:(id:string, res:DynamicFieldPage)=>void;
    onFieldsRes?:(id:string, fields_res:SuiObjectResponse[])=>void;
    onObjectErr?:(id:string, err:any)=>void;
    onDynamicErr?:(id:string, err:any)=>void;
    onFieldsErr?:(id:string, err:any)=>void;
}

export const uint2address = (value: number | bigint | string) : string => {
    return normalizeSuiAddress(value.toString(16)); 
}

export const query_object = (param:query_object_param) => {
    if (param.id) {
      if(param?.onBegin) param.onBegin(param.id);
      Protocol.Client().getObject({id:param.id, options:{showContent:true, showType:true, showOwner:true}}).then((res) => {
        if (res.error) {
            if(param?.onObjectErr) param.onObjectErr(param.id, res.error);
        } else {
            if(param?.onObjectRes) param.onObjectRes(param.id, res);
        }
      }).catch((err) => {
        //console.log(err)
        if (param?.onObjectErr) param.onObjectErr(param.id, err);
      });

      Protocol.Client().getDynamicFields({parentId:param.id}).then((res) => {
        if (param?.onDynamicRes) param.onDynamicRes(param.id, res);
        
        if (res.data.length > 0) {
          Protocol.Client().multiGetObjects({ids:res.data.map(v => v.objectId), options:{showContent:true}}).then((fields) => {
            if (param?.onFieldsRes) param.onFieldsRes(param.id, fields);
          }).catch((err) => {
            //console.log(err)
            if (param?.onFieldsErr) param.onFieldsErr(param.id, err);
          })          
        } 
      }).catch((err) => {
        //console.log(err)
        if (param?.onDynamicErr) param.onDynamicErr(param.id, err);
      })
    }
  }

export const FirstLetterUppercase = (str:string|undefined|null) : string => {
    if (!str) return '';
    return str.substring(0, 1).toUpperCase() + str.substring(1);
}

  
export function hasDuplicates<T>(array: T[]): boolean {
    return array.some((item, index) => array.findIndex(i => i === item) !== index);
}