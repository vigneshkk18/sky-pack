import { IconType } from "react-file-icon";

declare global {
  interface File {
    id: string;
  }
}

export interface TransferAck {
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

export interface UseTransferHook {
  files: FileObject[];
  isInProcess: boolean;
  isTransferring: boolean;
  total: number;
  sentOrRecieved: number;
}
