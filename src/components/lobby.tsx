import { QRCode } from "antd";
import { FormEvent, useState } from "react";

import { joinRoom } from "@/hooks/useRoom";

import { Clipboard } from "@/assets/clipboard";
import { ClipboardCopied } from "@/assets/clipboard-copied";

interface Lobby {
  roomId: string;
}

function Lobby({ roomId }: Lobby) {
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  function copyRoomId() {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }

  function onJoinRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    joinRoom(roomIdToJoin);
  }

  return (
    <>
      <QRCode value={roomId} />
      <button
        onClick={copyRoomId}
        className="flex gap-2 px-4 py-2 border border-border justify-center rounded cursor-pointer hover:bg-primary/10 hover:border-primary hover:border-dashed transition-colors outline-0 focus-visible:ring focus-visible:bg-primary/10 focus-visible:ring-primary"
      >
        {isCopied ? <ClipboardCopied color="#8789FE" /> : <Clipboard />}
        <div>
          Your Room ID: <b className="text-primary">{roomId}</b>
        </div>
      </button>
      <form onSubmit={onJoinRoom} className="flex w-full md:w-max">
        <input
          type="text"
          placeholder="Enter RoomID"
          value={roomIdToJoin}
          onChange={(e) => setRoomIdToJoin(e.target.value)}
          className="outline-0 p-2 pl-4 bg-background-2 border border-border rounded-s-md flex-grow md:w-48 touch-none"
        />
        <button
          disabled={!roomIdToJoin.trim()}
          type="submit"
          className="w-max border-none outline-0 focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary/80 bg-primary text-primary-foreground p-2 rounded-e-md hover:bg-primary/90 disabled:bg-card-foreground/20 disabled:text-card-foreground/70"
        >
          Join Room
        </button>
      </form>
    </>
  );
}

export default Lobby;
