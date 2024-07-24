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
        <span className="text-[1em] text-card-foreground/80">{completed}%</span>
      </div>
      <svg
        className="w-full h-full transform -rotate-90"
        width={75}
        height={75}
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
          className="text-primary"
          strokeWidth="5"
          strokeDasharray="188.5"
          strokeDashoffset={remaining}
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
