export default function Badge({
  children,
  variant = 'default',
  className = '', // 부모 스타일 병합을 위해 추가
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}) {
  const variants = {
    default: 'bg-white/5 text-slate-300 border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
