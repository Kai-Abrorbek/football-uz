interface PillProps {
  children: React.ReactNode;
  color?: string;
}

export function Pill({ children, color = 'var(--cyan)' }: PillProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 700,
        padding: '2px 7px',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        border: '1px solid',
        color,
        borderColor: color.startsWith('#')
          ? color + '44'
          : 'rgba(0,229,255,0.3)',
        background: color.startsWith('#')
          ? color + '18'
          : 'rgba(0,229,255,0.1)',
      }}
    >
      {children}
    </span>
  );
}
