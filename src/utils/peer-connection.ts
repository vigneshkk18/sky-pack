import { socket } from "@/socket";

import { show } from "@/hooks/useToast";
import { useRoom } from "@/hooks/useRoom";
import { usePeerConnection } from "@/hooks/usePeerConnection";

import { ServerToClientEvents } from "@/types/socket";

function createSenderPeerConnection(peerId: string, roomId: string, userId: string) {
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
  return { connection, common: commonDataChannel, files: filesChannel }
}

export function createRecieverPeerConnection(peerId: string, roomId: string, userId: string) {
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
  return connection
}

export const onHostLeft: ServerToClientEvents['HOST_LEFT'] = async () => {
  const { connections, dataChannels } = usePeerConnection.getState();

  dataChannels.common.forEach(dc => dc.close());
  dataChannels.files.forEach(dc => dc.close());

  connections.forEach(connection => connection.close())

  show({ text: "Host left the room", duration: 3000, variant: "destructive" });
  usePeerConnection.setState({ connections: new Map(), dataChannels: { common: new Map(), files: new Map() } });
}

export const onPeerJoined: ServerToClientEvents['PEER_JOINED'] = async (peerId) => {
  const { roomId, userId } = useRoom.getState();
  const { connections, dataChannels } = usePeerConnection.getState();

  const updatedConnections = new Map(connections);
  const updatedCommonChannels = new Map(dataChannels.common);
  const updatedFilesChannels = new Map(dataChannels.files);

  const { common, connection, files } = createSenderPeerConnection(peerId, roomId, userId);

  updatedFilesChannels.set(peerId, files);
  updatedCommonChannels.set(peerId, common);
  updatedConnections.set(peerId, connection);

  show({ text: "New user joined", duration: 3000, variant: "info" });
  usePeerConnection.setState({ connections: updatedConnections, dataChannels: { common: updatedCommonChannels, files: updatedFilesChannels } });
}

export const onPeerLeft: ServerToClientEvents['PEER_LEFT'] = async (peerId) => {
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

  show({ text: "User left", duration: 3000, variant: "info" });
  usePeerConnection.setState({ connections: updatedConnections, dataChannels: { common: updatedCommonChannels, files: updatedFilesChannels } });
}

export async function onNegotiationNeeded(this: RTCPeerConnection) {
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

export const onOffer: ServerToClientEvents['ON_OFFER'] = async (sdp, from, to) => {
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

export const onAnswer: ServerToClientEvents['ON_ANSWER'] = async (sdp, from, to) => {
  const { userId } = useRoom.getState();
  const { connections } = usePeerConnection.getState();
  const connection = connections.get(from);
  if (userId !== to || userId === from || !connection) return;
  await connection.setRemoteDescription(sdp);
}

export const onIce: ServerToClientEvents['ON_ICE'] = async (ice, from, to) => {
  const { userId } = useRoom.getState();
  const { connections } = usePeerConnection.getState();
  const connection = connections.get(from);
  if (userId !== to || userId === from || !connection) return;
  await connection.addIceCandidate(ice);
}