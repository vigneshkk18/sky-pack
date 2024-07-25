import { DragEvent } from "react";
import { FileDrop } from "react-file-drop";

function FilesDrop() {
  function onDrop(files: FileList | null, event: DragEvent<HTMLDivElement>) {
    console.log(files, event);
  }

  return (
    <FileDrop className="absolute top-0 left-0 w-full h-full" onDrop={onDrop}>
      {null}
    </FileDrop>
  );
}

export default FilesDrop;
