export default function HealthRing({ score }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} className="fill-none stroke-slate-200" strokeWidth="8" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="fill-none stroke-brand-teal transition-all"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brand-teal">
        {score}%
      </div>
    </div>
  );
}
