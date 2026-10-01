import { useState } from 'react';

// Editable quantity: the text can be cleared and retyped; the value is validated on blur/Enter.
function QuantityInput({ value, onChange, min = 1, max }) {
  const [draft, setDraft] = useState(null);
  const clamp = (n) => Math.min(max ?? Infinity, Math.max(min, n));

  function commit() {
    if (draft === null) return;
    const n = parseInt(draft, 10);
    onChange(clamp(Number.isNaN(n) ? value : n));
    setDraft(null);
  }

  return (
    <div className="qty-stepper">
      <button type="button" aria-label="Decrease" onClick={() => onChange(clamp(value - 1))}>−</button>
      <input
        type="text"
        inputMode="numeric"
        value={draft ?? value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => /^\d*$/.test(e.target.value) && setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <button type="button" aria-label="Increase" onClick={() => onChange(clamp(value + 1))}>+</button>
    </div>
  );
}

export default QuantityInput;
