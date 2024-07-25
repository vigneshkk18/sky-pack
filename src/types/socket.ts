export interface ServerToClientEvents {
  PEER_JOINED: (peerId: string) => void;
  PEER_LEFT: (peerId: string) => void;
  HOST_LEFT: (hostId: string) => void;
}

export interface ClientToServerEvents {
  CONNECT_ROOM: (_: { roomId: string, userId: string }) => void;
  JOIN_ROOM: (_: { roomId: string, userId: string }, cb: (_: { roomId: string, userId: string, peers: string[] }) => void) => void;
  LEAVE_ROOM: (_: { roomId: string, userId: string }) => void;
  DISCONNECT_ROOM: (_: { roomId: string, userId: string }) => void;
}