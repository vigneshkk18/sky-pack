import { useEffect } from "react";

import Lobby from "@/components/lobby";
import Header from "@/components/header";
import Connected from "@/components/room";
import FilesDrop from "@/components/files-drop";
import { Toaster } from "@/components/ui/toast";
import RoomFooter from "@/components/room-footer";
import Separator from "@/components/ui/separator";

import { initRoom, useRoom } from "@/hooks/useRoom";

import { leaveRoom } from "@/utils/room";

function App() {
  const roomObj = useRoom();

  useEffect(() => {
    initRoom();

    function beforeLeave() {
      leaveRoom();
      caches.delete("sky-pack-files");
    }

    window.addEventListener("beforeunload", beforeLeave);
    return () => {
      window.removeEventListener("beforeunload", beforeLeave);
    };
  }, []);

  if (!roomObj.isReady) return null;

  return (
    <div className="bg-card text-card-foreground md:shadow-2xl w-full md:max-w-screen-md h-full max-h-dvh md:max-h-[700px] md:rounded app-layout">
      <Toaster />
      <Header />
      <Separator />
      <main className="p-4 py-6 flex flex-col items-center gap-4 justify-center overflow-auto relative">
        {!roomObj.isReadyToComunicate && <Lobby roomId={roomObj.roomId} />}
        {roomObj.isReadyToComunicate && <Connected />}
        {roomObj.isReadyToComunicate && <FilesDrop />}
      </main>
      <RoomFooter />
    </div>
  );
}

export default App;
