import Connected from "@/components/room";
import RoomFooter from "@/components/room-footer";
import Separator from "@/components/ui/separator";

import LogoNoBackground from "@/assets/logo-no-background";

function App() {
  return (
    <div className="bg-card text-card-foreground md:shadow-2xl w-full md:max-w-screen-md h-full md:h-auto md:rounded flex flex-col">
      <header className="p-4 py-6">
        <LogoNoBackground className="w-11/12 max-w-52 md:mx-auto md:w-52" />
      </header>
      <Separator />
      <main className="p-4 flex flex-col items-center gap-4 justify-center flex-grow">
        {/* <Lobby /> */}
        <Connected />
      </main>
      <RoomFooter />
    </div>
  );
}

export default App;
