import { Order } from '../types';

interface PaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private commissionRate = 0.03; // 3% platform fee

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private validateCardNumber(number: string): boolean {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private validateExpiryDate(expiry: string): boolean {
    const [month, year] = expiry.split('/').map(num => parseInt(num));
    const now = new Date();
    const cardDate = new Date(2000 + year, month - 1);
    return cardDate > now;
  }

  private validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  async processPayment(
    amount: number,
    paymentDetails: {
      cardNumber: string;
      cardExpiry: string;
      cardCvv: string;
      cardName: string;
    },
    order: Omit<Order, 'id'>
  ): Promise<PaymentResult> {
    try {
      // Basic validation
      if (!this.validateCardNumber(paymentDetails.cardNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid card number');
      }

      if (!this.validateExpiryDate(paymentDetails.cardExpiry)) {
        throw new Error('Card has expired');
      }

      if (!this.validateCVV(paymentDetails.cardCvv)) {
        throw new Error('Invalid CVV');
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate commissions and update artist sales
      const artistSales = {};
      let totalCommission = 0;

      order.items.forEach(item => {
        const itemTotal = item.priceAtTime * item.quantity;
        const commission = itemTotal * this.commissionRate;
        totalCommission += commission;

        if (!artistSales[item.artistId]) {
          artistSales[item.artistId] = {
            revenue: 0,
            grossRevenue: 0,
            commission: 0,
            sales: 0
          };
        }

        artistSales[item.artistId].grossRevenue += itemTotal;
        artistSales[item.artistId].revenue += itemTotal - commission;
        artistSales[item.artistId].commission += commission;
        artistSales[item.artistId].sales += item.quantity;
      });

      // Update artist sales records
      const existingSales = JSON.parse(localStorage.getItem('metal_aloud_artist_sales') || '{}');
      Object.entries(artistSales).forEach(([artistId, data]) => {
        if (!existingSales[artistId]) {
          existingSales[artistId] = {
            revenue: 0,
            grossRevenue: 0,
            commission: 0,
            sales: 0
          };
        }
        existingSales[artistId].revenue += data.revenue;
        existingSales[artistId].grossRevenue += data.grossRevenue;
        existingSales[artistId].commission += data.commission;
        existingSales[artistId].sales += data.sales;
      });
      localStorage.setItem('metal_aloud_artist_sales', JSON.stringify(existingSales));

      // Create transaction record
      const transaction = {
        id: crypto.randomUUID(),
        amount,
        commission: totalCommission,
        artistSales,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Store transaction
      const transactions = JSON.parse(localStorage.getItem('metal_aloud_transactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('metal_aloud_transactions', JSON.stringify(transactions));

      return {
        success: true,
        transactionId: transaction.id
      };
    } catch (err) {
      console.error('Payment processing error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Payment processing failed'
      };
    }
  }
}