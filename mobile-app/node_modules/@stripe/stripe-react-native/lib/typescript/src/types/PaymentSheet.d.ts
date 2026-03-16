import type { BillingDetails } from './Common';
export declare type SetupParams = ClientSecretParams & GooglePayParams & ApplePayParams & {
    customerId?: string;
    customerEphemeralKeySecret?: string;
    customFlow?: boolean;
    merchantDisplayName?: string;
    style?: 'alwaysLight' | 'alwaysDark' | 'automatic';
    returnURL?: string;
    primaryButtonColor?: string;
    defaultBillingDetails?: BillingDetails;
    allowsDelayedPaymentMethods?: boolean;
};
declare type ClientSecretParams = {
    paymentIntentClientSecret: string;
    setupIntentClientSecret?: undefined;
} | {
    setupIntentClientSecret: string;
    paymentIntentClientSecret?: undefined;
};
declare type ApplePayParams = {
    applePay?: true;
    merchantCountryCode: string;
} | {
    applePay?: false;
    merchantCountryCode?: string;
};
declare type GooglePayParams = {
    googlePay?: true;
    merchantCountryCode: string;
    currencyCode?: string;
    testEnv?: boolean;
} | {
    googlePay?: false;
    merchantCountryCode?: string;
    currencyCode?: string;
    testEnv?: boolean;
};
export interface PaymentOption {
    label: string;
    image: string;
}
export {};
