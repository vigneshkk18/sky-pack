import { create } from "zustand";

import { useRoom } from "@/hooks/useRoom";

import { socket } from "@/socket";

import { onFileRecieved } from "@/utils/transfer";
import { onFileQueueChange } from "@/utils/file-queue";
import { createRecieverPeerConnection, onAnswer, onHostLeft, onIce, onOffer, onPeerJoined, onPeerLeft } from "@/utils/peer-connection";

import { PeerConnectionHook } from "@/types/peer-connection";

export const usePeerConnection = create<PeerConnectionHook>(() => ({ connections: new Map(), dataChannels: { common: new Map(), files: new Map() } }));

export function resetConnection() {
  usePeerConnection.setState({ connections: new Map(), dataChannels: { common: new Map(), files: new Map() } })
}

export async function setupConnection(peerIds: string[]) {
  const { roomId, userId } = useRoom.getState();
  const connections: PeerConnectionHook['connections'] = new Map();

  peerIds.forEach((peerId) => {
    const connection = createRecieverPeerConnection(peerId, roomId, userId);
    connections.set(peerId, connection);
  });

  usePeerConnection.setState({ connections });
}

export function destroyConnections() {
  const { connections, dataChannels } = usePeerConnection.getState();

  dataChannels.common.forEach(dc => dc.close());
  dataChannels.files.forEach(dc => dc.close());
  connections.forEach(c => c.close());

  usePeerConnection.setState({ connections: new Map(), dataChannels: { common: new Map(), files: new Map() } })
}

usePeerConnection.subscribe((state) => {
  const common = state.dataChannels.common;
  if (common.size) {
    common.forEach(ch => {
      ch.onmessage = onFileQueueChange;
    })
  }

  const channels = state.dataChannels.files;
  if (!channels.size) return;
  channels.forEach(ch => {
    ch.onmessage = onFileRecieved;
  })
});

socket.on("PEER_JOINED", onPeerJoined);
socket.on("PEER_LEFT", onPeerLeft);
socket.on("HOST_LEFT", onHostLeft)
socket.on("ON_OFFER", onOffer);
socket.on("ON_ANSWER", onAnswer);
socket.on("ON_ICE", onIce);