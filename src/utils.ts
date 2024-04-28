import { bcs, BCS, toHEX, fromHEX, getSuiMoveConfig, TypeName, StructTypeDefinition } from '@mysten/bcs';
import { TransactionBlock, Inputs, TransactionResult, TransactionArgument } from '@mysten/sui.js/transactions';

export const ulebDecode = (arr: number[] | Uint8Array) : {value: number, length: number} => {
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

export const array_equal =  (arr1: any[], arr2: any[]) => {
    // Array.some(): 有一项不满足，返回false
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

export class Bcs {
    bcs = new BCS(getSuiMoveConfig());
    private static _instance : any;
    private constructor() {
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
    }
    static getInstance() : Bcs { 
        if (!Bcs._instance) {
            Bcs._instance =  new Bcs();
        };
        return Bcs._instance;
     }
    ser_option_string(data:string) : Uint8Array {
        return this.bcs.ser('Option<string>', {'some': data}).toBytes();
    }
    ser_option_u64(data:number) : Uint8Array {
        return this.bcs.ser('Option<u64>', {'some': data}).toBytes();
    }
    ser_option_address(data:string) : Uint8Array {
        return this.bcs.ser('Option<address>', {'some': data}).toBytes();
    }
    ser_vector_string(data:string[]) : Uint8Array {
        return this.bcs.ser('vector<string>', data).toBytes();
    }
    ser_vector_vector_u8(data:string[]) : Uint8Array {
        return this.bcs.ser('vector<vector<u8>>', data).toBytes();
    }
    ser_vector_u64(data:number[]) : Uint8Array {
        return this.bcs.ser('vector<u64>', data).toBytes();
    }
    ser_vector_u8(data:number[])  : Uint8Array {
        return this.bcs.ser('vector<u8>', data).toBytes();
    }
    ser_address(data:string) : Uint8Array {
        return this.bcs.ser(BCS.ADDRESS, data).toBytes();
    }
    ser_bool(data:boolean) : Uint8Array {
        return this.bcs.ser(BCS.BOOL, data).toBytes();
    }
    ser_u8(data:number) : Uint8Array {
        return this.bcs.ser(BCS.U8, data).toBytes();
    }
    ser_u64(data:number) : Uint8Array {
        return this.bcs.ser(BCS.U64, data).toBytes();
    }
    ser_string(data:string) : Uint8Array {
        return this.bcs.ser(BCS.STRING, data).toBytes();
    }
    de(type:TypeName | StructTypeDefinition, data:Uint8Array) {
        return this.bcs.de(type, data)
    }
}

export function stringToUint8Array(str:string) : Uint8Array {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
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

// 判断是否为数组
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

export const MAX_DESCRIPTION_LENGTH = 1024;
export const MAX_NAME_LENGTH = 64;
export const MAX_ENDPOINT_LENGTH = 1024;
// export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };

export const IsValidDesription = (description:string) : boolean => { return description?.length <= MAX_DESCRIPTION_LENGTH }
export const IsValidName = (name:string) : boolean => { if(!name) return false; return name.length <= MAX_NAME_LENGTH && name.length != 0 }
export const IsValidName_AllowEmpty = (name:string) : boolean => { return name.length <= MAX_NAME_LENGTH }
export const IsValidEndpoint = (endpoint:string) : boolean => { if (!endpoint) return false; return endpoint.length <= MAX_ENDPOINT_LENGTH }
export const IsValidAddress = (addr:string) : boolean => { if (!addr) return false; return true}
export const IsValidArgType = (argType: string) : boolean => { if (!argType) return false; return argType.length != 0 }
export const IsValidUint = (value: number) : boolean => { return Number.isSafeInteger(value) && value != 0 }
export const IsValidInt = (value: number) : boolean => { return Number.isSafeInteger(value) }
export const IsValidPercent = (value: number) : boolean => { return Number.isSafeInteger(value) && value > 0 && value <= 100 }
export const IsValidArray = (arr: any[], validFunc:any) : boolean => {
    let bValid = true;
    arr.forEach((v) => {
        if (!validFunc(v)) {
            bValid = false; 
        }
    })
    return bValid;
}

export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };

