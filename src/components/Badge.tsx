export function SoonBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-card-muted px-2 py-0.5 text-xs font-medium text-muted ${className}`}
    >
      Bientôt
    </span>
  );
}
