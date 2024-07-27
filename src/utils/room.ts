import { resetTransfer } from "@/hooks/useTransfer";
import { onRoomClosed, useRoom } from "@/hooks/useRoom";
import { destroyConnections, setupConnection } from "@/hooks/usePeerConnection";

import { socket } from "@/socket";
import { show } from "@/hooks/useToast";

export const joinRoom = async (roomId: string) => {
  const { userId } = useRoom.getState();
  const roomExists = await socket.emitWithAck("ROOM_EXISTS", { roomId });
  if (!roomExists) {
    show({
      text: "Room doesn't exist",
      duration: 3000,
      variant: "destructive",
    })
    return;
  }
  const canJoin = await socket.emitWithAck("CAN_JOIN_ROOM", { roomId });
  if (!canJoin) {
    show({
      text: "There is ongoing transfer, please wait for it to get completed...",
      duration: 3000,
      variant: "destructive",
    })
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
