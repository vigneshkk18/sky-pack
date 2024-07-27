import { FileIcon, IconType } from "react-file-icon";

import FileProgress from "@/components/file-progress";

import { downloadFileFromCache } from "@/utils/common";
import { removeFileFromQueue } from "@/utils/file-queue";

interface RoomFile {
  id: string;
  name: string;
  size: number;
  sentOrRecieved: number;
  type: IconType;
  extension: string;
  isInProgress?: boolean;
}

function byteToMB(byte: number) {
  return (byte * 0.000001).toFixed(2);
}

export default function RoomFile({
  name,
  id,
  size,
  type,
  extension,
  sentOrRecieved,
  isInProgress = false,
}: RoomFile) {
  function onRemoveFileFromQueue() {
    removeFileFromQueue(id);
  }

  function downloadFile() {
    downloadFileFromCache(id, name);
  }

  return (
    <li className="bg-background-2 items-center h-max flex px-4 py-2 justify-between file border-x border-border transition">
      <div className="w-[calc(100%-50px)] flex gap-8">
        <div className="w-10 block">
          <FileIcon type={type} extension={extension} />
        </div>
        <div className="flex flex-col w-[calc(100%-40px-32px)] gap-1">
          <p className="font-bold truncate" title={name}>
            {name}
          </p>
          <p className="text-xs text-card-foreground/90">{byteToMB(size)} MB</p>
        </div>
      </div>
      <div className="w-[50px] flex justify-center">
        <FileProgress
          downloadFile={downloadFile}
          removeFileFromQueue={onRemoveFileFromQueue}
          size={size}
          sentOrRecieved={sentOrRecieved}
          type={isInProgress ? "inprogress" : "pending"}
        />
      </div>
    </li>
  );
}
