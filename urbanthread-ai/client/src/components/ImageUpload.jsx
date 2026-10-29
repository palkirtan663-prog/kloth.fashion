import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

export default function ImageUpload({ value, onChange, label = 'Upload Image', hint = 'PNG, JPG, WEBP up to 10MB' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError('');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await api('/upload', {
          method: 'POST',
          body: {
            image: base64Data,
            filename: file.name.replace(/\.[^/.]+$/, ''),
          },
        });
        if (res.url) {
          onChange(res.url);
        } else {
          onChange(base64Data);
        }
      } catch (err) {
        // Fall back to data URI directly so UX is never blocked
        onChange(base64Data);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Could not read image file.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="imageUploadComponent">
      <span className="fieldLabel">{label}</span>
      {value ? (
        <div className="imagePreviewContainer">
          <img src={value} alt="Uploaded reference preview" className="uploadedImgPreview" />
          <div className="previewOverlay">
            <span className="previewStatus"><CheckCircle2 size={14} /> Ready</span>
            <button
              type="button"
              className="removeImgBtn"
              onClick={() => onChange('')}
              title="Remove image"
            >
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`uploadDropZone ${dragActive ? 'dropZoneActive' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {loading ? (
            <div className="uploadLoadingState">
              <Loader2 size={24} className="spin" />
              <span>Optimizing and uploading image…</span>
            </div>
          ) : (
            <>
              <UploadCloud size={28} className="uploadIcon" />
              <div className="uploadPrompt">
                <strong>Click to browse</strong> or drag & drop photo here
              </div>
              <small className="uploadHint">{hint}</small>
            </>
          )}
        </div>
      )}

      {error && <div className="uploadErrorMsg">{error}</div>}

      {/* Manual URL input fallback */}
      <div className="manualUrlInputWrap">
        <span className="orDividerText">or paste image URL</span>
        <input
          type="text"
          placeholder="https://images.unsplash.com/... or /images/..."
          value={value && !value.startsWith('data:') ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="manualUrlField"
        />
      </div>
    </div>
  );
}
