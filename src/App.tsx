//import {type.} from "d3-hierarchy/umd"

import { ElementType, animated, useSpring } from "@react-spring/web";
import * as d3 from "d3";
import { useMemo, useRef, useState } from "react";

import startupsData from "./startups.json";

import "./App.css";

const shortify = (str: string, maxLength = 30) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const width = 700;
const height = 700;

type StartupData = {
  children: MemberData[];
  id: string;
  pitch: string;
  repository?: string;
  link?: string;
  dateStart?: string;
  phase?: string;
  phaseStart?: string;
};

type MemberData = {
  github?: string;
  children: never;
};

type IncubatorData = {
  children: StartupData[];
};

type BetaNode = {
  name: string;
  children?: BetaNode[];
  value?: number;
} & (IncubatorData | StartupData | MemberData);

const phases = [
  { id: "investigation", label: "Investigation" },
  { id: "construction", label: "Construction" },
  { id: "acceleration", label: "Accélération" },
  { id: "success", label: "Pérennisé" },
  { id: "transfer", label: "Transfert" },
  { id: "alumni", label: "Partenariat terminé" },
] as const;

const Gradients = () => (
  <defs>
    {phases.map((phase) => (
      <linearGradient key={phase.id} id={`gradient-${phase.id}`}>
        <stop offset="0%" stopColor={`var(--color-${phase.id})`} />
        <stop offset="100%" stopColor={`var(--color-${phase.id}--light)`} />
      </linearGradient>
    ))}
  </defs>
);

interface DelayedProps {
  as?: React.ElementType;
  delay?: number;
  show?: boolean;
  children?: React.ReactNode;
}

const Delayed = ({
  as = "div",
  delay = 300,
  show = true,
  ...props
}: DelayedProps &
  Omit<React.ComponentPropsWithoutRef<ElementType>, keyof DelayedProps>) => {
  const rnd = useMemo(() => Math.random() * delay, [delay]);
  const [styleProps] = useSpring(
    {
      from: { opacity: show ? 0 : 1 },
      to: { opacity: show ? 1 : 0 },
      delay: rnd,
      duration: 400,
    },
    [rnd, show]
  );
  const Component = animated[as];

  return <Component style={styleProps} {...props} />;
};

const filterData = (data: BetaNode, filters: Record<string, any>) => ({
  ...data,
  children: data.children.map((child) => ({
    ...child,
    children: child.children.filter((startup) => {
      if (filters.phases.length) {
        return filters.phases.includes(startup.phase);
      }
      return true;
    }),
  })),
});

//const Incubateur = ({}) =>

type Phase = (typeof phases)[number]["id"];
type Filters = {
  phases: Phase[];
};

const BetaMap = ({ data: initialData }: { data: BetaNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverIncubator, setHoverIncubator] = useState(null);
  const [hoverStartup, setHoverStartup] = useState(null);
  const [startupFilters, setStartupFilters] = useState<Filters>({ phases: [] });
  const [currentIncubator, setCurrentIncubator] =
    useState<d3.HierarchyCircularNode<BetaNode> | null>(null);
  const [lastIncubator, setLastIncubator] =
    useState<d3.HierarchyCircularNode<BetaNode> | null>(null);

  const hierarchy = useMemo(() => {
    const newData = filterData(initialData, startupFilters);
    return d3.pack<BetaNode>().size([width, height]).padding(10)(
      d3
        .hierarchy<BetaNode>(newData) //{ ...data, children: [data.children[0]] })
        .sum((d) => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
    );
  }, [initialData, startupFilters]);

  const nodes = (hierarchy && hierarchy.descendants()) || [];

  const onPhaseClick = (phase: Phase) => {
    setCurrentIncubator(null);
    setStartupFilters((filters) => {
      if (filters.phases.length && filters.phases.includes(phase)) {
        return {
          ...filters,
          phases: filters.phases.filter((p) => p !== phase),
        };
      }
      return {
        ...filters,
        phases: [...filters.phases, phase],
      };
    });
  };

  const onIncubatorClick = (e, newIncubator) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("onIncubatorClick", newIncubator);
    setCurrentIncubator((current) => {
      setLastIncubator(current);
      if (current) {
        return null;
      }
      return newIncubator;
    });
  };

  const onStartupClick = (
    e,
    newStartup: d3.HierarchyCircularNode<BetaNode>
  ) => {
    if (
      currentIncubator &&
      newStartup.parent?.data.name === currentIncubator.data?.name
    ) {
      e.stopPropagation();
      window.open(`https://beta.gouv.fr/startups/${newStartup.data.id}.html`);
    }
  };

  const onClickOutside = () => {
    setCurrentIncubator(null);
  };

  // const translate = "xx";
  // const k = 2;

  const start = currentIncubator
    ? [0, 0, 700]
    : lastIncubator
    ? [lastIncubator.x, lastIncubator.y, lastIncubator.r * 2 * 1.2]
    : [width / 2, height / 2, 700]; // cx, cy, size
  const end = currentIncubator
    ? [currentIncubator.x, currentIncubator.y, currentIncubator.r * 2 * 1.2]
    : [width / 2, height / 2, 700]; // cx, cy, size

  const zoomInterpolator = useMemo(
    () => d3.interpolateZoom(start, end),
    [start, end]
  );

  const { transformIncubator } = useSpring({
    from: { transformIncubator: 0 },
    to: { transformIncubator: 1 },
    config: {
      mass: 5,
      tension: 500,
      friction: 100,
    },
  });

  return (
    <>
      <div>
        {phases.map((phase) => (
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
        ))}
      </div>
      {currentIncubator && <h2>{currentIncubator.data.name}</h2>}
      <div ref={wrapperRef} style={{ overflow: "hidden" }}>
        <animated.svg
          viewBox={`0 0 ${width} ${height}`}
          onClick={() => onClickOutside()}
          style={{ transformOrigin: "0 0" }}
        >
          <Gradients />
          <animated.g
            transform={transformIncubator.to((t) => {
              const view = zoomInterpolator(t);
              const scale = Math.min(width, height) / view[2];
              const translate = [
                width / 2 - view[0] * scale,
                height / 2 - view[1] * scale,
              ];
              const prop = `translate(${translate}) scale(${scale})`;
              return prop;
            })}
          >
            {nodes
              .filter((node) => node.depth === 1)
              .map((incubator) => {
                const isActiveIncubator =
                  currentIncubator &&
                  incubator.data.name === currentIncubator.data.name;
                return (
                  <g
                    key={incubator.data.name}
                    onClick={(e) => onIncubatorClick(e, incubator)}
                    onMouseOver={() => setHoverIncubator(incubator.data.name)}
                    onMouseOut={() => setHoverIncubator(null)}
                  >
                    <Delayed
                      as="circle"
                      cx={incubator.x}
                      cy={incubator.y}
                      show={
                        currentIncubator
                          ? isActiveIncubator
                            ? true
                            : false
                          : true
                      }
                      fill={
                        hoverIncubator === incubator.data.name
                          ? `var(--color-incubators--active)`
                          : `var(--color-incubators)`
                      }
                      className={`incubator ${
                        currentIncubator
                          ? isActiveIncubator
                            ? "active"
                            : "inactive"
                          : ""
                      }`}
                      r={incubator.r}
                    />
                    {incubator.children?.map((startup) => (
                      <g
                        key={startup.data.id}
                        onClick={(e) => onStartupClick(e, startup)}
                        onMouseOver={() => setHoverStartup(startup.data.name)}
                        onMouseOut={() => setHoverStartup(null)}
                      >
                        <Delayed
                          as="circle"
                          show={
                            currentIncubator
                              ? isActiveIncubator
                                ? true
                                : false
                              : true
                          }
                          cx={startup.x}
                          cy={startup.y}
                          fill={`url(#gradient-${startup.data.phase}`}
                          className={`startup ${
                            hoverStartup === startup.data.name ? "active" : ""
                          }`}
                          r={startup.r}
                        />
                        {isActiveIncubator &&
                          startup.children?.map((member) => {
                            return (
                              <Delayed
                                as="circle"
                                key={member.data.name}
                                cx={member.x}
                                cy={member.y}
                                fill={`#cccccc77`}
                                className={`member`}
                                r={member.r}
                              />
                            );
                          })}
                      </g>
                    ))}
                    {
                      /* another loop to have text on top */
                      incubator.children
                        ?.map(
                          (startup) =>
                            (isActiveIncubator ||
                              (!currentIncubator &&
                                hoverStartup &&
                                hoverStartup === startup.data.name)) && (
                              <Label
                                delay={
                                  hoverStartup &&
                                  hoverStartup === startup.data.name
                                    ? 0
                                    : 200
                                }
                                show={
                                  hoverStartup
                                    ? hoverStartup === startup.data.name
                                    : true
                                }
                                fontSize={
                                  Math.min(4, Math.max(2, startup.value - 1)) *
                                  (currentIncubator ? 1 : 3)
                                }
                                key={startup.data.name}
                                className="startup-label"
                                x={startup.x}
                                y={startup.y}
                              >
                                {shortify(startup.data.name)}
                              </Label>
                            )
                        )
                        .filter(Boolean)
                    }
                  </g>
                );
              })}
            {
              /* another loop to have text on top */
              !currentIncubator &&
                nodes
                  .filter(
                    (node) =>
                      node.depth === 1 &&
                      node.descendants().length > 1 &&
                      (currentIncubator
                        ? node.data.name === currentIncubator.data.name
                        : true)
                  )
                  .map((incubator) => (
                    <Label
                      key={incubator.data.name}
                      className="incubator-label"
                      x={incubator.x}
                      y={incubator.y}
                    >
                      {incubator.data.name}
                    </Label>
                  ))
            }
          </animated.g>
        </animated.svg>
      </div>
    </>
  );
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

function App() {
  return (
    <>
      <h1>beta.gouv.fr map</h1>
      <BetaMap data={startupsData} />
    </>
  );
}

export default App;
