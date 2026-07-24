import { FaArrowUp, FaArrowDown, FaCheckCircle, FaClock } from 'react-icons/fa';

const TransactionCard = ({ transaction }) => {
  const getTypeIcon = () => {
    switch(transaction.type) {
      case 'deposit': return <FaArrowDown className="text-green-500" />;
      case 'withdraw': return <FaArrowUp className="text-red-500" />;
      case 'profit': return <FaArrowUp className="text-green-500" />;
      case 'investment': return <FaArrowDown className="text-orange-500" />;
      default: return <FaArrowDown className="text-blue-500" />;
    }
  };

  const getStatusIcon = () => {
    if (transaction.status === 'completed') {
      return <FaCheckCircle className="text-green-500 text-xs" />;
    }
    return <FaClock className="text-yellow-500 text-xs" />;
  };

  const getTypeColor = () => {
    switch(transaction.type) {
      case 'deposit': return 'text-green-500';
      case 'withdraw': return 'text-red-500';
      case 'profit': return 'text-green-500';
      case 'investment': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 hover:bg-slate-750 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            {getTypeIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-white capitalize">{transaction.type}</h4>
            <p className="text-xs text-slate-400">{new Date(transaction.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${getTypeColor()}`}>
            {transaction.type === 'withdraw' ? '-' : '+'}${transaction.amount.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            {getStatusIcon()}
            <span className={`text-xs capitalize ${transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
              {transaction.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;