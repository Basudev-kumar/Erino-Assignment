import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './LeadForm.css';

function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    source: 'website',
    status: 'new',
    score: 0,
    lead_value: 0,
    is_qualified: false,
    last_activity_at: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await api.get(`/leads/${id}`);
      const lead = response.data;
      setFormData({
        ...lead,
        last_activity_at: lead.last_activity_at ? 
          new Date(lead.last_activity_at).toISOString().slice(0, 16) : ''
      });
    } catch (error) {
      setError('Failed to fetch lead');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        score: parseInt(formData.score),
        lead_value: parseFloat(formData.lead_value),
        last_activity_at: formData.last_activity_at || null
      };

      if (isEdit) {
        await api.put(`/leads/${id}`, dataToSubmit);
      } else {
        await api.post('/leads', dataToSubmit);
      }
      
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-form-container">
      <div className="lead-form-card">
        <h2>{isEdit ? 'Edit Lead' : 'Create New Lead'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Source *</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
              >
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Score (0-100)</label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            
            <div className="form-group">
              <label>Lead Value ($)</label>
              <input
                type="number"
                name="lead_value"
                value={formData.lead_value}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Activity</label>
            <input
              type="datetime-local"
              name="last_activity_at"
              value={formData.last_activity_at}
              onChange={handleChange}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_qualified"
                checked={formData.is_qualified}
                onChange={handleChange}
              />
              Is Qualified
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/leads')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (isEdit ? 'Update Lead' : 'Create Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadForm;