import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

import { Tab } from "@/components/ui/tab";

import { ArrowLeft } from "@/assets/arrow-left";
import { ArrowRight } from "@/assets/arrow-right";

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
  const [activeElRect, setActiveElRect] = useState<{
    id: number;
    rect: DOMRect | null;
  }>({ id: 0, rect: null });
  const [hoverElRect, setHoverElRect] = useState<{
    id: number;
    rect: DOMRect | null;
  }>({ id: 0, rect: null });
  const tabContainerRef = useRef<HTMLUListElement>(null);
  const tabRefs = useRef<Record<TabConfig["id"], HTMLLIElement | null>>({});

  useEffect(() => {
    function onResize() {
      setActiveElRect((prev) => {
        if (!prev.rect) return prev;
        return {
          ...prev,
          rect: tabRefs.current[prev.id]?.getBoundingClientRect() ?? null,
        };
      });

      setHoverElRect((prev) => {
        if (!prev.rect) return prev;
        return {
          ...prev,
          rect: tabRefs.current[prev.id]?.getBoundingClientRect() ?? null,
        };
      });
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const rect = tabRefs.current?.[tab]?.getBoundingClientRect();
    if (rect) {
      setActiveElRect({ id: tab, rect: rect });
    }
  }, [tab]);

  const container = tabContainerRef.current?.getBoundingClientRect();

  const onTabChangeHandler = (id: number) => () => {
    onTabChange(id);
  };

  function onHoverOut() {
    setHoverElRect({ id: 0, rect: null });
  }

  const onHover = (id: number) => () => {
    const hoverElRect = tabRefs.current?.[id ?? -1]?.getBoundingClientRect();
    setHoverElRect({ id, rect: hoverElRect ?? null });
  };

  const scrollTabsContainer = (dir: "left" | "right") => () => {
    const container = tabContainerRef.current;
    if (!container) return;
    container.scrollTo({
      left: dir === "left" ? 0 : container.scrollWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full flex gap-[2px]">
      <button
        onClick={scrollTabsContainer("left")}
        className="block md:hidden bg-background-2 rounded"
      >
        <ArrowLeft />
      </button>
      <ul
        onPointerLeave={onHoverOut}
        ref={tabContainerRef}
        className={`${className} no-scrollbar flex border-b border-border w-full relative pointer-events-auto overflow-auto`}
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
        <TabHover hoveredTab={hoverElRect.rect} container={container} />
        <ActiveTabIndicator
          activeElRect={activeElRect.rect}
          container={container}
        />
      </ul>
      <button
        onClick={scrollTabsContainer("right")}
        className="block md:hidden bg-background-2 rounded"
      >
        <ArrowRight />
      </button>
    </div>
  );
}

function TabHover({
  hoveredTab,
  container,
}: {
  hoveredTab: DOMRect | null;
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
        top: activeElRect.height - 2,
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
          className="bg-card-foreground/5 pointer-events-none border border-primary rounded absolute"
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
