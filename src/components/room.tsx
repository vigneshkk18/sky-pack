import { useMemo, useState } from "react";

import { useRoom } from "@/hooks/useRoom";
import { useTransfer } from "@/hooks/useTransfer";

import RoomFiles from "@/components/room-files";
import Tabs, { TabConfig } from "@/components/ui/tabs";

const tabsConfig: TabConfig[] = [
  { id: 0, label: "All Files" },
  { id: 1, label: "Sending" },
  { id: 2, label: "Recieving" },
  { id: 3, label: "Completed" },
];

function Room() {
  const [tab, setTab] = useState<number>(0);
  const { userId } = useRoom();
  const { files } = useTransfer();

  const filteredFiles = useMemo(() => {
    if (tab === 0) return files;
    if (tab === 1) {
      return files.filter((file) => file.from === userId);
    }
    if (tab === 2) {
      return files.filter((file) => file.from !== userId);
    }
    if (tab === 3) {
      return files.filter((file) => file.sentOrRecieved >= file.size);
    }
    return [];
  }, [tab, files, userId]);

  function onTabChange(newTab: number) {
    setTab(newTab);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs tab={tab} onTabChange={onTabChange} tabsConfig={tabsConfig} />
      <RoomFiles files={filteredFiles} />
    </div>
  );
}

export default Room;
