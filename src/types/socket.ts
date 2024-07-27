export interface ServerToClientEvents {
  PEER_JOINED: (peerId: string) => void;
  PEER_LEFT: (peerId: string) => void;
  HOST_LEFT: (hostId: string) => void;

  ON_OFFER: (sdp: RTCSessionDescriptionInit, from: string, to: string) => void;
  ON_ANSWER: (sdp: RTCSessionDescriptionInit, from: string, to: string) => void;
  ON_ICE: (ice: RTCIceCandidate, from: string, to: string) => void;
}

export interface ClientToServerEvents {
  ROOM_EXIST: (_: { roomId: string }, cb: (exists: boolean) => void) => void;
  CONNECT_ROOM: (_: { roomId: string, userId: string }) => void;
  JOIN_ROOM: (_: { roomId: string, userId: string }, cb: (_: { roomId: string, userId: string, peers: string[] }) => void) => void;
  LEAVE_ROOM: (_: { roomId: string, userId: string }) => void;
  DISCONNECT_ROOM: (_: { roomId: string, userId: string }) => void;

  SEND_OFFER: (_: { roomId: string, from: string, to: string, sdp: RTCSessionDescriptionInit }) => void;
  SEND_ANSWER: (_: { roomId: string, from: string, to: string, sdp: RTCSessionDescriptionInit }) => void;
  SEND_ICE: (_: { roomId: string, from: string, to: string, ice: RTCIceCandidate }) => void;
}