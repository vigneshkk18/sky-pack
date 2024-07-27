import { create } from "zustand";
import ShortUniqueId from "short-unique-id";

import { initSocket, socket } from "@/socket";

import { Room } from "@/types/room";

const uid = new ShortUniqueId({ dictionary: "number", length: 6 });

const store: Room = {
  isReady: true,
  type: "sender",
  isReadyToComunicate: false,
  roomId: uid.rnd(),
  userId: uid.rnd(),
  peers: []
};

export const useRoom = create(() => store);

export const initRoom = () => {
  initSocket();
  const { roomId, userId } = useRoom.getState();
  socket.emit("CONNECT_ROOM", { roomId, userId });
  socket.emit("ROOM_ACCEPTS_PEERS", { roomId, canAccept: true });
}

const addPeer = (peerId: string) => {
  useRoom.setState((state) => {
    const peers = Array.from(new Set([...state.peers, peerId]))
    return { peers, isReadyToComunicate: peers.length > 0 }
  })
}

const removePeer = (peerId: string) => {
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