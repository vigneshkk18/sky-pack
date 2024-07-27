import { create } from "zustand";

import { useRoom } from "@/hooks/useRoom";
import { usePeerConnection } from "@/hooks/usePeerConnection";

import { socket } from "@/socket";

import { processQueue, queue } from "@/utils/file-queue";

import { UseTransferHook } from "@/types/transfer";

export const useTransfer = create<UseTransferHook>(() => ({
  files: [],
  isInProcess: false,
  isTransferring: false,
  total: 0,
  sentOrRecieved: 0,
}));

export function resetTransfer() {
  useTransfer.setState({
    files: [],
    isInProcess: false,
    isTransferring: false,
    total: 0,
    sentOrRecieved: 0,
  });
}

export function updateFileProgress(idx: number, by: number) {
  useTransfer.setState((state) => {
    if (idx >= state.files.length) return {};
    const newFiles = [...state.files];
    newFiles[idx] = { ...newFiles[idx], sentOrRecieved: newFiles[idx].sentOrRecieved + by };
    return { files: newFiles, sentOrRecieved: state.sentOrRecieved + by };
  });
}

useTransfer.subscribe((state, prev) => {
  if (state.isTransferring === prev.isTransferring) return;
  if (!state.isTransferring || !queue.length) return;

  const recur = async () => {
    const { dataChannels: { files: fileChannels } } = usePeerConnection.getState();
    await processQueue(queue, Array.from(fileChannels.values()));
    if (queue.length) {
      await recur();
    } else {
      useTransfer.setState({ isTransferring: false, isInProcess: false });
      socket.emit("ROOM_ACCEPTS_PEERS", { roomId: useRoom.getState().roomId, canAccept: true });
    }
  }
  recur();
});
