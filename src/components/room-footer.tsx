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
    <footer className="bg-background-2 p-6 border-t border-border flex justify-between rounded-b-md">
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
        className="hidden"
      />
      <button
        onClick={addNewFile}
        disabled={isInProcess && !isTransferring}
        className="flex items-center gap-2 border-none outline-0 focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary/80 bg-primary text-primary-foreground p-2 px-4 rounded-md hover:bg-primary/90"
      >
        <Plus className="text-white" /> Add new file
      </button>
    </footer>
  );
}

export default RoomFooter;
