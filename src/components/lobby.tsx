import { QRCode } from "antd";

import { Clipboard } from "@/assets/clipboard";
import { ClipboardCopied } from "@/assets/clipboard-copied";

function Lobby() {
  return (
    <>
      <QRCode value="1234455" />
      <div className="flex gap-2 w-full p-1 py-2 border border-border justify-center rounded cursor-pointer hover:border-primary hover:border-dashed">
        <Clipboard />
        <ClipboardCopied color="#8789FE" />
        <div>
          Your Room ID:<b className="text-primary">1234</b>
        </div>
      </div>
    </>
  );
}

export default Lobby;
