import ShortUniqueId from "short-unique-id";

import { show } from "@/hooks/useToast";
import { useRoom } from "@/hooks/useRoom";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { updateFileProgress, useTransfer } from "@/hooks/useTransfer";

import { socket } from "@/socket";

import { extractMetadata } from "@/utils/transfer";

import { FileObject } from "@/types/transfer";
import { Message } from "@/types/common-channel";

const uid = new ShortUniqueId();

export let queue: File[] = [];

function transformFileListToFileArray(files: FileList) {
  return new Array(files.length).fill(0).map((_, idx) => {
    const file = files.item(idx);
    if (file) file.id = uid.rnd();
    return file;
  }).filter(file => !!file) as File[];
}

export function addFilesToQueue(files: FileList) {
  const { userId, roomId } = useRoom.getState();
  const { files: oldFilesMetadata, total: oldTotal } = useTransfer.getState();

  const newFiles = transformFileListToFileArray(files);
  queue = queue.concat(newFiles);

  const newFilesMetadata = extractMetadata(newFiles, userId);
  const filesMetadata = oldFilesMetadata.concat(newFilesMetadata);
  const total = newFiles.reduce((total, file) => total + file.size, 0);

  sendQueueInfoToPeers("FILE_QUEUE_ADDED", newFilesMetadata);
  show({ text: `${newFiles.length} new files added to queue`, duration: 3000, variant: "success" })
  useTransfer.setState({ files: filesMetadata, isInProcess: true, isTransferring: true, total: oldTotal + total });
  socket.emit("ROOM_ACCEPTS_PEERS", { roomId, canAccept: false });
}

function sendQueueInfoToPeers(type: Message['type'], filesMetadata: FileObject[]) {
  const { dataChannels } = usePeerConnection.getState();
  dataChannels.common.forEach(ch => {
    ch.send(JSON.stringify({ type, data: filesMetadata } as Message))
  })
}

export function removeFileFromQueue(id: string) {
  const idx = queue.findIndex(fi => fi.id === id);
  if (idx >= 0) {
    const file = queue[idx];
    queue.splice(idx, 1);
    const { files, total } = useTransfer.getState();
    const updatedFiles: FileObject[] = [];
    let removedFile = null as FileObject | null;
    files.forEach(fi => {
      if (fi.id === file.id) {
        removedFile = fi;
      } else {
        updatedFiles.push(fi);
      }
    });
    if (removedFile) {
      sendQueueInfoToPeers("FILE_QUEUE_REMOVED", [removedFile]);
      show({ text: `File removed from queue`, duration: 3000, variant: "destructive" })
      useTransfer.setState({ files: updatedFiles, total: total - removedFile.size });
    }
    return true;
  }
  return false;
}

export function onFileQueueChange(ev: MessageEvent<Message>) {
  if (typeof ev.data !== "string") return;
  const data = JSON.parse(ev.data) as Message;
  if (data.type === "FILE_QUEUE_ADDED") onFileAddedToQueue(data);
  if (data.type === "FILE_QUEUE_REMOVED") onFileRemovedFromQueue(data);
}

function onFileAddedToQueue(data: Message) {
  useTransfer.setState((state) => {
    const files = [...state.files, ...data.data];
    const newFilesSize = data.data.reduce((total, fi) => total + fi.size, 0);
    show({ text: `${data.data.length} new files added to queue`, duration: 3000, variant: "success" })
    return { files, total: state.total + newFilesSize };
  })
}

function onFileRemovedFromQueue(data: Message) {
  useTransfer.setState((state) => {
    const filesToRemove = new Set(data.data.map(fi => fi.id));
    const updatedFiles: FileObject[] = [];
    let removedFilesSize = 0;

    state.files.forEach(fi => {
      if (filesToRemove.has(fi.id)) {
        removedFilesSize += fi.size;
      } else {
        updatedFiles.push(fi);
      }
    })

    show({ text: `File removed from queue`, duration: 3000, variant: "destructive" })
    return { files: updatedFiles, total: state.total - removedFilesSize };
  })
}

const FRAGMENT_SIZE = 65535;

function sendBufferToPeer(buffer: ArrayBuffer, dc: RTCDataChannel, metadata: FileObject, idx: number) {
  return new Promise((resolve) => {
    const abortController = new AbortController();
    let currentWindow = 0, totalWindow = Math.ceil(buffer.byteLength / FRAGMENT_SIZE);

    dc.addEventListener("bufferedamountlow", () => {
      if (currentWindow === totalWindow) {
        dc.send(JSON.stringify({ status: "file-transfer-done", metadata }));
        currentWindow++;
        abortController.abort();
        resolve('done');
        return;
      }

      const start = FRAGMENT_SIZE * currentWindow;
      const bufToSend = buffer.slice(start, start + FRAGMENT_SIZE);

      dc.send(bufToSend);
      updateFileProgress(idx, bufToSend.byteLength);
      currentWindow++;
    }, { signal: abortController.signal });

    const start = FRAGMENT_SIZE * currentWindow;

    dc.send(JSON.stringify({ status: "file-transfer-start", metadata }));

    const bufToSend = buffer.slice(start, start + FRAGMENT_SIZE);
    dc.send(bufToSend);

    updateFileProgress(idx, bufToSend.byteLength);
    currentWindow++;
  })
}

export function processQueue(queue: File[], channels: RTCDataChannel[]) {
  return new Promise(async (resolve) => {
    while (queue.length) {
      const file = queue.shift();

      const files = useTransfer.getState().files;
      const idx = files.findIndex(fi => fi.id === file?.id);

      const metadata = idx < files.length ? files[idx] : null;

      const arrayBuffer = await file?.arrayBuffer();

      if (!arrayBuffer || !metadata || idx < 0) {
        continue;
      }

      for await (const dc of channels) {
        await sendBufferToPeer(arrayBuffer, dc, metadata, idx);
      }
    }
    resolve('done')
  })
}