import { DefaultExtensionType, defaultStyles } from "react-file-icon";

import { updateFileProgress, useTransfer } from "@/hooks/useTransfer";

import { downloadFileFromBlob, putBlobToCache } from "@/utils/common";

import { Message } from "@/types/common-channel";
import { FileObject, TransferAck } from "@/types/transfer";

export function extractMetadata(files: File[], from: string): FileObject[] {
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

let arrayBufs = [] as ArrayBuffer[];
let buftype = "";
let idx = -1;

function onFileTransferStart(info: TransferAck) {
  arrayBufs = [];
  buftype = info.metadata.type;

  const files = useTransfer.getState().files;
  idx = files.findIndex(fi => fi.id === info.metadata.id);

  useTransfer.setState({ isInProcess: true, isTransferring: false });
}

function onFileTransferDone() {
  const blob = new Blob(arrayBufs, { type: buftype });
  const file = useTransfer.getState().files[idx];
  putBlobToCache(blob, `/${file.id}`);

  downloadFileFromBlob(blob, file.name);
  useTransfer.setState({ isInProcess: false, isTransferring: false });
}

export function onFileRecieved(ev: MessageEvent<Message>) {
  if (ev.data instanceof ArrayBuffer) {
    arrayBufs.push(ev.data);
    updateFileProgress(idx, ev.data.byteLength);
    return;
  }
  if (typeof ev.data !== "string") return;

  const info = JSON.parse(ev.data) as TransferAck;
  if (info.status !== "file-transfer-start" && info.status !== "file-transfer-done") return;

  if (info.status === "file-transfer-start") onFileTransferStart(info);
  else if (info.status === "file-transfer-done") onFileTransferDone();
}