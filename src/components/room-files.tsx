import RoomFile from "@/components/room-file";

interface RoomFiles {
  files: string[];
}

export default function RoomFiles({ files }: RoomFiles) {
  return (
    <ul className="mt-6 mb-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-[1px]">
      {files.map((file) => (
        <RoomFile
          key={file}
          type="video"
          name="Onepiece.mp4"
          size={400}
          extension="mp4"
        />
      ))}
    </ul>
  );
}
