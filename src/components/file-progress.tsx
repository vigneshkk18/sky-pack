import CircularyProgress from "@/components/ui/circular-progress";

import { Cancel } from "@/assets/cancel";
import { HourGlass } from "@/assets/hour-glass";

interface FileProgress {
  type: "inprogress" | "pending";
}

function FileProgress({ type }: FileProgress) {
  if (type === "inprogress")
    return <CircularyProgress value={512} max={1024} />;

  return (
    <button className="group rounded-full border border-border hover:bg-destructive p-2 text-white transition-colors">
      <HourGlass
        className="text-card-foreground/80 group-hover:hidden"
        width={20}
        height={20}
      />
      <Cancel
        className="hidden text-destructive-foreground group-hover:block"
        width={20}
        height={20}
      />
    </button>
  );
}

export default FileProgress;
