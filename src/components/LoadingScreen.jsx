import { motion } from 'framer-motion';
import { SITE_NAME } from '../data/mockData';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold gradient-text">{SITE_NAME}</h2>
        <p className="text-slate-400 mt-2">Loading...</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;