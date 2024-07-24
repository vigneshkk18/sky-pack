import RoomFile from "@/components/room-file";

export default function RoomFiles() {
  return (
    <ul className="mt-6 mb-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-[1px]">
      <RoomFile type="video" name="Onepiece.mp4" size={400} extension="mp4" />
      <RoomFile type="video" name="Onepiece.mp4" size={400} extension="mp4" />
      <RoomFile type="video" name="Onepiece.mp4" size={400} extension="mp4" />
      <RoomFile type="video" name="Onepiece.mp4" size={400} extension="mp4" />
    </ul>
  );
}
