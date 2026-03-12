'use client';

import { useState } from 'react';

interface ToggleProps {
  defaultOn?: boolean;
  onChange?: (val: boolean) => void;
}

export function Toggle({ defaultOn = false, onChange }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);

  const handleClick = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: 38,
        height: 20,
        borderRadius: 10,
        cursor: 'pointer',
        background: on ? 'var(--cyan)' : 'var(--border2)',
        border: 'none',
        padding: 0,
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 14,
          height: 14,
          borderRadius: 7,
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          display: 'block',
        }}
      />
    </button>
  );
}
