declare global {
  interface RTCPeerConnection {
    id: string;
  }
}

export interface PeerConnectionHook {
  connections: Map<string, RTCPeerConnection>;
  dataChannels: { common: Map<string, RTCDataChannel>, files: Map<string, RTCDataChannel> };
}