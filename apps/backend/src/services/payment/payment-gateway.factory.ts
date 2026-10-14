import { IPaymentGateway } from './payment-gateway.interface';
import { MockPaymentProvider } from './mock-payment.provider';
import { PaymentMethod } from '../../types/order.types';
import AppError from '../../utils/AppError';

export class PaymentGatewayFactory {
  private static gateways: Map<PaymentMethod, IPaymentGateway> = new Map();

  static initialize() {
    const mockProvider = new MockPaymentProvider();
    this.gateways.set('mock', mockProvider);
    // Aliases or fallback providers during testing
    this.gateways.set('vietqr', mockProvider);
    this.gateways.set('sepay', mockProvider);
    this.gateways.set('vnpay', mockProvider);
    this.gateways.set('momo', mockProvider);
  }

  static get(method: PaymentMethod = 'mock'): IPaymentGateway {
    if (this.gateways.size === 0) {
      this.initialize();
    }

    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new AppError(`Payment provider for '${method}' is not supported yet`, 400);
    }

    return gateway;
  }
}
