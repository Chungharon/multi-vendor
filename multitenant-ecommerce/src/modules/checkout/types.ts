import type Stripe from "stripe";

export type ProductMetadata = {
    id: string;
    name: string;
    price: number;
    stripeAccountId: string;
}

export type CheckouMetadata = {
    userId: string;
};

export type ExpendedLineItem = Stripe.LineItem & {
    price: Stripe.Price & {
        product: Stripe.Product & {
            metadata: ProductMetadata;
        }
    }
}