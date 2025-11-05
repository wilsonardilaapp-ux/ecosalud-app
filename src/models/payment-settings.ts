
export type QRFormData = {
  enabled: boolean;
  qrImageUrl: string | null;
  accountNumber: string;
  holderName: string;
};

export type PaymentSettings = {
  id: string;
  userId: string;
  nequi: QRFormData;
  bancolombia: QRFormData;
  daviplata: QRFormData;
};
