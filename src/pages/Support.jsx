import { useState } from 'react';
import { FaQuestionCircle, FaHeadset, FaTelegram, FaWhatsapp, FaChevronDown, FaChevronUp, FaComments, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { ADMIN_WHATSAPP, ADMIN_TELEGRAM } from '../data/mockData';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-700 transition"
      >
        <span className="text-white font-medium">{question}</span>
        {isOpen ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-slate-700/50">
          <p className="text-slate-300">{answer}</p>
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "How do I make a deposit?",
      answer: "You can make a deposit by navigating to the Deposit page, selecting your preferred payment method, and following the instructions. We accept various cryptocurrencies and bank transfers."
    },
    {
      question: "How long do withdrawals take?",
      answer: "Withdrawals are processed within 24-48 hours after verification. Crypto withdrawals are usually faster (30-60 minutes) while bank transfers may take 1-3 business days."
    },
    {
      question: "What is the minimum investment?",
      answer: "The minimum investment amount is $100 for the Starter Plan. Each plan has different minimum requirements - please check our Investment Plans page for details."
    },
    {
      question: "How do I earn referral commissions?",
      answer: "Share your unique referral link with friends. When they sign up and invest, you earn 5% commission on their investment amount. Commissions are credited instantly to your account."
    },
    {
      question: "Is my money safe?",
      answer: "Yes, we use bank-level security measures including 2FA, cold storage for cryptocurrencies, and regular security audits to protect your funds."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Support ticket submitted! We\'ll respond within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openLiveChat = () => {
    window.open('https://chat-support1.onrender.com', '_blank', 'width=400,height=600,scrollbars=yes');
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Support Center</h1>
          <p className="text-slate-400 mt-1">Get help with your account or trading needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Options */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Contact Us</h2>
            <div className="space-y-4">
              {/* Live Chat - Replacing Email */}
              <button
                onClick={openLiveChat}
                className="w-full flex items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition group"
              >
                <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                  <FaComments className="text-2xl" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Live Chat</h3>
                  <p className="text-sm text-white/80">Chat with support instantly</p>
                </div>
                <FaExternalLinkAlt className="text-white/60 text-sm" />
              </button>

              <a
                href={ADMIN_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition group"
              >
                <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                  <FaTelegram className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Telegram Support</h3>
                  <p className="text-sm text-white/80">Chat with our team instantly</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${ADMIN_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition group"
              >
                <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                  <FaWhatsapp className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold">WhatsApp Support</h3>
                  <p className="text-sm text-white/80">+{ADMIN_WHATSAPP}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaHeadset className="text-blue-400" />
                Submit a Ticket
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Message</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
                >
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaQuestionCircle className="text-blue-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;