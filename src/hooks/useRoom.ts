import { create } from "zustand";
import ShortUniqueId from "short-unique-id";

import { resetTransfer } from "@/hooks/useTransfer";
import { destroyConnections, setupConnection } from "@/hooks/usePeerConnection";

import { initSocket, socket } from "@/socket";

const uid = new ShortUniqueId({ dictionary: "number", length: 6 });

interface Room {
  isReady: boolean;
  type: "sender" | "reciever";
  /** Will be true when there are people in room */
  isReadyToComunicate: boolean;
  roomId: string;
  userId: string;
  peers: string[];
}

const store: Room = {
  isReady: true,
  type: "sender",
  isReadyToComunicate: false,
  roomId: uid.rnd(),
  userId: uid.rnd(),
  peers: []
};

export const useRoom = create<Room>(() => store);

export const initRoom = () => {
  initSocket();
  const { roomId, userId } = useRoom.getState();
  socket.emit("CONNECT_ROOM", { roomId, userId });
  socket.emit("ROOM_ACCEPTS_PEERS", { roomId, canAccept: true });
}

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

export const createRoom = () => {
  const roomId = uid.rnd();
  useRoom.setState({ roomId, isReadyToComunicate: false, peers: [], type: "sender" });
  return roomId;
}

export const addPeer = (peerId: string) => {
  useRoom.setState((state) => {
    const peers = Array.from(new Set([...state.peers, peerId]))
    return { peers, isReadyToComunicate: peers.length > 0 }
  })
}

export const removePeer = (peerId: string) => {
  useRoom.setState((state) => {
    const updatedPeers = new Set(state.peers);
    updatedPeers.delete(peerId);
    const peers = Array.from(updatedPeers);
    return { peers, isReadyToComunicate: peers.length > 0 };
  })
}

export const onRoomClosed = () => {
  const roomId = uid.rnd();
  useRoom.setState({ roomId, isReadyToComunicate: false, peers: [], type: "sender" });
  caches.delete('sky-pack-files');
  const { userId } = useRoom.getState();
  socket.emit("CONNECT_ROOM", { roomId, userId });
}

socket.on("PEER_JOINED", addPeer);
socket.on("PEER_LEFT", removePeer);
socket.on("HOST_LEFT", onRoomClosed);