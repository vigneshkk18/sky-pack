import { create } from "zustand";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ dictionary: "number", length: 6 });

type Room = {
  isReady: false;
} | {
  isReady: true;
  roomId: string;
}

const store: Room = { isReady: false };

export const useRoom = create<Room>(() => store);

export const initRoom = () => {
  useRoom.setState({ roomId: uid.rnd(), isReady: true });
}

export const joinRoom = (roomId: string) => {
  useRoom.setState({ roomId: roomId });
}