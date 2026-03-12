interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  iconPath: string;
}

export function StatCard({
  label,
  value,
  sub,
  color,
  iconPath,
}: StatCardProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 130,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle at top right, ${color}20, transparent 70%)`,
        }}
      />
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--muted2)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: 'var(--text)',
          fontFamily: "'DM Mono', monospace",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, marginTop: 6, fontWeight: 500, color }}>
        {sub}
      </div>
      <div
        style={{ position: 'absolute', bottom: 14, right: 16, opacity: 0.2 }}
      >
        <svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        >
          <path d={iconPath} />
        </svg>
      </div>
    </div>
  );
}
