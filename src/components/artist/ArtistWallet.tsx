import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WalletService } from '../../services/walletService';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';

interface WithdrawalFormData {
  amount: number;
  accountNumber: string;
  bankName: string;
  swiftCode: string;
  accountHolderName: string;
  country: string;
}

export function ArtistWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalFormData>({
    amount: 0,
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    accountHolderName: '',
    country: ''
  });

  const walletService = WalletService.getInstance();

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [currentBalance, txHistory] = await Promise.all([
        walletService.getWalletBalance(user!.id),
        walletService.getTransactions(user!.id)
      ]);
      setBalance(currentBalance);
      setTransactions(txHistory);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await walletService.requestWithdrawal(
        user!.id,
        withdrawalData.amount,
        {
          accountNumber: withdrawalData.accountNumber,
          bankName: withdrawalData.bankName,
          swiftCode: withdrawalData.swiftCode,
          accountHolderName: withdrawalData.accountHolderName,
          country: withdrawalData.country
        }
      );
      await loadWalletData();
      setShowWithdrawalForm(false);
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Withdrawal request submitted successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-500">Artist Wallet</h2>
          <button
            onClick={() => setShowWithdrawalForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Withdraw Funds
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-red-400" />
              <span className="text-sm text-red-400">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownLeft className="w-8 h-8 text-green-400" />
              <span className="text-sm text-green-400">Total Earnings</span>
            </div>
            <p className="text-3xl font-bold">
              ${transactions
                .filter(tx => tx.type === 'sale')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toFixed(2)}
            </p>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpRight className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-blue-400">Total Withdrawals</span>
            </div>
            <p className="text-3xl font-bold">
              ${transactions
                .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      {showWithdrawalForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
            <h3 className="text-xl font-bold text-red-500 mb-6">Withdraw Funds</h3>
            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={balance}
                  value={withdrawalData.amount}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={withdrawalData.accountHolderName}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, accountHolderName: e.target.value })}
                  className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <input
                  type="text"
                  value={withdrawalData.bankName}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, bankName: e.target.value })}
                  className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={withdrawalData.accountNumber}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, accountNumber: e.target.value })}
                  className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SWIFT/BIC Code</label>
                <input
                  type="text"
                  value={withdrawalData.swiftCode}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, swiftCode: e.target.value })}
                  className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={withdrawalData.country}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, country: e.target.value })}
                  className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || withdrawalData.amount <= 0 || withdrawalData.amount > balance}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <h3 className="text-xl font-bold text-red-500 mb-6">Transaction History</h3>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
            >
              <div className="flex items-center space-x-4">
                {tx.type === 'sale' ? (
                  <ArrowDownLeft className="w-8 h-8 text-green-400" />
                ) : (
                  <ArrowUpRight className="w-8 h-8 text-blue-400" />
                )}
                <div>
                  <p className="font-medium">
                    {tx.type === 'sale' ? 'Sale' : 'Withdrawal'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  tx.type === 'sale' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {tx.type === 'sale' ? '+' : '-'}${tx.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">{tx.status}</p>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="text-center text-gray-400 py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}