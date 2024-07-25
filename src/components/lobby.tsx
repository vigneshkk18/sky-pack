import { QRCode } from "antd";
import { useState } from "react";

import { Clipboard } from "@/assets/clipboard";
import { ClipboardCopied } from "@/assets/clipboard-copied";

interface Lobby {
  roomId: string;
}

function Lobby({ roomId }: Lobby) {
  const [isCopied, setIsCopied] = useState(false);

  function copyRoomId() {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }

  return (
    <>
      <QRCode value={roomId} />
      <button
        onClick={copyRoomId}
        className="flex gap-2 px-4 py-2 border border-border justify-center rounded cursor-pointer hover:border-primary hover:border-dashed transition-colors"
      >
        {isCopied ? <ClipboardCopied color="#8789FE" /> : <Clipboard />}
        <div>
          Your Room ID: <b className="text-primary">{roomId}</b>
        </div>
      </button>
      <form className="flex w-full md:w-max">
        <input
          type="text"
          placeholder="Enter RoomID"
          className="outline-0 p-2 pl-4 bg-background-2 border border-border rounded-s-md flex-grow md:w-48 touch-none"
        />
        <button className="w-max border-none outline-0 focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary/80 bg-primary text-primary-foreground p-2 rounded-e-md hover:bg-primary/90">
          Join Room
        </button>
      </form>
    </>
  );
}

export default Lobby;
