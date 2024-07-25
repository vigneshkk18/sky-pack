import { FileIcon, IconType } from "react-file-icon";

import FileProgress from "@/components/file-progress";

interface RoomFile {
  name: string;
  size: number;
  type: IconType;
  extension: string;
  isInProgress?: boolean;
}

export default function RoomFile({
  name,
  size,
  type,
  extension,
  isInProgress = false,
}: RoomFile) {
  return (
    <li className="bg-background-2 flex items-center px-4 py-2 justify-between file border-x border-border transition">
      <div className="flex gap-8">
        <div className="w-10 block">
          <FileIcon type={type} extension={extension} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold">{name}</p>
          <p className="text-xs text-card-foreground/90">{size} MB</p>
        </div>
      </div>
      <FileProgress type={isInProgress ? "inprogress" : "pending"} />
    </li>
  );
}
