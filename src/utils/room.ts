import ShortUniqueId from "short-unique-id";

import { resetTransfer } from "@/hooks/useTransfer";
import { onRoomClosed, useRoom } from "@/hooks/useRoom";
import { destroyConnections, setupConnection } from "@/hooks/usePeerConnection";

import { socket } from "@/socket";

const uid = new ShortUniqueId({ dictionary: "number", length: 6 });

export const joinRoom = async (roomId: string) => {
  const { userId } = useRoom.getState();
  const roomExists = await socket.emitWithAck("ROOM_EXISTS", { roomId });
  if (!roomExists) {
    alert("Room doesn't exist");
    return;
  }
  const canJoin = await socket.emitWithAck("CAN_JOIN_ROOM", { roomId });
  if (!canJoin) {
    alert("There is ongoing transfer, please wait for it to get completed...");
    return;
  }
  socket.emit("JOIN_ROOM", { roomId, userId }, ({ roomId, peers }) => {
    setupConnection(peers);
    useRoom.setState({ roomId: roomId, peers, isReadyToComunicate: true, type: "reciever" });
  })
}

export const leaveRoom = () => {
  const { roomId, userId, type } = useRoom.getState();
  onRoomClosed();
  destroyConnections();
  resetTransfer();
  socket.emit(type === "reciever" ? "LEAVE_ROOM" : "DISCONNECT_ROOM", { roomId, userId });
}
