interface CircularyProgress {
  value: number;
  max: number;
}

function CircularyProgress({ value, max }: CircularyProgress) {
  const total = max;
  const remaining = Math.round((value / total) * 100);
  const completed = 100 - remaining;

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[0.7em] text-card-foreground/80">
          {remaining}%
        </span>
      </div>
      <svg
        className="transform -rotate-90"
        width={50}
        height={50}
        viewBox="0 0 100 100"
      >
        <circle
          className="text-border"
          strokeWidth="5"
          stroke="currentColor"
          fill="transparent"
          r="30"
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-primary transition"
          strokeWidth="5"
          strokeDasharray="188.5"
          strokeDashoffset={(completed / 100) * 188.5}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="30"
          cx="50%"
          cy="50%"
        />
      </svg>
    </div>
  );
}

export default CircularyProgress;
