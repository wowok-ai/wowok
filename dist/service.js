import { IsValidArray, IsValidPercent, IsValidName_AllowEmpty, parseObjectType, array_unique, IsValidTokenType, IsValidDesription, IsValidAddress, IsValidEndpoint, IsValidU64, IsValidName, } from './utils.js';
import { Protocol } from './protocol.js';
import { ERROR, Errors } from './exception.js';
export var Service_Discount_Type;
(function (Service_Discount_Type) {
    Service_Discount_Type[Service_Discount_Type["ratio"] = 0] = "ratio";
    Service_Discount_Type[Service_Discount_Type["minus"] = 1] = "minus";
})(Service_Discount_Type || (Service_Discount_Type = {}));
export var BuyRequiredEnum;
(function (BuyRequiredEnum) {
    BuyRequiredEnum["address"] = "address";
    BuyRequiredEnum["phone"] = "phone";
    BuyRequiredEnum["name"] = "name";
    BuyRequiredEnum["postcode"] = "postcode";
})(BuyRequiredEnum || (BuyRequiredEnum = {}));
export class Service {
    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};
    get_pay_type() { return this.pay_token_type; }
    get_object() { return this.object; }
    get_txb() { return this.txb; }
    constructor(txb, pay_token_type, permission) {
        this.pay_token_type = pay_token_type;
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    static From(txb, token_type, permission, object) {
        let s = new Service(txb, token_type, permission);
        s.object = Protocol.TXB_OBJECT(txb, object);
        return s;
    }
    static New(txb, token_type, permission, description, payee_treasury, passport) {
        if (!Protocol.IsValidObjects([permission, payee_treasury])) {
            ERROR(Errors.IsValidObjects);
        }
        if (!IsValidTokenType(token_type)) {
            ERROR(Errors.IsValidTokenType, 'New: pay_token_type');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let pay_token_type = token_type;
        let s = new Service(txb, pay_token_type, permission);
        if (passport) {
            s.object = txb.moveCall({
                target: Protocol.Instance().serviceFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), Protocol.TXB_OBJECT(txb, payee_treasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        else {
            s.object = txb.moveCall({
                target: Protocol.Instance().serviceFn('new'),
                arguments: [txb.pure.string(description), Protocol.TXB_OBJECT(txb, payee_treasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        return s;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().serviceFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.pay_token_type]
        });
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_price(item, price, bNotFoundAssert = true, passport) {
        if (!IsValidU64(price)) {
            ERROR(Errors.IsValidU64, 'set_price price');
        }
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'set_price item');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('price_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(price),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('price_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(price),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_stock(item, stock, bNotFoundAssert = true, passport) {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'item');
        }
        if (!IsValidU64(stock)) {
            ERROR(Errors.IsValidU64, 'stock');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('stock_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('stock_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    add_stock(item, stock_add, bNotFoundAssert = true, passport) {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'add_stock item');
        }
        if (!IsValidU64(stock_add)) {
            ERROR(Errors.IsValidUint, 'add_stock stock_add');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('stock_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_add),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('stock_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_add),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    reduce_stock(item, stock_reduce, bNotFoundAssert = true, passport) {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'reduce_stock item');
        }
        if (!IsValidU64(stock_reduce)) {
            ERROR(Errors.IsValidUint, 'reduce_stock stock_reduce');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('stock_reduce_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_reduce),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('stock_reduce'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_reduce),
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_sale_endpoint(item, endpoint, bNotFoundAssert = true, passport) {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'set_sale_endpoint item');
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint, 'set_sale_endpoint endpoint');
        }
        let ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('sale_endpoint_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), ep,
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('sale_endpoint_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), ep,
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_payee(payee, passport) {
        if (!Protocol.IsValidObjects([payee])) {
            ERROR(Errors.IsValidObjects, 'set_payee');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('payee_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, payee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('payee_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, payee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    add_repository(repository, passport) {
        if (!Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository_add');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('repository_add_with_passport'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('repository_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    remove_repository(repository_address, removeall, passport) {
        if (!removeall && repository_address.length === 0)
            return;
        if (!IsValidArray(repository_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'repository_address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('repository_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('repository_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(repository_address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('repository_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('repository_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(repository_address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    add_arbitration(arbitraion, arbitraion_token_type, passport) {
        if (!Protocol.IsValidObjects([arbitraion])) {
            ERROR(Errors.IsValidObjects, 'add_arbitration.arbitraion');
        }
        if (!IsValidTokenType(arbitraion_token_type)) {
            ERROR(Errors.IsValidTokenType, 'add_arbitration.arbitraion_token_type');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('arbitration_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arbitraion), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, arbitraion_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('arbitration_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arbitraion), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, arbitraion_token_type]
            });
        }
    }
    remove_arbitration(address, removeall, passport) {
        if (!removeall && address.length === 0)
            return;
        if (!IsValidArray(address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_arbitration.address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('arbitration_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('arbitration_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('arbitration_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('arbitration_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    add_withdraw_guards(guards, passport) {
        if (guards.length === 0)
            return;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard]))
                ERROR(Errors.IsValidObjects, `add_withdraw_guards.guard ${v}`);
            if (!IsValidPercent(v.percent))
                ERROR(Errors.IsValidPercent, `add_withdraw_guards.percent ${v}`);
        });
        guards.forEach((guard) => {
            if (passport) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('withdraw_guard_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard),
                        this.txb.pure.u8(guard.percent), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('withdraw_guard_add'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), this.txb.pure.u8(guard.percent),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        });
    }
    remove_withdraw_guards(guard_address, removeall, passport) {
        if (!removeall && guard_address.length === 0) {
            return;
        }
        if (!IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guard_address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('withdraw_guard_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('withdraw_guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('withdraw_guard_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('withdraw_guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    add_refund_guards(guards, passport) {
        if (guards.length === 0)
            return;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard]))
                ERROR(Errors.IsValidObjects, `add_refund_guards.guard ${v}`);
            if (!IsValidPercent(v.percent))
                ERROR(Errors.IsValidPercent, `add_refund_guards.percent ${v}`);
        });
        guards.forEach((guard) => {
            if (passport) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('refund_guard_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard),
                        this.txb.pure.u8(guard.percent), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('refund_guard_add'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), this.txb.pure.u8(guard.percent),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        });
    }
    remove_refund_guards(guard_address, removeall, passport) {
        if (guard_address.length === 0 && !removeall)
            return;
        if (!IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'guard_address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('refund_guard_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('refund_guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('refund_guard_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('refund_guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    check_valid_sale(sales) {
        const names = [];
        sales.forEach((v) => {
            if (!Service.IsValidItemName(v.item))
                ERROR(Errors.IsValidName, `check_valid_sale.sales.item ${v}`);
            if (!IsValidU64(v.price))
                ERROR(Errors.IsValidU64, `check_valid_sale.sales.price ${v}`);
            if (!IsValidU64(v.stock))
                ERROR(Errors.IsValidU64, `check_valid_sale.sales.stock ${v}`);
            if (names.includes(v.item))
                ERROR(Errors.IsValidName, `check_valid_sale.sales.item repeat ${v}`);
            names.push(v.item);
        });
    }
    add_sales(sales, bExistAssert = false, passport) {
        if (sales.length === 0)
            return;
        this.check_valid_sale(sales);
        let names = [];
        let price = [];
        let stock = [];
        let endpoint = [];
        sales.forEach((s) => {
            if (s.endpoint && !IsValidEndpoint(s.endpoint)) {
                ERROR(Errors.IsValidEndpoint, 'add_sales');
            }
            names.push(s.item);
            price.push(s.price);
            stock.push(s.stock);
            endpoint.push(s.endpoint ?? '');
        });
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('sales_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', names),
                    this.txb.pure.vector('string', endpoint),
                    this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                    this.txb.pure.bool(bExistAssert),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('sales_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', names),
                    this.txb.pure.vector('string', endpoint),
                    this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                    this.txb.pure.bool(bExistAssert),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    remove_sales(sales, passport) {
        if (sales.length === 0)
            return;
        if (!IsValidArray(sales, Service.IsValidItemName)) {
            ERROR(Errors.IsValidArray, 'remove_sales');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('sales_remove_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', array_unique(sales)),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('sales_remove'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', array_unique(sales)),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    discount_transfer(discount_dispatch, passport) {
        if (!discount_dispatch || discount_dispatch.length > Service.MAX_DISCOUNT_RECEIVER_COUNT) {
            ERROR(Errors.InvalidParam, 'discount_dispatch');
        }
        discount_dispatch.forEach((v) => {
            if (!IsValidAddress(v.receiver))
                ERROR(Errors.IsValidAddress, `discount_transfer.discount_dispatch.receiver ${v}`);
            if (!IsValidU64(v.count) || v.count > Service.MAX_DISCOUNT_COUNT_ONCE)
                ERROR(Errors.IsValidU64, `discount_transfer.discount_dispatch.count ${v}`);
            if (!IsValidName_AllowEmpty(v.discount.name))
                ERROR(Errors.IsValidName, `discount_transfer.discount_dispatch.discount.name ${v}`);
            if (v.discount.type == Service_Discount_Type.ratio && !IsValidPercent(v.discount.off))
                ERROR(Errors.IsValidPercent, `discount_transfer.discount_dispatch.discount.off ${v}`);
            if (!IsValidU64(v.discount.duration_minutes))
                ERROR(Errors.IsValidU64, `discount_transfer.discount_dispatch.discount.duration_minutes ${v}`);
            if (v.discount?.time_start && !IsValidU64(v.discount.time_start))
                ERROR(Errors.IsValidU64, `discount_transfer.discount_dispatch.discount.time_start ${v}`);
            if (v.discount?.price_greater && !IsValidU64(v.discount.price_greater))
                ERROR(Errors.IsValidU64, `discount_transfer.discount_dispatch.discount.price_greater ${v}`);
        });
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        discount_dispatch.forEach((discount) => {
            let price_greater = this.txb.pure.option('u64', discount.discount?.price_greater ? discount.discount?.price_greater : undefined);
            let time_start = this.txb.pure.option('u64', discount.discount?.time_start ? discount.discount?.time_start : undefined);
            if (passport) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('dicscount_create_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(discount.discount.name),
                        this.txb.pure.u8(discount.discount.type),
                        this.txb.pure.u64(discount.discount.off), price_greater, time_start,
                        this.txb.pure.u64(discount.discount.duration_minutes), this.txb.pure.u64(discount.count),
                        Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.pure.address(discount.receiver), this.txb.object(clock)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('dicscount_create'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(discount.discount.name),
                        this.txb.pure.u8(discount.discount.type),
                        this.txb.pure.u64(discount.discount.off), price_greater, time_start,
                        this.txb.pure.u64(discount.discount.duration_minutes), this.txb.pure.u64(discount.count),
                        Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.pure.address(discount.receiver),
                        this.txb.object(clock)],
                    typeArguments: [this.pay_token_type]
                });
            }
        });
    }
    // support both withdraw guard and permission guard
    // withdraw_guard & passport must BOTH valid.
    withdraw(order, param, passport) {
        if (!Protocol.IsValidObjects([order, param.treasury, param.withdraw_guard, passport])) {
            ERROR(Errors.IsValidObjects);
        }
        if (param?.for_guard && !Protocol.IsValidObjects([param.for_guard])) {
            ERROR(Errors.IsValidObjects, 'withdraw.param.for_guard');
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_object');
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw.param.index');
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw.param.remark');
        }
        const for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (param.for_guard) {
            return this.txb.moveCall({
                target: Protocol.Instance().serviceFn('withdraw_forGuard_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, param.withdraw_guard),
                    Protocol.TXB_OBJECT(this.txb, param.treasury), for_obj, Protocol.TXB_OBJECT(this.txb, param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            return this.txb.moveCall({
                target: Protocol.Instance().serviceFn('withdraw_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, param.withdraw_guard),
                    Protocol.TXB_OBJECT(this.txb, param.treasury), for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    set_buy_guard(guard, passport) {
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('buy_guard_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('buy_guard_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (guard) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('buy_guard_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('buy_guard_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    set_machine(machine, passport) {
        if (passport) {
            if (machine) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('machine_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('machine_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (machine) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('machine_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('machine_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    set_endpoint(endpoint, passport) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }
        let ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('endpoint_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('endpoint_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    publish(passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('publish_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('publish'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    clone(new_token_type, bLaunch, passport) {
        let ret;
        if (passport) {
            ret = this.txb.moveCall({
                target: Protocol.Instance().serviceFn('clone_withpassport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, new_token_type ? new_token_type : this.pay_token_type]
            });
        }
        else {
            ret = this.txb.moveCall({
                target: Protocol.Instance().serviceFn('clone'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, new_token_type ? new_token_type : this.pay_token_type]
            });
        }
        if (bLaunch) {
            return this.txb.moveCall({
                target: Protocol.Instance().serviceFn('create'),
                arguments: [Protocol.TXB_OBJECT(this.txb, ret)],
                typeArguments: [new_token_type ? new_token_type : this.pay_token_type]
            });
        }
        else {
            return ret;
        }
    }
    set_customer_required(pubkey, customer_required, passport) {
        if (customer_required.length > 0 && !pubkey) {
            ERROR(Errors.InvalidParam, 'set_customer_required');
        }
        if (pubkey.length > Service.MAX_PUBKEY_SIZE) {
            ERROR(Errors.InvalidParam, 'set_customer_required.pubkey');
        }
        if (customer_required.length > Service.MAX_REQUIRES_COUNT) {
            ERROR(Errors.InvalidParam, 'set_customer_required.customer_required');
        }
        if (!IsValidArray(customer_required, IsValidName)) {
            ERROR(Errors.IsValidArray, 'set_customer_required.customer_required');
        }
        let req = array_unique(customer_required);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('required_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('string', req),
                    this.txb.pure.string(pubkey), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('required_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('string', req),
                    this.txb.pure.string(pubkey), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    remove_customer_required(passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('required_none_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('required_none'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    change_required_pubkey(pubkey, passport) {
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('required_pubkey_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(pubkey),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('required_pubkey_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(pubkey),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    /*
        change_order_required_pubkey(order:OrderObject, pubkey:string, passport?:PassportObject) {
            if (!Protocol.IsValidObjects([order])) {
                ERROR(Errors.IsValidObjects, 'order')
            }
            if (!pubkey) {
                ERROR(Errors.InvalidParam, 'pubkey')
            }
            
            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().serviceFn('order_pubkey_update_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.pure.string(pubkey),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().serviceFn('order_pubkey_update') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.pure.string(pubkey),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } */
    pause(pause, passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('pause_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('pause'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    refund_withArb(order, arb, arb_type) {
        if (!Protocol.IsValidObjects([order, arb])) {
            ERROR(Errors.IsValidObjects, 'refund_withArb.order or arb');
        }
        if (!IsValidTokenType(arb_type)) {
            ERROR(Errors.IsValidTokenType, 'refund_withArb.arb_type');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        this.txb.moveCall({
            target: Protocol.Instance().serviceFn('refund_with_arb'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, arb), this.txb.object(clock)],
            typeArguments: [this.pay_token_type, arb_type]
        });
    }
    refund(order, refund_guard, passport) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'refund.order');
        }
        if (refund_guard && !Protocol.IsValidObjects([refund_guard])) {
            ERROR(Errors.IsValidObjects, 'refund.refund_guard');
        }
        if (passport && !refund_guard) {
            ERROR(Errors.InvalidParam, 'refund.passport need refund_guard');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport && refund_guard) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('refund_with_passport'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, refund_guard),
                    passport, this.txb.object(clock)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('refund'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order)],
                typeArguments: [this.pay_token_type]
            });
        }
    }
    update_order_required_info(order, customer_info_crypto) {
        if (!customer_info_crypto.customer_pubkey) {
            return;
        }
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'update_order_required_info.order');
        }
        this.txb.moveCall({
            target: Protocol.Instance().serviceFn('order_required_info_update'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order),
                this.txb.pure.string(customer_info_crypto.customer_pubkey),
                this.txb.pure.string(customer_info_crypto.customer_info_crypt)],
            typeArguments: [this.pay_token_type]
        });
    }
    order(buy_items, coin, discount, machine, customer_info_crypto, passport) {
        if (buy_items.length === 0)
            ERROR(Errors.InvalidParam, 'order.buy_items empty');
        const repeat = [];
        buy_items.forEach((v) => {
            if (!Service.IsValidItemName(v.item))
                ERROR(Errors.InvalidParam, `order.buy_items.item ${v}`);
            if (!IsValidU64(v.max_price))
                ERROR(Errors.IsValidU64, `order.buy_items.max_price ${v}`);
            if (!IsValidU64(v.count))
                ERROR(Errors.IsValidU64, `order.buy_items.count ${v}`);
            if (repeat.includes(v.item))
                ERROR(Errors.InvalidParam, `order.buy_items.item repeat ${v}`);
            repeat.push(v.item);
        });
        const name = [];
        const price = [];
        const stock = [];
        let order;
        buy_items.forEach((b) => { name.push(b.item); price.push(BigInt(b.max_price)); stock.push(BigInt(b.count)); });
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (discount) {
                order = this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('dicount_buy_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                        Protocol.TXB_OBJECT(this.txb, coin), Protocol.TXB_OBJECT(this.txb, discount), this.txb.object(clock)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                order = this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('buy_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                        Protocol.TXB_OBJECT(this.txb, coin)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (discount) {
                order = this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('disoucnt_buy'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price),
                        this.txb.pure.vector('u64', stock),
                        Protocol.TXB_OBJECT(this.txb, coin),
                        Protocol.TXB_OBJECT(this.txb, discount), this.txb.object(clock)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                order = this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('buy'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price),
                        this.txb.pure.vector('u64', stock),
                        Protocol.TXB_OBJECT(this.txb, coin)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        if (customer_info_crypto) {
            this.update_order_required_info(order, customer_info_crypto);
        }
        var progress = undefined;
        if (machine) {
            progress = this.order_bind_machine(order, machine);
        }
        return { order: order, progress: progress };
    }
    order_launch(order) {
        var progress;
        if (order.progress) {
            progress = this.txb.moveCall({
                target: Protocol.Instance().progressFn('create'),
                arguments: [Protocol.TXB_OBJECT(this.txb, order.progress)],
            });
        }
        return { order: this.txb.moveCall({
                target: Protocol.Instance().serviceFn('order_create'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order.order)],
                typeArguments: [this.pay_token_type]
            }), progress: progress };
    }
    buy(buy_items, coin, discount, machine, customer_info_crypto, passport) {
        const r = this.order(buy_items, coin, discount, machine, customer_info_crypto, passport);
        return this.order_launch(r);
    }
    order_bind_machine(order, machine) {
        if (!Protocol.IsValidObjects([order, machine])) {
            ERROR(Errors.IsValidObjects, 'order & machine');
        }
        return this.txb.moveCall({
            target: Protocol.Instance().serviceFn('order_bind_machine'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, machine)],
            typeArguments: [this.pay_token_type]
        });
    }
    add_treasury(treasury, treasury_token_type, passport) {
        if (!Protocol.IsValidObjects([treasury])) {
            ERROR(Errors.IsValidObjects, 'add_treasury.treasury');
        }
        if (!IsValidTokenType(treasury_token_type)) {
            ERROR(Errors.IsValidTokenType, 'add_treasury.treasury_token_type');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('treasury_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, treasury_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().serviceFn('treasury_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, treasury_token_type]
            });
        }
    }
    remove_treasury(treasury, removeall, passport) {
        if (!removeall && treasury.length === 0)
            return;
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('treasury_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('treasury_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('treasury_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().serviceFn('treasury_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: Protocol.Instance().serviceFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.pay_token_type]
        });
        this.permission = new_permission;
    }
    set_order_agent(order, agent, orderProgress) {
        Service.SetOrderAgent(this.txb, this.pay_token_type, order, agent, orderProgress);
    }
    change_order_payer(order, new_addr, orderProgress) {
        Service.ChangeOrderPayer(this.txb, this.pay_token_type, order, new_addr, orderProgress);
    }
    static IsValidItemName(name) {
        if (!name)
            return false;
        return new TextEncoder().encode(name).length <= Service.MAX_ITEM_NAME_LENGTH;
    }
    // return current balance
    static OrderReceive(txb, order_token_type, order, payment, received, token_type) {
        if (!Protocol.IsValidObjects([payment, received])) {
            ERROR(Errors.IsValidArray, 'OrderReceive.payment&received');
        }
        return txb.moveCall({
            target: Protocol.Instance().orderFn('receive'),
            arguments: [Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, received), Protocol.TXB_OBJECT(txb, payment)],
            typeArguments: [order_token_type, token_type],
        });
    }
}
Service.MAX_DISCOUNT_COUNT_ONCE = 200;
Service.MAX_DISCOUNT_RECEIVER_COUNT = 20;
Service.MAX_GUARD_COUNT = 16;
Service.MAX_REPOSITORY_COUNT = 32;
Service.MAX_ITEM_NAME_LENGTH = 256;
Service.MAX_TREASURY_COUNT = 8;
Service.MAX_ORDER_AGENT_COUNT = 8;
Service.MAX_ORDER_ARBS_COUNT = 8;
Service.MAX_ARBITRATION_COUNT = 8;
Service.MAX_REQUIRES_COUNT = 16;
Service.MAX_PUBKEY_SIZE = 3000;
Service.parseObjectType = (chain_type) => {
    return parseObjectType(chain_type, 'service::Service<');
};
Service.parseOrderObjectType = (chain_type) => {
    return parseObjectType(chain_type, 'order::Order<');
};
Service.endpoint = (service_endpoint, item_endpoint, item_name) => {
    if (item_endpoint) {
        return item_endpoint;
    }
    else if (service_endpoint) {
        return service_endpoint + '/sales/' + encodeURI(item_name);
    }
};
Service.DiscountObjects = (owner, handleDiscountObject) => {
    Protocol.Client().getOwnedObjects({ owner: owner,
        filter: { MoveModule: { module: 'order', package: Protocol.Instance().package('wowok') } },
        options: { showContent: true, showType: true } }).then((res) => {
        handleDiscountObject(owner, res.data.map((v) => v.data));
    }).catch((e) => {
        //console.log(e);
    });
};
// The agent has the same order operation power as the order payer; The agent can only be set by the order payer.
Service.SetOrderAgent = (txb, order_token_type, order, agent, order_progress) => {
    if (!IsValidTokenType(order_token_type)) {
        ERROR(Errors.IsValidTokenType, 'SetOrderAgent.order_token_type');
    }
    if (!Protocol.IsValidObjects([order])) {
        ERROR(Errors.IsValidObjects, 'SetOrderAgent.order');
    }
    if (!IsValidArray(agent, IsValidAddress)) {
        ERROR(Errors.IsValidArray, 'SetOrderAgent.agent');
    }
    if (array_unique(agent).length > Service.MAX_ORDER_AGENT_COUNT) {
        ERROR(Errors.Fail, 'SetOrderAgent.agent count');
    }
    txb.moveCall({
        target: Protocol.Instance().orderFn('agent_set'),
        arguments: [Protocol.TXB_OBJECT(txb, order), txb.pure.vector('address', array_unique(agent))],
        typeArguments: [order_token_type]
    });
    if (order_progress) {
        txb.moveCall({
            target: Protocol.Instance().orderFn('order_ops_to_progress'),
            arguments: [Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, order_progress)],
            typeArguments: [order_token_type]
        });
    }
};
Service.ChangeOrderPayer = (txb, order_token_type, order, new_addr, order_progress) => {
    if (!IsValidTokenType(order_token_type)) {
        ERROR(Errors.IsValidTokenType, 'ChangeOrderPayer.order_token_type');
    }
    if (!Protocol.IsValidObjects([order])) {
        ERROR(Errors.IsValidObjects, 'ChangeOrderPayer.order');
    }
    if (!IsValidAddress(new_addr)) {
        ERROR(Errors.IsValidAddress, 'ChangeOrderPayer.new_addr');
    }
    txb.moveCall({
        target: Protocol.Instance().orderFn('payer_change'),
        arguments: [Protocol.TXB_OBJECT(txb, order), txb.pure.address(new_addr)],
        typeArguments: [order_token_type]
    });
    if (order_progress) {
        txb.moveCall({
            target: Protocol.Instance().orderFn('order_ops_to_progress'),
            arguments: [Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, order_progress)],
            typeArguments: [order_token_type]
        });
    }
};
//# sourceMappingURL=service.js.map