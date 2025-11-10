
export type OrderStatus = "Pendiente" | "En proceso" | "Enviado" | "Entregado" | "Cancelado";

export type Order = {
    id: string;
    businessId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    paymentMethod: string;
    orderDate: string; // ISO 8601 date string
    orderStatus: OrderStatus;
};

    