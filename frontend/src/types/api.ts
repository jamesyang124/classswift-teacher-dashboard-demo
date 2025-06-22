export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface QRCodeData {
  qrCodeBase64: string;
  joinLink: string;
  classId: string;
}

export interface QRCodeResponse extends APIResponse<QRCodeData> {
  data: QRCodeData;
}