import { GuardObject, PassportObject, PermissionObject, RepositoryObject, MachineObject, ServiceAddress, ServiceObject, DiscountObject, OrderObject, OrderAddress, CoinObject, TxbObject, TreasuryObject, PaymentAddress, ArbObject, ArbitrationObject, ProgressObject, ProgressAddress } from './protocol';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { SuiObjectData } from '@mysten/sui/client';
export type Service_Guard_Percent = {
    guard: GuardObject;
    percent: number;
};
export type Service_Sale = {
    item: string;
    price: string | number | bigint;
    stock: string | number | bigint;
    endpoint?: string | null;
};
export declare enum Service_Discount_Type {
    ratio = 0,// -off%
    minus = 1
}
export type Service_Discount = {
    name: string;
    type: Service_Discount_Type;
    off: number;
    duration_minutes: number;
    time_start?: number;
    price_greater?: bigint;
};
export type Service_Buy_RequiredInfo = {
    pubkey: string;
    customer_info: string[];
};
export type Customer_RequiredInfo = {
    customer_pubkey: string;
    customer_info_crypt: string;
};
export declare enum BuyRequiredEnum {
    address = "address",
    phone = "phone",
    name = "name",
    postcode = "postcode"
}
export type Service_Buy = {
    item: string;
    max_price: string | number | bigint;
    count: string | number | bigint;
};
export type DicountDispatch = {
    receiver: string;
    count: number;
    discount: Service_Discount;
};
export interface WithdrawPayee {
    withdraw_guard: GuardObject;
    treasury: TreasuryObject;
    index: bigint | number | string;
    remark: string;
    for_object?: string;
    for_guard?: GuardObject;
}
export interface BuyResult {
    order: OrderAddress;
    progress?: ProgressAddress;
}
export interface OrderResult {
    order: OrderObject;
    progress?: ProgressObject;
}
export type handleDiscountObject = (owner: string, objects: (SuiObjectData | null | undefined)[]) => void;
export declare class Service {
    protected pay_token_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_pay_type(): string;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, token_type: string, permission: PermissionObject, object: TxbObject): Service;
    static New(txb: TransactionBlock, token_type: string, permission: PermissionObject, description: string, payee_treasury: TreasuryObject, passport?: PassportObject): Service;
    launch(): ServiceAddress;
    set_description(description: string, passport?: PassportObject): void;
    set_price(item: string, price: bigint, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    set_stock(item: string, stock: bigint, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    add_stock(item: string, stock_add: bigint, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    reduce_stock(item: string, stock_reduce: bigint, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    set_sale_endpoint(item: string, endpoint?: string | null, bNotFoundAssert?: boolean, passport?: PassportObject): void;
    set_payee(payee: TreasuryObject, passport?: PassportObject): void;
    add_repository(repository: RepositoryObject, passport?: PassportObject): void;
    remove_repository(repository_address: string[], removeall?: boolean, passport?: PassportObject): void;
    add_arbitration(arbitraion: ArbitrationObject, arbitraion_token_type: string, passport?: PassportObject): void;
    remove_arbitration(address: string[], removeall?: boolean, passport?: PassportObject): void;
    add_withdraw_guards(guards: Service_Guard_Percent[], passport?: PassportObject): void;
    remove_withdraw_guards(guard_address: string[], removeall?: boolean, passport?: PassportObject): void;
    add_refund_guards(guards: Service_Guard_Percent[], passport?: PassportObject): void;
    remove_refund_guards(guard_address: string[], removeall?: boolean, passport?: PassportObject): void;
    is_valid_sale(sales: Service_Sale[]): boolean;
    add_sales(sales: Service_Sale[], bExistAssert?: boolean, passport?: PassportObject): void;
    remove_sales(sales: string[], passport?: PassportObject): void;
    discount_transfer(discount_dispatch: DicountDispatch[], passport?: PassportObject): void;
    withdraw(order: OrderObject, param: WithdrawPayee, passport: PassportObject): PaymentAddress;
    set_buy_guard(guard?: GuardObject, passport?: PassportObject): void;
    set_machine(machine?: MachineObject, passport?: PassportObject): void;
    set_endpoint(endpoint?: string, passport?: PassportObject): void;
    publish(passport?: PassportObject): void;
    clone(new_token_type?: string, bLaunch?: boolean, passport?: PassportObject): ServiceObject | ServiceAddress;
    set_customer_required(pubkey: string, customer_required: (BuyRequiredEnum | string)[], passport?: PassportObject): void;
    remove_customer_required(passport?: PassportObject): void;
    change_required_pubkey(pubkey: string, passport?: PassportObject): void;
    pause(pause: boolean, passport?: PassportObject): void;
    refund_withArb(order: OrderObject, arb: ArbObject, arb_type: string): void;
    refund(order: OrderObject, refund_guard?: GuardObject, passport?: PassportObject): void;
    update_order_required_info(order: OrderObject, customer_info_crypto: Customer_RequiredInfo): void;
    order(buy_items: Service_Buy[], coin: CoinObject, discount?: DiscountObject, machine?: MachineObject, customer_info_crypto?: Customer_RequiredInfo, passport?: PassportObject): OrderResult;
    order_launch(order: OrderResult): BuyResult;
    buy(buy_items: Service_Buy[], coin: CoinObject, discount?: DiscountObject, machine?: MachineObject, customer_info_crypto?: Customer_RequiredInfo, passport?: PassportObject): BuyResult;
    order_bind_machine(order: OrderObject, machine: MachineObject): ProgressObject;
    add_treasury(treasury_token_type: string, treasury: TreasuryObject, passport?: PassportObject): void;
    remove_treasury(treasury: string[], removeall?: boolean, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    set_order_agent(order: OrderObject, agent: string[], orderProgress?: ProgressObject): void;
    change_order_payer(order: OrderObject, new_addr: string, orderProgress?: ProgressObject): void;
    static MAX_DISCOUNT_COUNT_ONCE: number;
    static MAX_DISCOUNT_RECEIVER_COUNT: number;
    static MAX_GUARD_COUNT: number;
    static MAX_REPOSITORY_COUNT: number;
    static MAX_ITEM_NAME_LENGTH: number;
    static MAX_TREASURY_COUNT: number;
    static MAX_ORDER_AGENT_COUNT: number;
    static MAX_ORDER_ARBS_COUNT: number;
    static MAX_ARBITRATION_COUNT: number;
    static MAX_REQUIRES_COUNT: number;
    static MAX_PUBKEY_SIZE: number;
    static IsValidItemName(name: string): boolean;
    static parseObjectType: (chain_type: string | undefined | null) => string;
    static parseOrderObjectType: (chain_type: string | undefined | null) => string;
    static endpoint: (service_endpoint: string, item_endpoint: string, item_name: string) => string | undefined;
    static DiscountObjects: (owner: string, handleDiscountObject: handleDiscountObject) => void;
    static SetOrderAgent: (txb: TransactionBlock, order_token_type: string, order: OrderObject, agent: string[], order_progress?: ProgressObject) => void;
    static ChangeOrderPayer: (txb: TransactionBlock, order_token_type: string, order: OrderObject, new_addr: string, order_progress?: ProgressObject) => void;
}
//# sourceMappingURL=service.d.ts.map