import { ReactNode, useMemo, useState } from "react";
import { HierarchyCircularNode } from "d3";
import { Tooltip } from "react-tooltip";

//import "react-tooltip/dist/react-tooltip.css";

import { shortify } from "../../scripts/utils";
import "./Flare.css";
import { FlareNode } from ".";
import { renderToString } from "react-dom/server";

const BreadcrumbTooltip = ({ children }: { children: ReactNode }) => {
  if (!children) return null;
  return (
    <span style={{ position: "relative" }}>
      <span
        data-tooltip-id="breadcrumb-tooltip"
        style={{ marginLeft: 3, marginRight: 3, cursor: "pointer" }}
      >
        ℹ️
      </span>
    </span>
  );
};

export const Breadcrumb = ({
  node,
  ContentComponent,
  onSegmentClick,
}: {
  node: HierarchyCircularNode<FlareNode> | null;
  ContentComponent: React.ComponentType<{
    data: any;
  }>;
  onSegmentClick: (arg0: any) => void;
}) => {
  if (!node) return null;
  const segments = [];
  let parent = node.parent;
  while (parent) {
    segments.push({ name: parent.data.name, node: parent });
    parent = parent.parent;
  }
  segments.unshift({ name: node.data.name, node });

  return (
    <>
      <ul style={{ marginTop: 20, marginLeft: "2rem" }} className="breadcrumbs">
        👉{" "}
        {segments.reverse().map((s, i, all) => {
          const htmlTooltip = renderToString(
            <ContentComponent data={s.node.data} />
          );
          const hasData = Object.keys(s.node.data).length > 2 && htmlTooltip;
          return (
            <li key={s.name + i}>
              <span
                onClick={() => {
                  onSegmentClick(s);
                }}
                title={s.name}
                style={{
                  cursor: i < all.length - 1 ? "pointer" : "none",
                  textDecoration: i < all.length - 1 ? "underline" : "none",
                }}
              >
                {shortify(s.name)}
              </span>
              {hasData && (
                <span style={{ position: "relative" }}>
                  <span
                    data-tooltip-id="breadcrumb-tooltip"
                    style={{ marginLeft: 3, marginRight: 3, cursor: "pointer" }}
                    //@ts-ignore
                    data-tooltip-html={htmlTooltip}
                  >
                    ℹ️
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>{" "}
      <Tooltip
        delayHide={3000}
        variant="light"
        place="bottom"
        id="breadcrumb-tooltip"
        // render={({ content }) => {
        //   return <div className="flare-hover-content">{content}</div>;
        // }}
      />
    </>
  );
};
