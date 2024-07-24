import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

import { Tab } from "@/components/ui/tab";

export interface TabConfig {
  id: number;
  label: string;
}

interface Tabs {
  /** selected tab index */
  className?: string;
  tab: number;
  tabsConfig: TabConfig[];
  onTabChange: (tab: number) => void;
}

function Tabs({
  className = "",
  tab,
  tabsConfig,
  onTabChange,
}: PropsWithChildren<Tabs>) {
  const [activeElRect, setActiveElRect] = useState<DOMRect | null>(null);
  const tabRefs = useRef<Record<TabConfig["id"], HTMLLIElement | null>>({});

  useEffect(() => {
    const rect = tabRefs.current?.[tab]?.getBoundingClientRect();
    if (rect) {
      setActiveElRect(rect);
    }
  }, [tab]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredTab =
    tabRefs.current?.[hoveredIdx ?? -1]?.getBoundingClientRect();

  const onTabChangeHandler = (id: number) => () => {
    onTabChange(id);
  };

  function onHoverOut() {
    setHoveredIdx(null);
  }

  const onHover = (id: number) => () => {
    setHoveredIdx(id);
  };

  return (
    <ul
      onPointerLeave={onHoverOut}
      className={`${className} flex border-b border-border w-full`}
    >
      {tabsConfig.map((config) => (
        <Tab
          tab={config.id}
          key={config.id}
          ref={(el) => {
            tabRefs.current[config.id] = el;
          }}
          active={tab === config.id}
          onTabChange={onTabChangeHandler(config.id)}
          onFocus={onHover(config.id)}
          onPointerOver={onHover(config.id)}
        >
          {config.label}
        </Tab>
      ))}
      <TabHover hoveredTab={hoveredTab} />
      <ActiveTabIndicator activeElRect={activeElRect} />
    </ul>
  );
}

function TabHover({ hoveredTab }: { hoveredTab: DOMRect | undefined }) {
  const rect = hoveredTab
    ? {
        top: hoveredTab.top,
        left: hoveredTab.left,
        width: hoveredTab.width,
        height: hoveredTab.height,
      }
    : {};

  return (
    <AnimatePresence>
      {hoveredTab ? (
        <motion.div
          className="absolute top-0 left-0 bg-card-foreground/5 pointer-events-none"
          initial={{ ...rect, opacity: 0 }}
          animate={{ ...rect, opacity: 1 }}
          exit={{ ...rect, opacity: 0 }}
          transition={{ duration: 0.14 }}
        />
      ) : null}
    </AnimatePresence>
  );
}

function ActiveTabIndicator({
  activeElRect,
}: {
  activeElRect: DOMRect | null;
}) {
  const rect = activeElRect
    ? {
        top: activeElRect.top + activeElRect.height,
        left: activeElRect.left,
        width: activeElRect.width,
        height: 0,
        opacity: 0,
      }
    : {};

  return (
    <AnimatePresence>
      {activeElRect ? (
        <motion.div
          className="absolute top-0 left-0 bg-card-foreground/5 pointer-events-none border border-primary rounded"
          initial={{ ...rect, opacity: 0 }}
          animate={{ ...rect, opacity: 1 }}
          exit={{ ...rect, opacity: 0 }}
          transition={{ duration: 0.14 }}
        />
      ) : null}
    </AnimatePresence>
  );
}

export default Tabs;
