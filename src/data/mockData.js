export const SITE_NAME = "Procoin";
export const ADMIN_EMAIL = "support@procoin.com";
export const ADMIN_WHATSAPP = "+856484639";
export const ADMIN_TELEGRAM = "https://t.me/cryptoinvestpro";

export const mockUser = {
  id: "USR8781",
  name: "Marius Vinkeliss",
  email: "m.vinkelis@inbox.it",
  phone: "+37067770201",
  country: "Lithuania",
  currency: "USD",
  avatar: "https://www.magnific.com/free-photos-vectors/user-profile",
  memberSince: "2026-04-26",
  verified: true,
  twoFactorEnabled: true
};

export const mockWallet = {
  totalBalance: 57840.31,
  availableBalance: 57840.31,
  totalProfit: 5480.75,
  totalDeposits: 898585.78,
  totalWithdrawals: 10.00,
  pendingWithdrawals: 2500.00,
  walletAddress: 'cersghirohginfrogdiosgfoidbfndsfhp'
};

export const mockCryptoAssets = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.254, value: 15240.50, change: 2.4, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", balance: 3.2, value: 5120.80, change: -1.2, icon: "Ξ" },
  { symbol: "BNB", name: "Binance Coin", balance: 12.5, value: 3750.00, change: 5.1, icon: "B" },
  { symbol: "SOL", name: "Solana", balance: 45.0, value: 2250.00, change: 8.3, icon: "S" },
  { symbol: "XRP", name: "Ripple", balance: 1500, value: 900.00, change: -0.5, icon: "X" },
  { symbol: "ADA", name: "Cardano", balance: 2500, value: 750.00, change: 1.2, icon: "A" }
];

export const mockForexPairs = [
  { pair: "EUR/USD", price: 1.0854, change: 0.12, spread: 0.0001 },
  { pair: "GBP/USD", price: 1.2642, change: -0.08, spread: 0.0001 },
  { pair: "USD/JPY", price: 148.32, change: 0.25, spread: 0.01 },
  { pair: "USD/CAD", price: 1.3580, change: 0.05, spread: 0.0001 },
  { pair: "AUD/USD", price: 0.6580, change: 0.18, spread: 0.0001 },
  { pair: "NZD/USD", price: 0.6120, change: -0.03, spread: 0.0001 }
];

export const mockInvestmentPlans = [
  {
    id: 1,
    name: "Starter",
    minAmount: 300,
    maxAmount: 1000,
    roi: 12,
    duration: 30,
    bonus: 5,
    bgClass: "from-amber-700/20",
    borderClass: "border-amber-500/30",
    colorClass: "text-amber-400"
  },
  {
    id: 2,
    name: "Bronze",
    minAmount: 1000,
    maxAmount: 5000,
    roi: 18,
    duration: 45,
    bonus: 8,
    bgClass: "from-orange-700/20",
    borderClass: "border-orange-500/30",
    colorClass: "text-orange-400"
  },
  {
    id: 3,
    name: "Silver",
    minAmount: 5000,
    maxAmount: 15000,
    roi: 24,
    duration: 60,
    bonus: 12,
    bgClass: "from-slate-700/20",
    borderClass: "border-slate-500/30",
    colorClass: "text-slate-300"
  },
  {
    id: 4,
    name: "Gold",
    minAmount: 15000,
    maxAmount: 50000,
    roi: 32,
    duration: 90,
    bonus: 15,
    bgClass: "from-yellow-700/20",
    borderClass: "border-yellow-500/30",
    colorClass: "text-yellow-400"
  },
  {
    id: 5,
    name: "Platinum",
    minAmount: 50000,
    maxAmount: 150000,
    roi: 40,
    duration: 120,
    bonus: 20,
    bgClass: "from-cyan-700/20",
    borderClass: "border-cyan-500/30",
    colorClass: "text-cyan-400"
  },
  {
    id: 6,
    name: "Diamond",
    minAmount: 150000,
    maxAmount: null,
    roi: 50,
    duration: 180,
    bonus: 25,
    bgClass: "from-purple-700/20",
    borderClass: "border-purple-500/30",
    colorClass: "text-purple-400"
  }
];

export const mockTransactions = [
  // { id: "TX001", type: "deposit", amount: 5000, currency: "USD", status: "completed", date: "2024-01-15T10:30:00", method: "Bank Transfer" },
  // { id: "TX002", type: "investment", amount: 3000, currency: "USD", status: "completed", date: "2024-01-16T14:20:00", plan: "Silver Plan" },
  // { id: "TX003", type: "profit", amount: 540, currency: "USD", status: "completed", date: "2024-01-20T09:15:00", plan: "Silver Plan" },
  // { id: "TX004", type: "withdraw", amount: 2000, currency: "USD", status: "pending", date: "2024-01-22T16:45:00", method: "USDT (TRC20)" },
  // { id: "TX005", type: "deposit", amount: 2500, currency: "USD", status: "completed", date: "2024-01-10T11:00:00", method: "Credit Card" },
  // { id: "TX006", type: "investment", amount: 5000, currency: "USD", status: "completed", date: "2024-01-12T13:30:00", plan: "Gold Plan" },
  // { id: "TX007", type: "profit", amount: 1600, currency: "USD", status: "completed", date: "2024-01-18T10:00:00", plan: "Gold Plan" },
  // { id: "TX008", type: "referral", amount: 250, currency: "USD", status: "completed", date: "2024-01-19T08:30:00", from: "Sarah Johnson" }
];

export const mockActiveInvestments = [
  // { id: "INV001", plan: "Silver Plan", amount: 3000, startDate: "2024-01-16", endDate: "2024-03-16", profit: 540, status: "active", roi: 18 },
  // { id: "INV002", plan: "Gold Plan", amount: 5000, startDate: "2024-01-12", endDate: "2024-04-12", profit: 1600, status: "active", roi: 32 }
];

export const mockReferrals = [
  // { id: "REF001", name: "Mike Peterson", email: "mike@example.com", date: "2024-01-10", investment: 2000, commission: 100 },
  // { id: "REF002", name: "Sarah Johnson", email: "sarah@example.com", date: "2024-01-12", investment: 5000, commission: 250 },
  // { id: "REF003", name: "David Wilson", email: "david@example.com", date: "2024-01-15", investment: 1500, commission: 75 },
  // { id: "REF004", name: "Emily Brown", email: "emily@example.com", date: "2024-01-18", investment: 3500, commission: 175 }
];

export const mockNotifications = [
  // { id: 1, title: "Investment Profit Credited", message: "You've received $540 profit from your Silver Plan", time: "2 hours ago", read: false, type: "profit" },
  // { id: 2, title: "Deposit Confirmed", message: "Your deposit of $5,000 has been confirmed", time: "1 day ago", read: false, type: "deposit" },
  // { id: 3, title: "Welcome Bonus", message: "Congratulations! You've received a $50 welcome bonus", time: "2 days ago", read: true, type: "bonus" },
  // { id: 4, title: "Security Alert", message: "New login detected from Chrome browser", time: "3 days ago", read: true, type: "security" }
];

export const mockLivePayouts = [
  // { id: 1, user: "User***123", amount: 1250, plan: "Gold Plan", time: "Just now" },
  // { id: 2, user: "Trader***456", amount: 850, plan: "Silver Plan", time: "2 minutes ago" },
  // { id: 3, user: "Crypto***789", amount: 3200, plan: "Platinum Plan", time: "5 minutes ago" },
  // { id: 4, user: "Invest***234", amount: 500, plan: "Bronze Plan", time: "8 minutes ago" },
  // { id: 5, user: "Wealth***567", amount: 2100, plan: "Diamond Plan", time: "12 minutes ago" }
];

export const mockSupportTickets = [
  // { id: "TKT001", subject: "Withdrawal delay", status: "open", date: "2024-01-20", message: "My withdrawal is taking longer than expected" },
  // { id: "TKT002", subject: "Investment plan question", status: "resolved", date: "2024-01-15", message: "Can I upgrade my plan?" }
];

export const mockMarketData = {
  totalVolume: "2.4B",
  activeUsers: "25,847",
  totalInvested: "125.5M",
  totalPaid: "98.2M"
};

export const depositMethods = [
  { id: "usdt", name: "USDT (TRC20)", min: 50, max: 100000, fee: 0, processingTime: "5-30 minutes" },
  { id: "btc", name: "Bitcoin (BTC)", min: 100, max: 100000, fee: 0, processingTime: "30-60 minutes" },
  { id: "eth", name: "Ethereum (ETH)", min: 50, max: 100000, fee: 0, processingTime: "30-60 minutes" },
  { id: "bank", name: "Bank Transfer", min: 500, max: 50000, fee: 0, processingTime: "1-3 business days" }
];

export const withdrawalMethods = [
  { id: "usdt", name: "USDT (TRC20)", min: 50, max: 50000, fee: 1, processingTime: "24-48 hours" },
  { id: "btc", name: "Bitcoin (BTC)", min: 100, max: 50000, fee: 0.0005, processingTime: "24-48 hours" },
  { id: "eth", name: "Ethereum (ETH)", min: 50, max: 50000, fee: 0.005, processingTime: "24-48 hours" }
];