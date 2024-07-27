export interface ServerToClientEvents {
  PEER_JOINED: (peerId: string) => void;
  PEER_LEFT: (peerId: string) => void;
  HOST_LEFT: (hostId: string) => void;

  ON_OFFER: (sdp: RTCSessionDescriptionInit, from: string, to: string) => void;
  ON_ANSWER: (sdp: RTCSessionDescriptionInit, from: string, to: string) => void;
  ON_ICE: (ice: RTCIceCandidate, from: string, to: string) => void;
}

export interface ClientToServerEvents {
  CONNECT_ROOM: (_: { roomId: string, userId: string }) => void;
  JOIN_ROOM: (_: { roomId: string, userId: string }, cb: (_: { roomId: string, userId: string, peers: string[] }) => void) => void;
  LEAVE_ROOM: (_: { roomId: string, userId: string }) => void;
  DISCONNECT_ROOM: (_: { roomId: string, userId: string }) => void;
  ROOM_EXISTS: (_: { roomId: string }, cb: (canJoin: boolean) => void) => void;
  CAN_JOIN_ROOM: (_: { roomId: string }, cb: (canJoin: boolean) => void) => void;
  ROOM_ACCEPTS_PEERS: (_: { roomId: string, canAccept: boolean; }) => void;

  SEND_OFFER: (_: { roomId: string, from: string, to: string, sdp: RTCSessionDescriptionInit }) => void;
  SEND_ANSWER: (_: { roomId: string, from: string, to: string, sdp: RTCSessionDescriptionInit }) => void;
  SEND_ICE: (_: { roomId: string, from: string, to: string, ice: RTCIceCandidate }) => void;
}