import CircularyProgress from "@/components/ui/circular-progress";

import { Cancel } from "@/assets/cancel";
import { Download } from "@/assets/download";
import { HourGlass } from "@/assets/hour-glass";
import { CheckCircle } from "@/assets/check-circle";

interface FileProgress {
  size: number;
  sentOrRecieved: number;
  type: "inprogress" | "pending";
  downloadFile: () => void;
  removeFileFromQueue: () => void;
}

function FileProgress({
  type,
  size,
  sentOrRecieved,
  downloadFile,
  removeFileFromQueue,
}: FileProgress) {
  if (type === "inprogress" && sentOrRecieved >= size) {
    return (
      <button onClick={downloadFile} className="group rounded-full p-2">
        <CheckCircle
          className="group-hover:hidden"
          width={24}
          height={24}
          fill="#22c55e"
        />
        <Download
          className="hidden group-hover:block"
          width={24}
          height={24}
          color="#8789fe"
        />
      </button>
    );
  }

  if (type === "inprogress")
    return <CircularyProgress value={sentOrRecieved} max={size} />;

  return (
    <button
      onClick={removeFileFromQueue}
      className="group rounded-full border border-border hover:bg-destructive p-2 text-white transition-colors ease-in"
    >
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
