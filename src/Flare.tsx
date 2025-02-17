import { useEffect, useMemo, useRef, useState } from "react";
import { animated, SpringValue, useSpring } from "@react-spring/web";
import * as d3 from "d3";

import "./Flare.css";
import { HierarchyCircularNode } from "d3";
import React from "react";

const width = 700;
const height = 700;

export type FlareNode = {
  children?: FlareNode[];
  value?: number;
  id?: string;
  name: string;
  color?: string;
  href?: string;
  data?: Record<string, any>;
};

//type Phase = (typeof phases)[number]["id"];
type Filters = {
  //phases: Phase[];
};

const filterData = (data: FlareNode, filters: Record<string, any>) => ({
  ...data,
  children: data.children?.map((child) => ({
    ...child,
    children: child.children?.filter((startup) => {
      //   if (filters.phases.length) {
      //     return filters.phases.includes(startup.phase);
      //   }
      return true;
    }),
  })),
});

const backgroundColors = [
  "#f4f6ff",
  "#e8edff",
  "#dde5ff",
  "#bccdff",
  "#dde5ff",
  "#f4f6ff",
  "#e8edff",
  "#dde5ff",
  "#bccdff",
  "#dde5ff",
  "#f4f6ff",
  "#e8edff",
  "#dde5ff",
  "#bccdff",
  "#dde5ff",
  "#f4f6ff",
  "#e8edff",
];

const getBackgroundColor = (index: number) => {
  return backgroundColors[index % backgroundColors.length];
};

const shortify = (str: string, maxLength = 50) => {
  if (str.startsWith("https://github.com/")) {
    return str.replace(/^https:\/\/github\.com\//, "");
  }
  if (str.length > maxLength) return str.slice(0, maxLength) + "...";
  return str;
};

const RenderCircles = ({
  node,
  onClick,
  onHover,
  depth = 1,
  activeNode,
  hoverNode,
  zoomLevel,
  transform,
}: {
  node: HierarchyCircularNode<FlareNode>;
  onClick: (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    arg0: HierarchyCircularNode<FlareNode>
  ) => void;
  onHover: (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    arg0: HierarchyCircularNode<FlareNode> | null
  ) => void;
  depth?: number;
  activeNode: FlareNode;
  hoverNode?: FlareNode | null;
  zoomLevel: number;
  transform: SpringValue<string>;
}) => {
  const backgroundColor = backgroundColors[0]; //(zoomLevel + depth + 2);

  const circleContent = (
    <>
      {node &&
        node.children?.map((subNode, i) => {
          const bgOffset =
            activeNode === node ||
            activeNode === subNode ||
            hoverNode === node ||
            hoverNode === subNode
              ? 1
              : 0;
          return (
            subNode && (
              <React.Fragment key={subNode.data.name + i}>
                <circle
                  onMouseOver={(e) => onHover(e, subNode)}
                  onMouseOut={(e) => onHover(e, null)}
                  onClick={(e) => onClick(e, subNode)}
                  cx={Math.max(1, subNode.x)}
                  cy={Math.max(1, subNode.y)}
                  data-title={subNode.data.name}
                  fill={
                    subNode.data.color || getBackgroundColor(zoomLevel + depth)
                  }
                  strokeWidth={4 / (zoomLevel * 5)}
                  stroke={
                    hoverNode && hoverNode === subNode
                      ? getBackgroundColor(zoomLevel + depth + 2)
                      : "transparent"
                    //subNode.data.color || getBackgroundColor(zoomLevel + depth)
                  }
                  r={subNode.r}
                />

                {depth < 3 && (
                  <RenderCircles
                    key={`circles-${i}`}
                    node={subNode}
                    onClick={(e) => onClick(e, subNode)}
                    onHover={(e) => onHover(e, subNode)}
                    depth={depth + 1}
                    activeNode={activeNode}
                    hoverNode={hoverNode}
                    zoomLevel={zoomLevel}
                    transform={transform}
                  />
                )}
              </React.Fragment>
            )
          );
        })}
      {node &&
        node.children?.slice(0, 1000).map((subNode, i, allChildren) => {
          const opacity =
            hoverNode?.data?.name === subNode.data.name ? 1 : 0.15;
          const textTransform = transform.to((t) => {
            // adjust text scale
            const match = t.match(/scale\((.*?)\)/);
            const scaleValue = match ? parseFloat(match[1]) : 1;
            const subNodeFontSize = 1 / scaleValue;
            return `scale(${subNodeFontSize})`;
          });

          return (
            (activeNode === node || activeNode === subNode) &&
            depth < 2 && (
              <animated.text
                transform={textTransform}
                onMouseOver={(e) => onHover(e, subNode)}
                onClick={(e) => onClick(e, subNode)}
                onMouseOut={(e) => onHover(e, null)}
                textAnchor="middle"
                style={{
                  opacity,
                  cursor: (subNode.children?.length && "pointer") || "auto",
                  transformOrigin: `${subNode.x}px ${subNode.y}px`,
                }}
                fontSize={20}
                key={subNode.data.name + i}
                className="subNode-label"
                x={subNode.x}
                y={subNode.y}
              >
                {shortify(subNode.data.name)}
              </animated.text>
            )
          );
        })}
    </>
  );

  return depth === 1 ? (
    <>
      <circle
        cx={Math.max(1, node.x)}
        cy={Math.max(1, node.y)}
        data-title={node.data.name}
        fill={node.data.color || backgroundColor}
        strokeWidth={1}
        r={node.r}
      />

      {circleContent}
    </>
  ) : (
    circleContent
  );
};

// const findParentStructure = (node) => {
//   while(node.parent) {

//   }
//   if (node.children.map((c) => c.id).includes(id)) {
//     return node;
//   }
//   for (const child of node.children || []) {
//     const found = findParentStructure(root, child, id);
//     if (found) {
//       return found;
//     }
//   }
//   return null;
// };

const Breadcrumb = ({ node, depth = 0, onSegmentClick }) => {
  const segments = [];
  let parent = node.parent;
  while (parent) {
    segments.push({ name: parent.data.name, node: parent });
    parent = parent.parent;
  }
  segments.unshift({ name: node.data.name, node });

  return (
    <ul style={{ marginTop: 20, marginLeft: "2rem" }} className="breadcrumbs">
      👉{" "}
      {segments.reverse().map((s, i, all) => (
        <li
          key={s.name + i}
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
        </li>
      ))}
    </ul>
  );
};

export const Flare = ({ data: initialData }: { data: FlareNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverNode, setHoverNode] =
    useState<d3.HierarchyCircularNode<FlareNode> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [filters, setFilters] = useState<Filters>({ phases: [] });

  const [lastNode, setLastNode] =
    useState<d3.HierarchyCircularNode<FlareNode> | null>(null);

  const hierarchy = useMemo(() => {
    const newData = filterData(initialData, filters);
    return d3.pack<FlareNode>().size([width, height]).padding(10)(
      d3
        .hierarchy<FlareNode>(newData) //{ ...data, children: [data.children[0]] })
        .sum((d) => d.value || 1)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
    );
  }, [initialData, filters]);
  const nodes = (hierarchy && hierarchy.descendants()) || [];
  const [currentNode, setCurrentNode] =
    useState<d3.HierarchyCircularNode<FlareNode> | null>(nodes[0]);

  const onNodeHover = (
    _: React.MouseEvent<SVGGElement, MouseEvent>,
    hoverNode: d3.HierarchyCircularNode<FlareNode> | null
  ) => {
    // console.log("onNodeHover", hoverNode?.data.name);
    setHoverNode(hoverNode);
  };

  const onNodeClick = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    newSubNode: d3.HierarchyCircularNode<FlareNode>
  ) => {
    console.log("onNodeClick", newSubNode);

    setZoomLevel(newSubNode.depth);

    if (
      currentNode &&
      newSubNode.parent?.data.name === currentNode.data?.name
    ) {
      // console.log("parent", currentNode);
      e.stopPropagation();
      if (newSubNode.data?.href) {
        //window.open(newSubNode.data?.href);
      }
    }
    if (currentNode && newSubNode.r === currentNode.r) {
      //console.log("io3", newSubNode,currentNode );
      setCurrentNode(() => {
        setLastNode(lastNode);
        return lastNode;
      });
      return;
    }
    if (newSubNode.data.children?.length) {
      e.stopPropagation();
      setCurrentNode((current) => {
        setLastNode(current);
        return newSubNode;
      });
    }
  };

  const onClickOutside = () => {
    //setCurrentNode(null);
    setZoomLevel(0);
    setCurrentNode(nodes[0]);
  };

  // const translate = "xx";
  // const k = 2;

  const start: d3.ZoomView = currentNode
    ? [350, 350, 700]
    : lastNode
      ? [lastNode.x, lastNode.y, lastNode.r * 2 * 1.2]
      : [width, height, 700]; // cx, cy, size

  const end: d3.ZoomView = currentNode
    ? [
        currentNode.x,
        currentNode.y + currentNode.r / 10,
        currentNode.r * 2 * 1.2,
      ]
    : [width / 2, height / 2, 700]; // cx, cy, size

  const zoomInterpolator = useMemo(
    () => d3.interpolateZoom(start, end),
    [currentNode, start, end]
  );

  const getFromInterpolation = (view: d3.ZoomView) => {
    const scale = Math.min(width, height) / view[2];
    const translate = [
      width / 2 - view[0] * scale,
      height / 2 - view[1] * scale,
    ];
    // console.log({ scale, translate, width, height, view });
    return `translate(${translate.join(", ")}) scale(${scale}) `;
  };

  const { transformZoom } = useSpring({
    from: {
      transformZoom: getFromInterpolation(zoomInterpolator(0)),
    },
    to: {
      transformZoom: getFromInterpolation(zoomInterpolator(1)),
    },
    config: {
      mass: 5,
      tension: 500,
      friction: 100,
    },
  });

  useEffect(() => {
    console.log("initialData updated");
    setZoomLevel(0);
    setCurrentNode(nodes[0]);
  }, [initialData]);

  const onSegmentClick = (segment: {
    node: HierarchyCircularNode<FlareNode>;
  }) => {
    setCurrentNode(segment.node);
  };

  return (
    <>
      <Breadcrumb node={currentNode} onSegmentClick={onSegmentClick} />
      <div ref={wrapperRef} style={{ overflow: "hidden" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          onClick={() => onClickOutside()}
          style={{ transformOrigin: "0 0" }}
        >
          {currentNode && (
            <animated.g transform={transformZoom}>
              <RenderCircles
                depth={1}
                zoomLevel={zoomLevel}
                node={currentNode}
                onClick={onNodeClick}
                activeNode={currentNode}
                hoverNode={hoverNode}
                onHover={onNodeHover}
                transform={transformZoom}
              />
            </animated.g>
          )}
        </svg>
      </div>
    </>
  );
};
