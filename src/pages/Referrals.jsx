import { useState, useEffect } from 'react';
import { FaCopy, FaShare, FaUsers, FaGift, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import API from '../utils/axios';
import { useAuth } from '../auth/userAuth';

const Referrals = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState({
    code: '',
    totalReferrals: 0,
    totalEarned: 0,
    referrals: [],
  });
  const [copied, setCopied] = useState(false);

  // Build referral link only if code exists
  const referralLink = referralData.code ? `${window.location.origin}/register?ref=${referralData.code}` : '';

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      // Fetch referral stats
      const statsRes = await API.get('/referrals/stats');
      if (statsRes.data.success) {
        const data = statsRes.data.data;
        // Use referral code from stats, or from user object, or fallback to empty
        const code = data.referralCode || user?.referralCode || '';
        setReferralData({
          code: code,
          totalReferrals: data.totalReferrals || 0,
          totalEarned: data.totalEarned || 0,
          referrals: data.referrals || [],
        });
        // If user doesn't have referral code in context, update it
        if (!user?.referralCode && code) {
          updateUser({ referralCode: code });
        }
      } else {
        toast.error('Failed to load referral data');
      }
    } catch (error) {
      console.error('Referral fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load referral data');
      // Fallback: use user's referral code if available
      if (user?.referralCode) {
        setReferralData(prev => ({ ...prev, code: user.referralCode }));
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) {
      toast.error('No referral code available yet');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading referral data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Check if referral code is available
  const hasReferralCode = !!referralData.code;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Referral Program</h1>
          <p className="text-slate-400 mt-1">Invite friends and earn 5% commission on their investments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard title="Total Referrals" value={referralData.totalReferrals} icon={FaUsers} />
          <StatCard title="Total Commission" value={referralData.totalEarned} icon={FaGift} />
        </div>

        {/* Referral Link */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Share Your Referral Link</h2>
          
          {hasReferralCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Your Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralData.code}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-mono text-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(referralData.code)}
                    className="px-6 bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Your Referral Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="px-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join Ark',
                      text: `Join Ark using my referral link: ${referralLink}`,
                      url: referralLink,
                    }).catch(() => {});
                  } else {
                    copyToClipboard(referralLink);
                  }
                }}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <FaShare /> Share on Social Media
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400">No referral code available. Please refresh or contact support.</p>
            </div>
          )}
        </div>

        {/* Referral List */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Your Referrals</h2>
          
          {referralData.referrals.length > 0 ? (
            <div className="space-y-3">
              {referralData.referrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{referral.name || referral.fullName || 'User'}</p>
                    <p className="text-xs text-slate-400">
                      Joined: {referral.date ? new Date(referral.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Investment</p>
                    <p className="font-bold text-white">${(referral.investment || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Commission</p>
                    <p className="font-bold text-green-500">${(referral.commission || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">No referrals yet. Share your link to start earning!</p>
          )}
        </div>

        {/* Bonus Info */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-500 text-sm text-center">
            💰 Bonus: Get an additional $50 bonus for every 5 referrals who invest at least $500!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Referrals;