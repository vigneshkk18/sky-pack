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
  const tabContainerRef = useRef<HTMLUListElement>(null);
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
  const container = tabContainerRef.current?.getBoundingClientRect();

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
      ref={tabContainerRef}
      className={`${className} flex border-b border-border w-full relative pointer-events-auto`}
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
      <TabHover hoveredTab={hoveredTab} container={container} />
      <ActiveTabIndicator activeElRect={activeElRect} container={container} />
    </ul>
  );
}

function TabHover({
  hoveredTab,
  container,
}: {
  hoveredTab: DOMRect | undefined;
  container: DOMRect | undefined;
}) {
  const rect = hoveredTab
    ? {
        top: 0,
        left: hoveredTab.left - (container?.left ?? 0),
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
  container,
}: {
  activeElRect: DOMRect | null;
  container: DOMRect | undefined;
}) {
  const rect = activeElRect
    ? {
        bottom: 0,
        left: activeElRect.left - (container?.left ?? 0),
        width: activeElRect.width,
        height: 0,
        opacity: 0,
      }
    : {};

  return (
    <AnimatePresence>
      {activeElRect ? (
        <motion.div
          className="bg-card-foreground/5 pointer-events-none border border-primary rounded absolute translate-y-[1px]"
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