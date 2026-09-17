import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTools, FaWhatsapp, FaTelegram, FaEnvelope, FaSyncAlt, 
  FaClock, FaShieldAlt, FaHeadset
} from 'react-icons/fa';
import { 
  SITE_NAME, ADMIN_EMAIL, ADMIN_WHATSAPP, ADMIN_TELEGRAM 
} from '../data/mockData';

const Maintenance = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Countdown timer ────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const formatTime = (val) => String(val).padStart(2, '0');

  const whatsappLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Hello, I would like more information about the maintenance on ${SITE_NAME}.`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ─── Background Blobs ──────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 right-40 w-72 h-72 bg-cyan-500 rounded-full mix-blend-lighten filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-slate-700 text-center">

          {/* ─── Site Logo ─────────────────────────────── */}
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-6">
            {SITE_NAME}
          </h1>

          {/* ─── Icon ──────────────────────────────────── */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center"
          >
            <FaTools className="w-12 h-12 text-blue-400" />
          </motion.div>

          {/* ─── Heading ───────────────────────────────── */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            We're Under Maintenance
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Our team is making improvements to give you an even better experience.
            We'll be back shortly — thank you for your patience!
          </p>

          {/* ─── Countdown ─────────────────────────────── */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 flex items-center justify-center gap-2">
              <FaClock className="text-slate-500" />
              Estimated time remaining
            </p>
            <div className="flex justify-center gap-3">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/70 border border-slate-700 rounded-xl w-20 sm:w-24 py-3 sm:py-4"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                    {formatTime(item.value)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Refresh Button ────────────────────────── */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-8"
          >
            <FaSyncAlt className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Check Again'}
          </button>

          {/* ─── Contact Support ───────────────────────── */}
          <div className="pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-4 flex items-center justify-center gap-2">
              <FaHeadset className="text-slate-500" />
              Need immediate help? Reach out to our support team:
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium text-sm transition-all"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp
              </a>

              <a
                href={ADMIN_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-medium text-sm transition-all"
              >
                <FaTelegram className="text-lg" />
                Telegram
              </a>

              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium text-sm transition-all"
              >
                <FaEnvelope className="text-sm" />
                Email
              </a>
            </div>
          </div>

          {/* ─── Footer ────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <FaShieldAlt className="text-slate-600" />
            <span>Your funds and data remain safe during maintenance</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Maintenance;