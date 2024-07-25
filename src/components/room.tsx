import { useState } from "react";
import ShortUniqueId from "short-unique-id";

import Tabs, { TabConfig } from "@/components/ui/tabs";
import RoomFiles from "@/components/room-files";

const tabsConfig: TabConfig[] = [
  { id: 0, label: "All Files" },
  { id: 1, label: "Sending" },
  { id: 2, label: "Recieving" },
  { id: 3, label: "Completed" },
];

const defaultFiles = [
  new ShortUniqueId().rnd(),
  new ShortUniqueId().rnd(),
  new ShortUniqueId().rnd(),
  new ShortUniqueId().rnd(),
];

function Room() {
  const [tab, setTab] = useState<[number, number]>([0, 0]);
  const [files, setFiles] = useState<string[]>(defaultFiles);

  function onTabChange(newTab: number) {
    setTab([newTab, newTab - tab[0]]);
  }
  console.log(tab);
  return (
    <div className="w-full h-full md:h-max">
      {/* <FilesDrop /> */}
      <Tabs tab={tab[0]} onTabChange={onTabChange} tabsConfig={tabsConfig} />
      <RoomFiles files={files} />
    </div>
  );
}

export default Room;
