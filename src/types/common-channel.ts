import { FileObject } from "@/types/transfer";

export type Message = {
  type: "FILE_QUEUE_ADDED",
  data: FileObject[];
} | {
  type: "FILE_QUEUE_REMOVED",
  data: FileObject[];
}