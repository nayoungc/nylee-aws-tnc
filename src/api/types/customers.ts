export interface Customer {
    customerId: string;       // 파티션 키
    customerName: string;     // GSI1 파티션 키
    createdAt?: string;
    updatedAt?: string;
  }