import { create } from "zustand";
import ShortUniqueId from "short-unique-id";

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
}

export const joinRoom = (roomId: string) => {
  const { userId } = useRoom.getState();
  socket.emit("JOIN_ROOM", { roomId, userId }, ({ roomId, peers }) => {
    useRoom.setState({ roomId: roomId, peers, isReadyToComunicate: true, type: "reciever" });
  })
}

export const leaveRoom = () => {
  const { roomId, userId, type } = useRoom.getState();
  socket.emit(type === "reciever" ? "LEAVE_ROOM" : "DISCONNECT_ROOM", { roomId, userId });
  if (type === "sender") {
    const newRoomId = createRoom();
    socket.emit("CONNECT_ROOM", { roomId: newRoomId, userId });
  }
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
    console.log(peerId, peers);
    return { peers, isReadyToComunicate: peers.length > 0 };
  })
}

export const onRoomClosed = () => {
  const roomId = uid.rnd();
  useRoom.setState({ roomId, isReadyToComunicate: false, peers: [], type: "sender" });
  const { userId } = useRoom.getState();
  socket.emit("CONNECT_ROOM", { roomId, userId });
}

socket.on("PEER_JOINED", addPeer);
socket.on("PEER_LEFT", removePeer);
socket.on("HOST_LEFT", onRoomClosed);