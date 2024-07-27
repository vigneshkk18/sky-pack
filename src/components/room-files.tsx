import RoomFile from "@/components/room-file";

import { FileObject } from "@/types/transfer";

interface RoomFiles {
  files: FileObject[];
}

export default function RoomFiles({ files }: RoomFiles) {
  if (!files.length) {
    return (
      <div className="flex flex-col w-full mt-6 justify-center items-center gap-2 justify-self-center h-full">
        <img
          width={250}
          height={300}
          alt="Empty Folder"
          src="/empty_folder.svg"
        />
        <p>Drop files here</p>
        <p>
          or use the <em>"Add new file"</em> button.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 mb-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-[1px] h-max no-scrollbar overflow-scroll">
      {files.map((file) => (
        <RoomFile
          key={file.id}
          id={file.id}
          type={file.icon.type}
          name={file.name}
          size={file.size}
          sentOrRecieved={file.sentOrRecieved}
          extension={file.icon.extension}
          isInProgress={file.sentOrRecieved > 0}
        />
      ))}
    </ul>
  );
}
