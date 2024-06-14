import { useMemo, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import * as d3 from "d3";
import { Delayed } from "./Delayed";

import "./Flare.css";

const shortify = (str: string, maxLength = 30) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const width = 700;
const height = 700;

export type FlareNode = {
  children?: FlareNode[];
  value?: number;
  id: string;
  name: string;
  color: string;
};

//type Phase = (typeof phases)[number]["id"];
type Filters = {
  //phases: Phase[];
};

const Label = ({ ...props }) => (
  <Delayed
    as="text"
    delay={500}
    textAnchor="middle"
    pointerEvents="none"
    {...props}
  />
);

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

export const Flare = ({ data: initialData }: { data: FlareNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [hoverSubNode, setHoverSubNode] = useState<string | null>(null);
  const [startupFilters, setStartupFilters] = useState<Filters>({ phases: [] });
  const [currentNode, setCurrentNode] =
    useState<d3.HierarchyCircularNode<FlareNode> | null>(null);
  const [lastNode, setLastNode] =
    useState<d3.HierarchyCircularNode<FlareNode> | null>(null);

  const hierarchy = useMemo(() => {
    const newData = filterData(initialData, startupFilters);
    return d3.pack<FlareNode>().size([width, height]).padding(10)(
      d3
        .hierarchy<FlareNode>(newData) //{ ...data, children: [data.children[0]] })
        .sum((d) => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
    );
  }, [initialData, startupFilters]);

  const nodes = (hierarchy && hierarchy.descendants()) || [];

  //   const onPhaseClick = (phase: Phase) => {
  //     setCurrentNode(null); // todo: reset current incubator position to center the new view when hierarchy changed and handle edge cases
  //     setStartupFilters((filters) => {
  //       if (filters.phases.length && filters.phases.includes(phase)) {
  //         return {
  //           ...filters,
  //           phases: filters.phases.filter((p) => p !== phase),
  //         };
  //       }
  //       return {
  //         ...filters,
  //         phases: [...filters.phases, phase],
  //       };
  //     });
  //   };

  const onNodeClick = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    newNode: d3.HierarchyCircularNode<FlareNode>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("onNodeClick", newNode);
    if (currentNode?.descendants.length === 0) {
      return;
    }
    setCurrentNode((current) => {
      setLastNode(current);
      if (current) {
        return null;
      }
      return newNode;
    });
  };

  const onSubNodeClick = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    newSubNode: d3.HierarchyCircularNode<FlareNode>
  ) => {
    console.log("onSubNodeClick", newSubNode);

    if (
      currentNode &&
      newSubNode.parent?.data.name === currentNode.data?.name
    ) {
      e.stopPropagation();
      window.open(`https://beta.gouv.fr/startups/${newSubNode.data.id}.html`);
    }
  };

  const onClickOutside = () => {
    setCurrentNode(null);
  };

  // const translate = "xx";
  // const k = 2;

  const start = currentNode
    ? [0, 0, 700]
    : lastNode
    ? [lastNode.x, lastNode.y, lastNode.r * 2 * 1.2]
    : [width, height, 700]; // cx, cy, size

  const end = currentNode
    ? [
        currentNode.x,
        currentNode.y + currentNode.r / 10,
        currentNode.r * 2 * 1.2,
      ]
    : [width / 2, height / 2, 700]; // cx, cy, size

  const zoomInterpolator = useMemo(
    () => d3.interpolateZoom(start, end),
    [start, end]
  );

  const getFromInterpolation = (view: d3.ZoomView) => {
    const scale = Math.min(width, height) / view[2];
    const translate = [
      width / 2 - view[0] * scale,
      height / 2 - view[1] * scale,
    ];
    return `translate(${translate}) scale(${scale})`;
  };

  const { transformIncubator } = useSpring({
    from: {
      transformIncubator: getFromInterpolation(zoomInterpolator(0)),
    },
    to: {
      transformIncubator: getFromInterpolation(zoomInterpolator(1)),
    },
    config: {
      mass: 5,
      tension: 500,
      friction: 100,
    },
  });

  return (
    <>
      <div>
        {/* {phases.map((phase) => (
          <span
            key={phase.label}
            className="hoverline"
            style={{
              marginRight: 15,
              cursor: "pointer",
              textDecoration:
                (startupFilters.phases.includes(phase.id) && "underline") ||
                "auto",
            }}
            onClick={() => onPhaseClick(phase.id)}
          >
            <span
              style={{
                width: 20,
                height: 20,
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: 5,
                backgroundColor: `var(--color-${phase.id})`,
              }}
            />
            {phase.label}
          </span>
        ))} */}
      </div>
      {currentNode && <h2>{currentNode.data.name}</h2>}
      <div ref={wrapperRef} style={{ overflow: "hidden" }}>
        <animated.svg
          viewBox={`0 0 ${width} ${height}`}
          onClick={() => onClickOutside()}
          style={{ transformOrigin: "0 0" }}
        >
          {/* <Defs data={initialData} currentNode={currentNode} /> */}
          <animated.g transform={transformIncubator}>
            {nodes
              .filter((node) => node.depth === 1)
              .map((node) => {
                const isActiveNode =
                  currentNode && node.data.name === currentNode.data.name;
                return (
                  <g
                    key={node.data.name}
                    onClick={(e) => onNodeClick(e, node)}
                    onMouseOver={() => setHoverNode(node.data.name)}
                    onMouseOut={() => setHoverNode(null)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      fill={node.data.color || "#eee"}
                      style={{
                        filter:
                          hoverNode === node.data.name
                            ? "brightness(105%)"
                            : "none",
                      }}
                      className={`node ${
                        currentNode
                          ? isActiveNode
                            ? "active"
                            : "inactive"
                          : ""
                      }`}
                      r={node.r}
                    />
                    {node.children?.map((subNode) => (
                      <g
                        key={subNode.data.id}
                        onClick={(e) => onSubNodeClick(e, subNode)}
                        onMouseOver={() => setHoverSubNode(subNode.data.name)}
                        onMouseOut={() => setHoverSubNode(null)}
                      >
                        <circle
                          cx={subNode.x}
                          cy={subNode.y}
                          fill={subNode.data.color || "#ccc"}
                          style={{
                            filter:
                              hoverSubNode === subNode.data.name
                                ? "brightness(110%)"
                                : "none",
                          }}
                          //   className={`subNode ${
                          //     hoverSubNode === subNode.data.name ? "active" : ""
                          //   }`}
                          r={subNode.r}
                        />
                        {/* {isActiveNode &&
                          startup.children?.map((member) => {
                            return (
                              <Delayed
                                as="circle"
                                key={member.data.name}
                                cx={member.x}
                                cy={member.y}
                                fill={
                                  member.data.github
                                    ? `url(#member-${member.data.github})`
                                    : `url(#logo-beta)`
                                }
                                className={`member`}
                                r={member.r}
                              />
                            );
                          })} */}
                      </g>
                    ))}
                    {
                      /* another loop to have text on top */
                      node.children
                        ?.map((subNode) => {
                          let subNodeFontSize = Math.min(
                            6,
                            Math.max(3, subNode.value - 1)
                          );
                          if ((subNode.parent?.data.value || 0) < 100) {
                            subNodeFontSize -= 3;
                          }

                          return (
                            (isActiveNode ||
                              (!currentNode &&
                                hoverSubNode &&
                                hoverSubNode === subNode.data.name)) && (
                              <Label
                                delay={
                                  hoverSubNode &&
                                  hoverSubNode === subNode.data.name
                                    ? 0
                                    : 200
                                }
                                show={
                                  hoverSubNode
                                    ? hoverSubNode === subNode.data.name
                                    : true
                                }
                                fontSize={
                                  subNodeFontSize
                                  //startup.parent.data.value < 50 ? 4 : 6
                                  // startup.parent.data.value * Math.min(
                                  //   4,
                                  //   Math.max(2, startup.value - 1)
                                  // ) * (currentNode ? 1 : 3)
                                }
                                key={subNode.data.name}
                                className="subNode-label"
                                x={subNode.x}
                                y={subNode.y}
                              >
                                {shortify(subNode.data.name)}
                              </Label>
                            )
                          );
                        })
                        .filter(Boolean)
                    }
                  </g>
                );
              })}
            {
              /* another loop to have text on top */
              !currentNode &&
                nodes
                  .filter(
                    (node) => node.depth === 1 && node.descendants().length > 1
                  )
                  .map((node) => (
                    <Label
                      key={node.data.name}
                      className="node-label"
                      x={node.x}
                      y={node.y}
                    >
                      {node.data.name}
                    </Label>
                  ))
            }
          </animated.g>
        </animated.svg>
      </div>
    </>
  );
};
