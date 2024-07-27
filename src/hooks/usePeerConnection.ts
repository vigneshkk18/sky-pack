import { socket } from "@/socket";
import { create } from "zustand";
import { useRoom } from "@/hooks/useRoom";
import { ServerToClientEvents } from "@/types/socket";

declare global {
  interface RTCPeerConnection {
    id: string;
  }
}

interface PeerConnectionHook {
  connections: Map<string, RTCPeerConnection>;
  dataChannels: { common: Map<string, RTCDataChannel>, files: Map<string, RTCDataChannel> };
}

export const usePeerConnection = create<PeerConnectionHook>(() => ({ connections: new Map(), dataChannels: { common: new Map(), files: new Map() } }));

export async function setupConnection(peerIds: string[]) {
  const { roomId, userId } = useRoom.getState();
  const connections: PeerConnectionHook['connections'] = new Map();

  peerIds.forEach((peerId) => {
    const connection = new RTCPeerConnection();

    connection.onicecandidate = (ev) => {
      if (ev.candidate) {
        socket.emit("SEND_ICE", { roomId, from: userId, to: peerId, ice: ev.candidate });
      }
    }

    connection.ondatachannel = (ev) => {
      const updatedDataChannels = usePeerConnection.getState().dataChannels;
      const updatedFiles = new Map(updatedDataChannels.files);
      const updatedCommon = new Map(updatedDataChannels.common);

      if (ev.channel.label === "COMMON") {
        updatedCommon.set(peerId, ev.channel);
      } else if (ev.channel.label === "FILES") {
        updatedFiles.set(peerId, ev.channel);
      }

      usePeerConnection.setState({ dataChannels: { files: updatedFiles, common: updatedCommon } });
    }

    connection.addEventListener("negotiationneeded", onNegotiationNeeded);
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

socket.on("PEER_JOINED", async (peerId) => {
  const { roomId, userId } = useRoom.getState();
  const { connections, dataChannels } = usePeerConnection.getState();
  const updatedConnections = new Map(connections);
  const updatedCommonChannels = new Map(dataChannels.common);
  const updatedFilesChannels = new Map(dataChannels.files);
  const connection = new RTCPeerConnection();
  connection.id = peerId;
  const commonDataChannel = connection.createDataChannel('COMMON');
  const filesChannel = connection.createDataChannel('FILES');
  filesChannel.binaryType = "arraybuffer";
  filesChannel.bufferedAmountLowThreshold = 0;

  connection.onicecandidate = (ev) => {
    if (ev.candidate) {
      socket.emit("SEND_ICE", { roomId, from: userId, to: peerId, ice: ev.candidate });
    }
  }

  connection.addEventListener("negotiationneeded", onNegotiationNeeded);

  updatedConnections.set(peerId, connection);
  updatedCommonChannels.set(peerId, commonDataChannel);
  updatedFilesChannels.set(peerId, filesChannel);

  usePeerConnection.setState({ connections: updatedConnections, dataChannels: { common: updatedCommonChannels, files: updatedFilesChannels } });
});

socket.on("PEER_LEFT", async (peerId) => {
  const { connections, dataChannels } = usePeerConnection.getState();
  const updatedConnections = new Map(connections);
  const updatedCommonChannels = new Map(dataChannels.common);
  const updatedFilesChannels = new Map(dataChannels.files);

  updatedFilesChannels.get(peerId)?.close();
  updatedCommonChannels.get(peerId)?.close();
  updatedConnections.get(peerId)?.close();

  updatedConnections.delete(peerId);
  updatedCommonChannels.delete(peerId);
  updatedFilesChannels.delete(peerId);

  usePeerConnection.setState({ connections: updatedConnections, dataChannels: { common: updatedCommonChannels, files: updatedFilesChannels } });
});

socket.on("HOST_LEFT", async () => {
  const { connections, dataChannels } = usePeerConnection.getState();

  dataChannels.common.forEach(dc => dc.close());
  dataChannels.files.forEach(dc => dc.close());

  connections.forEach(connection => connection.close())

  usePeerConnection.setState({ connections: new Map(), dataChannels: { common: new Map(), files: new Map() } });
})

async function onNegotiationNeeded(this: RTCPeerConnection) {
  const { roomId, userId } = useRoom.getState();
  const offer = await this.createOffer();
  await this.setLocalDescription(offer);

  socket.emit("SEND_OFFER", {
    roomId,
    from: userId,
    sdp: offer,
    to: this.id,
  });
}

const onOffer: ServerToClientEvents['ON_OFFER'] = async (sdp, from, to) => {
  const { roomId, userId } = useRoom.getState();
  const { connections } = usePeerConnection.getState();
  const connection = connections.get(from);
  if (userId !== to || userId === from || !connection) return;
  await connection.setRemoteDescription(sdp);

  connection.onicecandidate = (ev) => {
    if (ev.candidate) {
      socket.emit("SEND_ICE", {
        roomId, from: userId, to: from, ice: ev.candidate
      })
    }
  }

  const answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
  socket.emit("SEND_ANSWER", { roomId, from: userId, to: from, sdp: answer });
}

const onAnswer: ServerToClientEvents['ON_ANSWER'] = async (sdp, from, to) => {
  const { userId } = useRoom.getState();
  const { connections } = usePeerConnection.getState();
  const connection = connections.get(from);
  if (userId !== to || userId === from || !connection) return;
  await connection.setRemoteDescription(sdp);
}

const onIce: ServerToClientEvents['ON_ICE'] = async (ice, from, to) => {
  const { userId } = useRoom.getState();
  const { connections } = usePeerConnection.getState();
  const connection = connections.get(from);
  if (userId !== to || userId === from || !connection) return;
  await connection.addIceCandidate(ice);
}

socket.on("ON_OFFER", onOffer);
socket.on("ON_ANSWER", onAnswer);
socket.on("ON_ICE", onIce);