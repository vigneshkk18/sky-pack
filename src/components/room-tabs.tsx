import { useState } from "react";

import Tabs, { TabConfig } from "@/components/ui/tabs";

const tabsConfig: TabConfig[] = [
  { id: 0, label: "All Files" },
  { id: 1, label: "Sending" },
  { id: 2, label: "Recieving" },
  { id: 3, label: "Completed" },
];

function RoomTabs() {
  const [tab, setTab] = useState(0);

  function onTabChange(tab: number) {
    setTab(tab);
  }

  return <Tabs tab={tab} onTabChange={onTabChange} tabsConfig={tabsConfig} />;
}

export default RoomTabs;
