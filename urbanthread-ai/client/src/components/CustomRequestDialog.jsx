import React, { useState } from 'react';
import { X, Sparkles, Scissors, Ruler, CheckCircle, ArrowRight, Loader2, Info } from 'lucide-react';
import { api } from '../services/api.js';
import ImageUpload from './ImageUpload.jsx';

const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Hoodies',
  'Jackets',
  'Baggy Jeans',
  'Cargo Pants',
  'Co-ords',
  'Accessories',
  'Other',
];

const FABRICS = [
  '280 GSM Heavy Waffle Knit Cotton',
  '450 GSM Organic French Terry Fleece',
  '14oz Heavy Rigid Skater Denim',
  'Double-Brushed Soft Grunge Flannel',
  'Tactical Waterproof Gorpcore Nylon',
  'Custom / Artisan Fabric (specify in notes)',
];

const STANDARD_SIZES = ['Custom Tailored', 'S - Boxy Fit', 'M - Relaxed Boxy', 'L - Oversized', 'XL - Heavy Slouch', 'XXL - Ultra Baggy'];

export default function CustomRequestDialog({ open, onClose, user, onOpenUserRequests }) {
  const [category, setCategory] = useState('Hoodies');
  const [size, setSize] = useState('Custom Tailored');
  const [fabric, setFabric] = useState(FABRICS[1]);
  const [color, setColor] = useState('Pitch Black');
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState(2499);
  const [description, setDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [measurements, setMeasurements] = useState({
    chest: '',
    length: '',
    shoulder: '',
    waist: '',
    inseam: '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdRequest, setCreatedRequest] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide at least 10 characters explaining your design inspiration or cut details.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await api('/custom-requests', {
        method: 'POST',
        body: {
          category,
          size,
          fabric,
          color,
          quantity: parseInt(quantity, 10) || 1,
          budget: parseFloat(budget) || 0,
          description: description.trim(),
          referenceImage,
          customerPhone: phone.trim(),
          measurements,
        },
      });

      setCreatedRequest(res.customRequest);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    setCreatedRequest(null);
    setDescription('');
    setReferenceImage('');
    setError('');
    onClose();
  };

  return (
    <div className="modalBack" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalBox customRequestModalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="customRequestHeader">
            <span className="customBadge"><Scissors size={14} /> BESPOKE STUDIO</span>
            <h2>Custom Streetwear & Clothing Request</h2>
            <p>Design your 1-of-1 silhouette. Our master tailors review your specifications and provide a custom quotation within 24 hours.</p>
          </div>
          <button className="iconClose" onClick={handleReset} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {createdRequest ? (
          <div className="customSuccessState">
            <CheckCircle size={56} className="successIcon" />
            <h3>Request #{createdRequest.requestId} Submitted!</h3>
            <p>
              Your bespoke design request for <b>{createdRequest.category}</b> has been received by the Kloth.fashion production team.
            </p>

            <div className="quoteInfoCard">
              <div className="quoteRow">
                <span>Status:</span>
                <strong>Under Review by Master Tailor</strong>
              </div>
              <div className="quoteRow">
                <span>Estimated Quotation:</span>
                <strong>Within 24 Hours</strong>
              </div>
              <div className="quoteRow">
                <span>Target Budget:</span>
                <strong>₹{createdRequest.budget} (Estimated)</strong>
              </div>
            </div>
            <div className="successActions">
              <button
                type="button"
                className="primary"
                onClick={() => {
                  handleReset();
                  if (onOpenUserRequests) onOpenUserRequests();
                }}
              >
                Track in My Profile <ArrowRight size={15} />
              </button>
              <button type="button" className="secondary" onClick={handleReset}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="customRequestForm">
            {error && <div className="formErrorNotice">{error}</div>}

            <div className="formSection">
              <label className="sectionTitle"><Sparkles size={14} /> 1. Select Garment Type & Fabric</label>
              <div className="formGrid2">
                <div className="formField">
                  <label>Garment Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="formField">
                  <label>Fabric / GSM Preference</label>
                  <select value={fabric} onChange={(e) => setFabric(e.target.value)}>
                    {FABRICS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="formSection">
              <label className="sectionTitle"><Ruler size={14} /> 2. Sizing, Fit & Color</label>
              <div className="formGrid3">
                <div className="formField">
                  <label>Silhouette / Fit Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    {STANDARD_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="formField">
                  <label>Primary Color / Wash</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Acid Mineral Washed Gray"
                    required
                  />
                </div>
                <div className="formField">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Optional Custom Measurements */}
              {size.includes('Custom') && (
                <div className="measurementsGrid">
                  <small className="measurementsHint"><Info size={12} /> Enter measurements in inches (optional, our team will verify with you):</small>
                  <div className="measInputs">
                    <input
                      type="text"
                      placeholder="Chest (in)"
                      value={measurements.chest}
                      onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Length (in)"
                      value={measurements.length}
                      onChange={(e) => setMeasurements({ ...measurements, length: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Shoulder (in)"
                      value={measurements.shoulder}
                      onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Waist (in)"
                      value={measurements.waist}
                      onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Inseam (in)"
                      value={measurements.inseam}
                      onChange={(e) => setMeasurements({ ...measurements, inseam: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="formSection">
              <label className="sectionTitle">3. Design Description & Specifications</label>
              <div className="formField">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your desired fit, graphics, embroidery, pocket placement, distressing, zip styling, or special requests in detail..."
                  required
                />
              </div>
            </div>

            <div className="formSection">
              <label className="sectionTitle">4. Reference Photos or Design Mockups</label>
              <ImageUpload
                value={referenceImage}
                onChange={setReferenceImage}
                label="Attach Reference Photo or Moodboard"
                hint="Upload an inspiration photo, sketch, or tech pack (PNG, JPG, WEBP)"
              />
            </div>

            <div className="formSection">
              <label className="sectionTitle">5. Budget & Contact</label>
              <div className="formGrid2">
                <div className="formField">
                  <label>Estimated Target Budget (INR)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                  />
                </div>
                <div className="formField">
                  <label>WhatsApp / Mobile Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modalFooterBtns">
              <button type="button" className="secondary" onClick={handleReset} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="primary" disabled={busy}>
                {busy ? <><Loader2 size={16} className="spin" /> Submitting Request…</> : 'Submit Custom Design Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
