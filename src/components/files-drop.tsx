import { FileDrop } from "react-file-drop";
import { DragEvent, useState } from "react";

import { show } from "@/hooks/useToast";
import { useTransfer } from "@/hooks/useTransfer";

import { addFilesToQueue } from "@/utils/file-queue";

function FilesDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const isRecieving = useTransfer(
    (state) => state.isInProcess && !state.isTransferring
  );

  function onFrameDragEnter() {
    setIsDragging(true);
  }

  function onFrameDragLeave() {
    setIsDragging(false);
  }

  function onDrop(files: FileList | null, event: DragEvent<HTMLDivElement>) {
    setIsDragging(false);
    if (isRecieving) {
      show({
        text: "Please wait for the ongoing transfer to complete before sending new files...",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }
    if (files) {
      addFilesToQueue(files);
    }
  }

  return (
    <FileDrop
      className={`absolute top-0 left-0 w-full h-full ${
        isDragging ? "pointer-events-auto" : "pointer-events-none"
      }`}
      onFrameDragEnter={onFrameDragEnter}
      onFrameDragLeave={onFrameDragLeave}
      onDrop={onDrop}
    >
      {null}
    </FileDrop>
  );
}

export default FilesDrop;
