import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import NameProgressBar from '../common/NameProgressBar';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';
import { Store, Plus } from 'lucide-react';

const AddStoreModal = ({ isOpen = true, onClose, onStoreCreated, onStoreDeleted }) => {
  const { showSuccess, showError, showInfo } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch available store owners for the dropdown
  useEffect(() => {
    const fetchOwners = async () => {
      setLoadingOwners(true);
      try {
        const res = await adminService.getUsers({ role: 'store_owner', limit: 100 });
        if (res.success && Array.isArray(res.data)) {
          setOwners(res.data);
        }
      } catch (err) {
        console.error('Failed to load store owners', err);
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const nameError = validateName(formData.name);
  const emailError = validateEmail(formData.email);
  const addressError = validateAddress(formData.address, true);

  const isFormValid = !nameError && !emailError && !addressError;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, address: true });
    setApiError('');

    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        owner_id: formData.owner_id ? parseInt(formData.owner_id, 10) : null,
      };

      const res = await adminService.createStore(payload);
      if (res.success) {
        const createdStore = res.data;
        const createdName = formData.name;
        if (onStoreCreated) onStoreCreated(createdStore);
        onClose();

        // Actionable Toast with [Undo]
        showSuccess(`Store '${createdName}' added successfully.`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                await adminService.deleteStore(createdStore.id);
                if (onStoreDeleted) onStoreDeleted(createdStore.id);
                showInfo(`Action undone: Store '${createdName}' removed.`);
              } catch (undoErr) {
                showError('Failed to undo store creation.');
              }
            },
          },
          duration: 7000,
        });
      } else {
        setApiError(res.message || 'Failed to create store');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Error creating store';
      setApiError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Register New Store" isOpen={isOpen} onClose={onClose} maxWidth="560px">
      <form onSubmit={handleSubmit}>
        {apiError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {apiError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Store Name <span className="form-hint">(20–60 characters)</span>
          </label>
          <input
            type="text"
            className={`form-input ${touched.name && nameError ? 'is-invalid' : ''} ${touched.name && !nameError ? 'is-valid' : ''}`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="e.g. Downtown Electronics Mega Hub"
            required
          />
          {/* Real-time Validation UI: Progress Bar (20-60 chars) */}
          <NameProgressBar length={formData.name.length} min={20} max={60} />
          {touched.name && nameError && <span className="form-error">{nameError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Store Official Email</label>
          <input
            type="email"
            className={`form-input ${touched.email && emailError ? 'is-invalid' : ''} ${touched.email && !emailError ? 'is-valid' : ''}`}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="contact@megastore.com"
            required
          />
          {touched.email && emailError && <span className="form-error">{emailError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Physical Address <span className="form-hint">(Max 400 chars)</span>
          </label>
          <textarea
            className={`form-textarea ${touched.address && addressError ? 'is-invalid' : ''}`}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            rows={3}
            placeholder="123 Main Street, Suite 100, City Center..."
            required
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {touched.address && addressError ? (
              <span className="form-error">{addressError}</span>
            ) : <span />}
            <span className="char-counter">{formData.address.length}/400</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Assign Store Owner <span className="form-hint">(Optional)</span>
          </label>
          <select
            className="form-select"
            value={formData.owner_id}
            onChange={(e) => handleChange('owner_id', e.target.value)}
            disabled={loadingOwners}
          >
            <option value="">-- No Owner Assigned (Unassigned Store) --</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
          <span className="form-hint" style={{ marginTop: '0.25rem' }}>
            You can leave this unassigned and assign an owner account later.
          </span>
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || !isFormValid}>
            <Plus size={16} />
            <span>{submitting ? 'Registering...' : 'Register Store'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStoreModal;
