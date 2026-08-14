"use client";
import React, { useState } from "react";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
}

export function Tabs({ children }: TabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="tabs-wrapper">
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIdx}
            data-active={i === activeIdx ? "true" : "false"}
            className="tab-trigger"
            onClick={() => setActiveIdx(i)}
            id={`tab-trigger-${i}`}
            aria-controls={`tab-panel-${i}`}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`tab-panel-${i}`}
          aria-labelledby={`tab-trigger-${i}`}
          className="tab-panel"
          data-active={i === activeIdx ? "true" : "false"}
        >
          <div className="tab-content">{tab.props.children}</div>
        </div>
      ))}
    </div>
  );
}
