import { ChangeEvent, useRef } from "react";

import { useRoom } from "@/hooks/useRoom";
import { addFilesToQueue, useTransfer } from "@/hooks/useTransfer";

import { Plus } from "@/assets/plus";

function byteToMB(byte: number) {
  return (byte * 0.000001).toFixed(2);
}

function RoomFooter() {
  const roomInfo = useRoom();
  const { isInProcess, isTransferring, total, sentOrRecieved } = useTransfer();
  const inputRef = useRef<HTMLInputElement>(null);

  function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFilesToQueue(event.target.files);
    }
  }

  function addNewFile() {
    inputRef.current?.showPicker();
  }

  if (!roomInfo.isReady || !roomInfo.isReadyToComunicate) return;

  return (
    <footer className="bg-background-2 p-4 md:p-6 border-t border-border flex justify-between items-center rounded-b-md">
      <div className="flex flex-col justify-stretch gap-4">
        <p className="font-bold">
          {byteToMB(sentOrRecieved)} MB / {byteToMB(total)} MB{" "}
          <span className="text-sm font-normal">transferred</span>
        </p>
        <progress value={sentOrRecieved} max={total} className="w-full" />
      </div>
      <input
        onChange={onFilesSelected}
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
      />
      <button
        onClick={addNewFile}
        disabled={isInProcess && !isTransferring}
        className="flex items-center md:gap-2 h-max border-none outline-0 shadow-md shadow-primary/50 focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary/80 bg-primary text-primary-foreground p-2 md:px-4 rounded-full md:rounded-md hover:bg-primary/90"
      >
        <Plus className="text-white" />
        <span className="hidden md:block"> Add new file</span>
      </button>
    </footer>
  );
}

export default RoomFooter;
