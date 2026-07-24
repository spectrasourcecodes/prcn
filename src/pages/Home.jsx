import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, FaChartLine, FaBolt, FaEye, FaTag, FaHeadset, 
  FaPercent, FaCoins, FaMicrochip, FaRocket 
} from 'react-icons/fa';
import GoogleTranslate from '../components/GoogleTranslate';
import { SITE_NAME, ADMIN_EMAIL, ADMIN_WHATSAPP, ADMIN_TELEGRAM, mockInvestmentPlans, mockForexPairs } from '../data/mockData';
import LoadingScreen from '../components/LoadingScreen';
import AnimatedCounter from '../components/AnimatedCounter';

const Preloader = () => <LoadingScreen />;

const Header = () => (
  <div className="bg-slate-800 py-2">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <i className="fas fa-envelope text-blue-400 mr-2"></i>
            <a href={`mailto:${ADMIN_EMAIL}`} className="text-slate-300 hover:text-white transition">
              {ADMIN_EMAIL}
            </a>
          </div>
          <div className="flex items-center">
            <i className="fab fa-telegram text-blue-400 mr-2"></i>
            <span className="text-slate-300">24/7 Support</span>
          </div>
        </div>
        <GoogleTranslate />
      </div>
    </div>
  </div>
);

const NavbarHome = () => (
  <nav className="bg-slate-900/95 backdrop-blur-sm py-4 sticky top-0 z-50 shadow-lg">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold gradient-text">{SITE_NAME}</h1>
        </Link>

        <div className="hidden lg:flex items-center space-x-8">
          <a href="#about" className="text-slate-300 hover:text-white transition">About</a>
          <a href="#plans" className="text-slate-300 hover:text-white transition">Plans</a>
          <a href="#services" className="text-slate-300 hover:text-white transition">Services</a>
          <Link to="/market" className="text-slate-300 hover:text-white transition">Market</Link>
          <Link to="/payouts" className="text-slate-300 hover:text-white transition">Live Payouts</Link>
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition">
            Dashboard
          </Link>
          <Link to="/register" className="px-6 py-2 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition">
            Open Account
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <div className="relative pt-20 pb-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 opacity-90"></div>
    <div className="absolute top-0 right-0 w-full h-full opacity-10">
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-10 left-40 w-72 h-72 bg-cyan-500 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col lg:flex-row items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 mb-12 lg:mb-0"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Trade Forex & Crypto with <span className="gradient-text">Professional Excellence</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl">
            Join 25,000+ traders who trust us with their investments. Experience premium trading conditions, instant withdrawals, and 24/7 dedicated support.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-8 py-4 rounded-lg gradient-bg text-white font-bold text-lg hover:opacity-90 transition transform hover:scale-105">
              Get Started
            </Link>
            <Link to="/plans" className="px-8 py-4 rounded-lg bg-slate-700 text-white font-bold text-lg hover:bg-slate-600 transition transform hover:scale-105">
              View Plans
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 flex justify-center"
        >
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl p-1 backdrop-blur-sm glow-effect">
              <div className="bg-slate-800/80 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Live Market Data</h3>
                    <p className="text-slate-400">Real-time updates</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {mockForexPairs.slice(0, 4).map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700 rounded-lg p-3"
                    >
                      <div className="text-slate-400 text-sm">{item.pair}</div>
                      <div className="text-white font-bold">{item.price}</div>
                      <div className={`${item.change >= 0 ? 'text-green-500' : 'text-red-500'} text-xs`}>
                        {item.change >= 0 ? '+' : ''}{item.change}%
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-4 h-32 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      <AnimatedCounter end={42.7} suffix="%" />
                    </div>
                    <div className="text-slate-400">Average Portfolio Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

const TradingWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
        { "proName": "FOREXCOM:NSXUSD", "title": "Nasdaq 100" },
        { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
        { "proName": "BITSTAMP:BTCUSD", "title": "BTC/USD" },
        { "proName": "BITSTAMP:ETHUSD", "title": "ETH/USD" }
      ],
      "colorTheme": "dark",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "en"
    });
    document.getElementById('tradingview-widget')?.appendChild(script);
  }, []);

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-10">
      <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div id="tradingview-widget"></div>
      </div>
    </div>
  );
};

const Stats = () => {
  const stats = [
    { value: 3412, label: "Active Trades", suffix: "+" },
    { value: 8725, label: "Online Members", suffix: "+" },
    { value: 12545, label: "Registered Members", suffix: "+" },
    { value: 554285, label: "Total Payouts", prefix: "$" }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">
                <AnimatedCounter end={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
              </div>
              <div className="text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: "Best Security",
      description: "Bank-level security with 2FA, cold storage, and DDoS protection",
      points: ["Bank-level security", "2FA authentication", "Cold storage wallets"]
    },
    {
      icon: FaChartLine,
      title: "Range of APIs",
      description: "Advanced charting tools with custom indicators and real-time data",
      points: ["Real-time market data", "Advanced charting tools", "Custom indicators"]
    },
    {
      icon: FaBolt,
      title: "Instant Effect",
      description: "Real-time operations with instant deposits and fast withdrawals",
      points: ["Instant deposits", "Fast withdrawals", "Real-time execution"]
    }
  ];

  return (
    <section className="py-20" id="about">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-blue-400 font-bold uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Professional Trading Platform</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Trade on the largest selection of assets in the industry. From forex pairs and commodities to crypto and indices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800 rounded-2xl p-8 card-gradient card-hover"
            >
              <div className="feature-icon">
                <feature.icon className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-400 mb-4">{feature.description}</p>
              <ul className="space-y-2 text-slate-400">
                {feature.points.map((point, idx) => (
                  <li key={idx} className="flex items-center">
                    <i className="fas fa-check-circle text-blue-500 mr-2"></i>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const InvestmentPlans = () => (
  <section className="py-20 bg-slate-900" id="plans">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <span className="text-blue-400 font-bold uppercase tracking-wider">Investment Plans</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Grow Your Wealth With Us</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your investment goals and start earning today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {mockInvestmentPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`bg-gradient-to-br ${plan.bgClass} from-slate-800 to-slate-900 rounded-2xl overflow-hidden border ${plan.borderClass} hover:scale-105 transition-all duration-300`}
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold ${plan.colorClass} mb-2`}>{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-1">${plan.minAmount.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">Min. Investment</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white font-semibold">{plan.duration} days</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">ROI</span>
                  <span className="text-white font-semibold">{plan.roi}%</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Bonus</span>
                  <span className="text-white font-semibold">{plan.bonus}%</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full py-3 px-4 text-center rounded-lg gradient-bg text-white font-bold hover:opacity-90 transition">
                Invest Now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Services = () => {
  const services = [
    { icon: FaChartLine, title: "200x Leverage Trading", description: "Ultra fast execution with tight spreads" },
    { icon: FaEye, title: "Fully Transparent", description: "Real-time detailed data monitoring" },
    { icon: FaTag, title: "Low Fees", description: "Minimal transaction fees" },
    { icon: FaShieldAlt, title: "Security & Stability", description: "Latest security measures" },
    { icon: FaHeadset, title: "24/7 Support", description: "Multi-channel customer support" },
    { icon: FaPercent, title: "Competitive Commissions", description: "Special conditions for high-volume traders" },
    { icon: FaCoins, title: "Crypto & Forex", description: "Trade major cryptocurrencies and forex pairs" },
    { icon: FaMicrochip, title: "Advanced Technology", description: "Solid technological base with unique features" }
  ];

  return (
    <section className="py-20 bg-slate-900" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-blue-400 font-bold uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Comprehensive Trading Solutions</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Experience the benefits of trading with industry experts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800 rounded-2xl p-6 card-gradient card-hover"
            >
              <service.icon className="text-3xl text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-slate-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-3xl p-10 md:p-16 text-center backdrop-blur-sm"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Trading?</h2>
        <p className="text-slate-300 max-w-2xl mx-auto mb-8">
          Join thousands of investors who trust {SITE_NAME} with their investments. Sign up today and start earning in minutes.
        </p>
        <Link to="/register" className="inline-block px-8 py-4 rounded-lg gradient-bg text-white font-bold text-lg hover:opacity-90 transition transform hover:scale-105">
          Create Account Now
        </Link>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h2 className="text-xl font-bold gradient-text mb-4">{SITE_NAME}</h2>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            A globally recognized, innovative, and top-tier investment company operating in financial markets with professional traders to ensure secure trading experiences.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-slate-400 hover:text-blue-500 transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="text-slate-400 hover:text-blue-500 transition">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-6">Contact</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <i className="fas fa-phone mt-1 text-blue-500 mr-3"></i>
              <span className="text-slate-400">+{ADMIN_WHATSAPP}</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-envelope mt-1 text-blue-500 mr-3"></i>
              <span className="text-slate-400">{ADMIN_EMAIL}</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-map-marker-alt mt-1 text-blue-500 mr-3"></i>
              <span className="text-slate-400">United Kingdom</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link to="/dashboard" className="text-slate-400 hover:text-blue-500 transition">Dashboard</Link></li>
            <li><Link to="/deposit" className="text-slate-400 hover:text-blue-500 transition">Deposit</Link></li>
            <li><Link to="/withdraw" className="text-slate-400 hover:text-blue-500 transition">Withdraw</Link></li>
            <li><Link to="/plans" className="text-slate-400 hover:text-blue-500 transition">Investment Plans</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-6">Support</h3>
          <ul className="space-y-3">
            <li><Link to="/support" className="text-slate-400 hover:text-blue-500 transition">Contact Support</Link></li>
            <li><Link to="/faq" className="text-slate-400 hover:text-blue-500 transition">FAQ</Link></li>
            <li><Link to="/terms" className="text-slate-400 hover:text-blue-500 transition">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="text-slate-400 hover:text-blue-500 transition">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">
          © 2024 {SITE_NAME}. All Rights Reserved
        </p>
      </div>
    </div>
  </footer>
);

function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Preloader />;

  return (
    <div className="min-h-screen">
      <Header />
      <NavbarHome />
      <Hero />
      <TradingWidget />
      <Stats />
      <Features />
      <InvestmentPlans />
      <Services />
      <CTA />
      <Footer />
    </div>
  );
}

export default Home;