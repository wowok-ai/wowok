
export enum Errors {
    IsValidDesription = 'invalid description',
    IsValidName = 'invalid name',
    IsValidName_AllowEmpty = 'invalid name',
    IsValidEndpoint = 'invalid endpoint',
    IsValidAddress = 'invalid address',
    IsValidArgType = 'invalid argument type',
    IsValidTokenType = 'invalid token type',
    IsValidUint = 'invalid uint',
    IsValidInt = 'invalid int', 
    IsValidU64 = 'invalid u64',
    IsValidU8 = 'invalid u8',
    IsValidPercent = 'invalid percent',
    IsValidArray = 'invalid array',
    IsValidObjects = 'invalid objects',
    AllInvalid = 'one valid at least',
    InvalidParam  = 'invalid parameter',
    IsValidPermissionIndex = 'invalid permission index',
    IsValidKey = 'invalid key',
    Fail = 'fail',
    IsValidIndentifier = 'indentifier invalid',
    isValidHttpUrl = 'invalid url',
    IsValidBizPermissionIndex = 'invalid biz-permission index',
    bcsTypeInvalid = 'invalid bcs type',
    IsValidServiceItemName = 'invalid service item name',
    IsValidCoinType = 'not the coin type',
    IsValidGuardIdentifier = 'guard identifier invalid',
    noPermission = 'no permission',
    IsValidValue = 'invalid value',
    IsValidLocation = 'invalid location',
}

export const ERROR = (error:Errors, info?:any) =>  {
    const e = error.toString() + (info ? (' ' + info) : '');
    throw e;
}