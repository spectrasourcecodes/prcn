import CountUp from 'react-countup';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  isPositive, 
  bgGradient,
  hideValue = false,
  currencySymbol = '$'
}) => {
  // If hideValue is true, show masked value
  const displayValue = hideValue ? '••••••' : value;

  return (
    <div className={`bg-gradient-to-br ${bgGradient || 'from-slate-800 to-slate-900'} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {hideValue ? (
              <span className="text-2xl font-bold text-white">{displayValue}</span>
            ) : (
              <CountUp 
                end={value} 
                duration={2} 
                separator="," 
                prefix={currencySymbol} 
              />
            )}
          </h3>
          {change && !hideValue && (
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
          <Icon className="text-blue-400 text-xl" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;