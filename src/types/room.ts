export interface Room {
  isReady: boolean;
  type: "sender" | "reciever";
  /** Will be true when there are people in room */
  isReadyToComunicate: boolean;
  roomId: string;
  userId: string;
  peers: string[];
}