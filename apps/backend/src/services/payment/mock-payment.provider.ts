import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { IPaymentGateway, PaymentInitiateResult } from './payment-gateway.interface';
import { Order, PaymentMethod } from '../../types/order.types';
import { createPaymentRecord, updatePaymentStatus } from '../../models/payment.model';

export class MockPaymentProvider implements IPaymentGateway {
  name: PaymentMethod = 'mock';

  async initiate(order: Order, userId: number, metadata?: any): Promise<PaymentInitiateResult> {
    const txnId = `MOCK-TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Generate a demo QR code for simulation (resembles VietQR format)
    const mockQrPayload = `2|99|0901234567|LMS Platform||0|0|${order.total_amount}|${order.order_code}|transfer_p2p`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(mockQrPayload, { margin: 1, width: 200 });
    } catch {
      qrDataUrl = '';
    }

    const payment = await createPaymentRecord({
      order_id: order.id,
      user_id: userId,
      amount: order.total_amount,
      payment_method: 'mock',
      transaction_id: txnId,
      status: 'pending',
      metadata: {
        provider: 'Mock Payment Sandbox (Simulation)',
        simulated_qr: qrDataUrl ? true : false,
        ...metadata,
      },
    });

    return {
      paymentId: payment.id,
      paymentMethod: 'mock',
      amount: order.total_amount,
      checkoutUrl: `/checkout/mock-pay/${order.id}`,
      qrCodeData: qrDataUrl,
      extra: {
        transactionId: txnId,
        orderCode: order.order_code,
        simulatedOptions: ['success', 'fail'],
      },
    };
  }

  async process(
    order: Order,
    paymentId: number,
    options?: { shouldSucceed?: boolean; reason?: string }
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    const shouldSucceed = options?.shouldSucceed !== false;
    const txnId = `MOCK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    if (shouldSucceed) {
      await updatePaymentStatus(paymentId, 'completed', txnId, {
        simulated: true,
        note: 'Mock payment approved successfully',
      });
      return {
        success: true,
        transactionId: txnId,
        message: 'Mock payment simulated successfully.',
      };
    } else {
      await updatePaymentStatus(paymentId, 'failed', txnId, {
        simulated: true,
        reason: options?.reason || 'User cancelled mock payment or insufficient simulated funds',
      });
      return {
        success: false,
        transactionId: txnId,
        message: options?.reason || 'Mock payment simulation failed.',
      };
    }
  }
}
