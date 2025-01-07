import React, { useState } from 'react';
import { Check, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  type: 'artist' | 'user';
}

export function PremiumPlans() {
  const { user } = useAuth();
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: '1',
      name: 'Artist Pro',
      price: selectedInterval === 'monthly' ? 9.99 : 99.99,
      interval: selectedInterval,
      type: 'artist',
      features: [
        'Unlimited song uploads',
        'Advanced analytics',
        'Custom artist profile',
        'Priority support',
        'Ad-free experience',
        'Merch store',
        selectedInterval === 'yearly' ? '2 months free' : ''
      ].filter(Boolean)
    },
    {
      id: '2',
      name: 'Premium User',
      price: selectedInterval === 'monthly' ? 4.99 : 49.99,
      interval: selectedInterval,
      type: 'user',
      features: [
        'Ad-free listening',
        'Offline mode',
        'High-quality audio',
        'Exclusive content access',
        selectedInterval === 'yearly' ? '2 months free' : ''
      ].filter(Boolean)
    }
  ];

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoading(true);
      // Initialize payment
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          interval: selectedInterval,
          userId: user?.id
        }),
      });

      const data = await response.json();

      // Handle different payment methods
      if (data.paymentMethods.includes('razorpay')) {
        // Initialize Razorpay
        const options = {
          key: 'your_razorpay_key',
          amount: plan.price * 100, // Amount in smallest currency unit
          currency: 'INR',
          name: 'Metal Aloud',
          description: `${plan.name} Subscription`,
          order_id: data.orderId,
          handler: function(response: any) {
            // Handle successful payment
            console.log(response);
          },
          prefill: {
            email: user?.email
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else if (data.paymentMethods.includes('gpay')) {
        // Initialize Google Pay
        // Implementation will be added
      } else {
        // Fallback to card payment
        // Implementation will be added
      }
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-red-500 mb-8">
        Upgrade Your Metal Experience
      </h2>

      <div className="flex justify-center mb-8">
        <div className="bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedInterval('monthly')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedInterval === 'monthly'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedInterval('yearly')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedInterval === 'yearly'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20"
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline mb-6">
              <DollarSign className="w-6 h-6 text-red-400" />
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-400 ml-2">/{plan.interval}</span>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-red-400 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>

            <div className="mt-4 text-center text-sm text-gray-400">
              Secure payment via Razorpay
            </div>

            <div className="mt-4 flex justify-center space-x-4">
              <img src="/gpay.png" alt="Google Pay" className="h-8" />
              <img src="/razorpay.png" alt="Razorpay" className="h-8" />
              <img src="/cards.png" alt="Credit/Debit Cards" className="h-8" />
              <img src="/upi.png" alt="UPI" className="h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}