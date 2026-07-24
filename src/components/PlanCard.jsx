import { FaChartLine, FaGift, FaClock } from 'react-icons/fa';

const PlanCard = ({ plan, onSelect }) => {
  return (
    <div className={`bg-gradient-to-br ${plan.bgClass || 'from-slate-800 to-slate-900'} rounded-2xl overflow-hidden border ${plan.borderClass} hover:scale-105 transition-all duration-300`}>
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold ${plan.colorClass} mb-2`}>{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-white">${plan.minAmount.toLocaleString()}</span>
            {plan.maxAmount && <span className="text-slate-400">- ${plan.maxAmount.toLocaleString()}</span>}
          </div>
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <FaChartLine className="text-blue-400" />
              ROI
            </span>
            <span className="text-white font-semibold">{plan.roi}%</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <FaClock className="text-blue-400" />
              Duration
            </span>
            <span className="text-white font-semibold">{plan.duration} days</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <FaGift className="text-blue-400" />
              Welcome Bonus
            </span>
            <span className="text-white font-semibold">{plan.bonus}%</span>
          </li>
        </ul>
        
        <button
          onClick={() => onSelect(plan)}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:opacity-90 transition-all duration-300"
        >
          Invest Now
        </button>
      </div>
    </div>
  );
};

export default PlanCard;