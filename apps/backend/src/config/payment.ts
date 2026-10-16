// Dùng hàm (không dùng hằng) để chắc chắn đọc env SAU khi dotenv đã load
export function isMockPaymentEnabled(): boolean {
  if (process.env.ENABLE_MOCK_PAYMENT !== undefined) {
    return process.env.ENABLE_MOCK_PAYMENT === "true";
  }
  return process.env.NODE_ENV !== "production";
}

export function getMockPaymentSecret(): string {
  return process.env.MOCK_PAYMENT_SECRET || "mock-dev-secret";
}
