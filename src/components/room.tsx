import Tabs from "@/components/room-tabs";
import RoomFiles from "@/components/room-files";

function Room() {
  return (
    <div className="w-full h-full md:h-max">
      <Tabs />
      <RoomFiles />
    </div>
  );
}

export default Room;
