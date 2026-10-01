import { useState } from 'react';

// Labeled input with inline validation message and optional show/hide for passwords.
function Field({ label, error, type = 'text', className = 'mb-3', ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={className}>
      {label && <label className="pd-label">{label}</label>}
      <div className="position-relative">
        <input
          {...props}
          type={isPassword && visible ? 'text' : type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
        />
        {isPassword && (
          <button type="button" className="field-toggle" onClick={() => setVisible(!visible)} tabIndex={-1}>
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export default Field;
