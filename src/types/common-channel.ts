import { FileObject } from "@/hooks/useTransfer";


export type Message = {
  type: "FILE_QUEUE_ADDED",
  data: FileObject[];
} | {
  type: "FILE_QUEUE_REMOVED",
  data: FileObject[];
}