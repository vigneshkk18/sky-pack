import { create } from "zustand";
import ShortUniqueId from "short-unique-id";
import { DefaultExtensionType, IconType, defaultStyles } from "react-file-icon";

import { useRoom } from "@/hooks/useRoom";
import { usePeerConnection } from "@/hooks/usePeerConnection";

import { Message } from "@/types/common-channel";

const uid = new ShortUniqueId();

declare global {
  interface File {
    id: string;
  }
}

interface TransferAck {
  status: "file-transfer-done" | "file-transfer-start", metadata: FileObject;
}

export interface FileObject {
  id: string;
  name: string;
  type: string;
  size: number;
  sentOrRecieved: number;
  from: string;
  isDone: boolean;
  icon: {
    type: IconType;
    extension: string;
  }
}

interface UseTransferHook {
  files: FileObject[];
  isInProcess: boolean;
  isTransferring: boolean;
  total: number;
  sentOrRecieved: number;
}

let queue: File[] = [];

export const useTransfer = create<UseTransferHook>(() => ({
  files: [],
  isInProcess: false,
  isTransferring: false,
  total: 0,
  sentOrRecieved: 0,
}));

usePeerConnection.subscribe((state) => {
  const common = state.dataChannels.common;
  if (common.size) {
    common.forEach(ch => {
      ch.onmessage = (ev) => {
        if (typeof ev.data !== "string") return;
        const data = JSON.parse(ev.data) as Message;
        if (data.type === "FILE_QUEUE_ADDED") {
          useTransfer.setState((state) => {
            const files = [...state.files, ...data.data];
            const newFilesSize = data.data.reduce((total, fi) => total + fi.size, 0);
            return { files, total: state.total + newFilesSize };
          })
        }
        if (data.type === "FILE_QUEUE_REMOVED") {
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

            const newFilesSize = data.data.reduce((total, fi) => total + fi.size, 0);
            return { files: updatedFiles, total: state.total - removedFilesSize };
          })
        }
      }
    })
  }

  const channels = state.dataChannels.files;
  if (!channels.size) return;
  channels.forEach(ch => {
    let arrayBufs = [] as ArrayBuffer[];
    let buftype = "";
    let idx = -1;
    ch.onmessage = (ev) => {
      if (ev.data instanceof ArrayBuffer) {
        arrayBufs.push(ev.data);
        updateFileProgress(idx, ev.data.byteLength);
        return;
      }
      if (typeof ev.data !== "string") return;
      const info = JSON.parse(ev.data) as TransferAck;
      if (info.status !== "file-transfer-start" && info.status !== "file-transfer-done") return;
      if (info.status === "file-transfer-start") {
        arrayBufs = [];
        buftype = info.metadata.type;
        const files = useTransfer.getState().files;
        idx = files.findIndex(fi => fi.id === info.metadata.id);
        useTransfer.setState({ isInProcess: true, isTransferring: false });
        return;
      }
      if (info.status === "file-transfer-done") {
        const blob = new Blob(arrayBufs, { type: buftype });
        const file = useTransfer.getState().files[idx];
        caches.open('sky-pack-files').then((cache) => {
          cache.put(`/${file.id}`, new Response(blob, {
            headers: {
              'Content-Type': buftype,
              'Content-Length': String(blob.size)
            }
          }))
        })

        const data = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = data;
        link.download = file.name;
        link.click();
        useTransfer.setState({ isInProcess: false, isTransferring: false });
      }
    }
  })
});

function updateFileProgress(idx: number, by: number) {
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
  const { dataChannels: { files: fileChannels } } = usePeerConnection.getState();
  function processQueue(queue: File[]) {
    return new Promise(async (resolve, reject) => {
      while (queue.length) {
        const file = queue.shift();
        const files = useTransfer.getState().files;
        const idx = files.findIndex(fi => fi.id === file?.id);
        const metadata = idx < files.length ? files[idx] : null;
        const arrayBuffer = await file?.arrayBuffer();
        const fragmentSize = 65535;
        if (!arrayBuffer || !metadata || idx < 0) {
          continue;
        }
        const filePromise = new Promise(async (resolve, reject) => {
          for await (const dc of fileChannels.values()) {
            const abortController = new AbortController();
            let currentWindow = 0, totalWindow = Math.ceil(arrayBuffer.byteLength / fragmentSize);
            dc.addEventListener("bufferedamountlow", () => {
              if (currentWindow === totalWindow) {
                dc.send(JSON.stringify({ status: "file-transfer-done", metadata }));
                currentWindow++;
                resolve('done');
                abortController.abort();
                return;
              }
              const start = fragmentSize * currentWindow;
              const bufToSend = arrayBuffer.slice(start, start + fragmentSize);
              dc.send(bufToSend);
              updateFileProgress(idx, bufToSend.byteLength);
              currentWindow++;
            }, { signal: abortController.signal });

            const start = fragmentSize * currentWindow;
            dc.send(JSON.stringify({ status: "file-transfer-start", metadata }));
            const bufToSend = arrayBuffer.slice(start, start + fragmentSize);
            dc.send(bufToSend);
            updateFileProgress(idx, bufToSend.byteLength);
            currentWindow++;
          }
        });
        await filePromise;
      }
      resolve('done');
    });
  }
  const recur = async () => {
    await processQueue(queue)
    if (queue.length) {
      await recur();
    } else {
      useTransfer.setState({ isTransferring: false, isInProcess: false });
    }
  }
  recur();
});

function extractMetadata(files: File[], from: string): FileObject[] {
  return files.map(file => {
    const split = file.type.split('/');
    const fileType = split[split.length - 1] as DefaultExtensionType;
    return {
      from,
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      sentOrRecieved: 0,
      isDone: false,
      icon: {
        type: (defaultStyles[fileType])?.type ?? "binary",
        extension: `.${fileType}`
      }
    }
  })
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
      useTransfer.setState({ files: updatedFiles, total: total - removedFile.size });
    }
    return true;
  }
  return false;
}

export function downloadFile(fileId: string, name: string) {
  caches.open('sky-pack-files').then((cache) => {
    cache.match(`/${fileId}`).then(async (res) => {
      const blob = await res?.blob();
      if (!blob) return;
      const data = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = data;
      link.download = name;
      link.click();
    });
  });
}

export function addFilesToQueue(files: FileList) {
  const { userId } = useRoom.getState();
  const { files: oldFilesMetadata, total: oldTotal } = useTransfer.getState();
  const newFiles = new Array(files.length).fill(0).map((_, idx) => {
    const file = files.item(idx);
    if (file) file.id = uid.rnd();
    return file;
  }).filter(file => !!file) as File[];
  queue = queue.concat(newFiles);

  const newFilesMetadata = extractMetadata(newFiles, userId);
  const filesMetadata = oldFilesMetadata.concat(newFilesMetadata);
  const total = newFiles.reduce((total, file) => total + file.size, 0);

  sendQueueInfoToPeers("FILE_QUEUE_ADDED", newFilesMetadata);
  useTransfer.setState({ files: filesMetadata, isInProcess: true, isTransferring: true, total: oldTotal + total });
}