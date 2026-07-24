import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const AdminInvestmentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    minimumInvestment: '',
    maximumInvestment: '',
    dailyROI: '',
    duration: '',
    expectedProfit: '',
    color: 'blue',
    badge: '',
    description: '',
    features: [],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      } else {
        toast.error('Failed to load plans');
      }
    } catch (error) {
      console.error('Fetch plans error:', error);
      toast.error(error.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name || '',
        minimumInvestment: plan.minimumInvestment || '',
        maximumInvestment: plan.maximumInvestment || '',
        dailyROI: plan.dailyROI || '',
        duration: plan.duration || '',
        expectedProfit: plan.expectedProfit || '',
        color: plan.color || 'blue',
        badge: plan.badge || '',
        description: plan.description || '',
        features: plan.features || [],
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        minimumInvestment: '',
        maximumInvestment: '',
        dailyROI: '',
        duration: '',
        expectedProfit: '',
        color: 'blue',
        badge: '',
        description: '',
        features: [],
      });
    }
    setShowModal(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name || !formData.minimumInvestment || !formData.dailyROI || !formData.duration || !formData.expectedProfit) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const planData = {
        name: formData.name,
        minimumInvestment: parseFloat(formData.minimumInvestment),
        maximumInvestment: formData.maximumInvestment ? parseFloat(formData.maximumInvestment) : 0,
        dailyROI: parseFloat(formData.dailyROI),
        duration: parseInt(formData.duration),
        expectedProfit: parseFloat(formData.expectedProfit),
        color: formData.color || 'blue',
        badge: formData.badge || '',
        description: formData.description || '',
        features: formData.features || [],
        isActive: true,
      };

      let response;
      if (editingPlan) {
        // Update existing plan
        response = await API.put(`/admin/plans/${editingPlan._id}`, planData);
        if (response.data.success) {
          toast.success('Plan updated successfully');
          fetchPlans();
        }
      } else {
        // Create new plan
        response = await API.post('/admin/plans', planData);
        if (response.data.success) {
          toast.success('Plan added successfully');
          fetchPlans();
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save plan error:', error);
      toast.error(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const response = await API.delete(`/admin/plans/${planId}`);
      if (response.data.success) {
        toast.success('Plan deleted successfully');
        fetchPlans();
      }
    } catch (error) {
      console.error('Delete plan error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleToggleStatus = async (planId, currentStatus) => {
    try {
      const response = await API.put(`/admin/plans/${planId}`, { isActive: !currentStatus });
      if (response.data.success) {
        toast.success(`Plan ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchPlans();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getColorClass = (color) => {
    const colors = {
      amber: 'from-amber-700/20 border-amber-500/30 text-amber-400',
      orange: 'from-orange-700/20 border-orange-500/30 text-orange-400',
      slate: 'from-slate-700/20 border-slate-500/30 text-slate-300',
      yellow: 'from-yellow-700/20 border-yellow-500/30 text-yellow-400',
      cyan: 'from-cyan-700/20 border-cyan-500/30 text-cyan-400',
      purple: 'from-purple-700/20 border-purple-500/30 text-purple-400',
      blue: 'from-blue-700/20 border-blue-500/30 text-blue-400',
      green: 'from-green-700/20 border-green-500/30 text-green-400',
      red: 'from-red-700/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Plans</h1>
          <p className="text-slate-400 mt-1">Manage investment packages and returns</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-white"
        >
          <FaPlus /> Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <div key={plan._id} className={`bg-gradient-to-br ${getColorClass(plan.color).split(' ')[0]} bg-slate-800 rounded-2xl overflow-hidden border ${getColorClass(plan.color).split(' ')[1]} relative ${!plan.isActive ? 'opacity-60' : ''}`}>
              {!plan.isActive && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs">Inactive</div>
              )}
              {plan.badge && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-slate-900 px-2 py-1 rounded-lg text-xs font-semibold">
                  {plan.badge}
                </div>
              )}
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold ${getColorClass(plan.color).split(' ')[2]} mb-2`}>{plan.name}</h3>
                  <div className="text-3xl font-bold text-white">${plan.minimumInvestment.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Minimum Investment</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex justify-between">
                    <span className="text-slate-400">Maximum</span>
                    <span className="text-white font-semibold">
                      {plan.maximumInvestment ? `$${plan.maximumInvestment.toLocaleString()}` : 'Unlimited'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Daily ROI</span>
                    <span className="text-white font-semibold">{plan.dailyROI}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white font-semibold">{plan.duration} days</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Expected Profit</span>
                    <span className="text-white font-semibold">{plan.expectedProfit}%</span>
                  </li>
                </ul>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(plan._id, plan.isActive)}
                    className="py-2 px-4 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition flex items-center justify-center gap-2"
                  >
                    {plan.isActive ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-red-500" />}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="py-2 px-4 rounded-lg bg-red-600/20 text-red-500 font-semibold hover:bg-red-600/30 transition flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            No investment plans found. Click "Add New Plan" to create one.
          </div>
        )}
      </div>

      {/* Plan Statistics */}
      <div className="mt-8 bg-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Plan Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Active Plans</p>
            <p className="text-2xl font-bold text-white">{plans.filter(p => p.isActive).length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Average Daily ROI</p>
            <p className="text-2xl font-bold text-white">
              {plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.dailyROI, 0) / plans.length) : 0}%
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Min Investment Range</p>
            <p className="text-2xl font-bold text-white">
              {plans.length > 0 ? `$${Math.min(...plans.map(p => p.minimumInvestment))} - $${Math.max(...plans.map(p => p.minimumInvestment))}` : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Plans</p>
            <p className="text-2xl font-bold text-white">{plans.length}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingPlan ? 'Edit Investment Plan' : 'Add New Investment Plan'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Plan Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Premium Plan"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Badge (optional)</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Popular, Best Value"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Min Amount ($) *</label>
                  <input
                    type="number"
                    value={formData.minimumInvestment}
                    onChange={(e) => setFormData({ ...formData, minimumInvestment: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Max Amount ($)</label>
                  <input
                    type="number"
                    value={formData.maximumInvestment}
                    onChange={(e) => setFormData({ ...formData, maximumInvestment: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="0 for Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Daily ROI (%) *</label>
                  <input
                    type="number"
                    value={formData.dailyROI}
                    onChange={(e) => setFormData({ ...formData, dailyROI: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Duration (days) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Expected Profit (%) *</label>
                  <input
                    type="number"
                    value={formData.expectedProfit}
                    onChange={(e) => setFormData({ ...formData, expectedProfit: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Theme Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="amber">Amber</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="cyan">Cyan</option>
                    <option value="red">Red</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Plan description..."
                  rows="2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {saving ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Add Plan')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition flex items-center justify-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestmentPlans;