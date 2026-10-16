import { IPaymentGateway } from "./payment-gateway.interface";
import { MockPaymentProvider } from "./mock-payment.provider";
import { PaymentMethod } from "../../types/order.types";
import { isMockPaymentEnabled } from "../../config/payment";
import AppError from "../../utils/AppError";

export class PaymentGatewayFactory {
  private static gateways: Map<PaymentMethod, IPaymentGateway> = new Map();

  static initialize() {
    this.gateways.set("mock", new MockPaymentProvider());
    // Sau này làm cổng thật thì thêm vào đây, ví dụ:
    // this.gateways.set('sepay', new SepayProvider());
  }

  static get(method: PaymentMethod = "mock"): IPaymentGateway {
    if (this.gateways.size === 0) {
      this.initialize();
    }

    if (method === "mock" && !isMockPaymentEnabled()) {
      throw new AppError("Mock payment is disabled in this environment", 403);
    }

    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new AppError(
        `Payment provider for '${method}' is not supported yet`,
        400,
      );
    }

    return gateway;
  }
}
