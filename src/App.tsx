import { useEffect } from "react";

import Lobby from "@/components/lobby";
import Connected from "@/components/room";
import RoomFooter from "@/components/room-footer";
import Separator from "@/components/ui/separator";

import { initRoom, leaveRoom, useRoom } from "@/hooks/useRoom";

import LogoNoBackground from "@/assets/logo-no-background";

function App() {
  const roomObj = useRoom();

  useEffect(() => {
    initRoom();

    function beforeLeave() {
      leaveRoom();
    }

    window.addEventListener("beforeunload", beforeLeave);
    return () => {
      window.removeEventListener("beforeunload", beforeLeave);
    };
  }, []);

  if (!roomObj.isReady) return null;

  return (
    <div className="bg-card text-card-foreground md:shadow-2xl w-full md:max-w-screen-md h-full md:h-auto md:rounded flex flex-col">
      <header className="p-4 py-6">
        <LogoNoBackground className="w-11/12 max-w-52 md:mx-auto md:w-52" />
      </header>
      <Separator />
      <main className="p-4 py-6 flex flex-col items-center gap-4 justify-center flex-grow">
        {!roomObj.isReadyToComunicate && <Lobby roomId={roomObj.roomId} />}
        {/* <Connected /> */}
      </main>
      <RoomFooter />
    </div>
  );
}

export default App;
