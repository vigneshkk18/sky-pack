import { useRoom } from "@/hooks/useRoom";

import { Logout } from "@/assets/logout";
import LogoNoBackground from "@/assets/logo-no-background";

import { leaveRoom } from "@/utils/room";

function Header() {
  const isReadyToComunicate = useRoom((state) => state.isReadyToComunicate);

  return (
    <header className="p-4 md:py-6 flex justify-between">
      <div className="w-10 h-10 hidden md:block"></div>
      <LogoNoBackground className="w-11/12 max-w-40 md:mx-auto md:w-52" />
      <button
        onClick={leaveRoom}
        disabled={!isReadyToComunicate}
        className={`border-none outline-0 focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary/80 bg-destructive text-destructive-foreground p-2 rounded hover:bg-destructive/90 ${
          isReadyToComunicate ? "" : "invisible pointer-events-none"
        }`}
      >
        <Logout color="#ffffff" />
      </button>
    </header>
  );
}

export default Header;
