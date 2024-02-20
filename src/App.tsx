//import {type.} from "d3-hierarchy/umd"

import { animated, useSpring } from "@react-spring/web";
import * as d3 from "d3";
import { useMemo, useRef, useState } from "react";

import startupsData from "./startups.json";

import "./App.css";

const shortify = (str: string, maxLength = 30) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const slugify = (str: string) =>
  (str && str.replace(/[\W.-]/g, "-").toLowerCase()) || "-";

const toDateFr = (str: string) => str && str.split("-").reverse().join("/");

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

// type PhaseType = {
//   id: string;
//   label: string;
//   color: string;
// };

// function createPhasesArray<
//   T extends readonly PhaseType[] & Array<{ id: V }>,
//   V extends string
// >(...args: T) {
//   return args;
// }

const phases = [
  { id: "investigation", label: "Investigation" },
  { id: "construction", label: "Construction" },
  { id: "acceleration", label: "Accélération" },
  { id: "success", label: "Pérennisé" },
  { id: "transfer", label: "Transfert" },
  { id: "alumni", label: "Partenariat terminé" },
];

// type Phase = (typeof phases)[number]["id"];

// const getPhaseKey = (id: Phase, key: "label" | "color") => {
//   const phaseData = phases.find((p) => p.id === id);
//   if (phaseData) {
//     return phaseData[key];
//   }
//   return null;
// };

const Gradients = () => (
  <defs>
    <linearGradient id="gradient-investigation">
      <stop offset="0%" stopColor="var(--color-investigation)" />
      <stop offset="100%" stopColor="var(--color-investigation--light)" />
    </linearGradient>
    <linearGradient id="gradient-construction">
      <stop offset="0%" stopColor="var(--color-construction)" />
      <stop offset="100%" stopColor="var(--color-construction--light)" />
    </linearGradient>
    <linearGradient id="gradient-acceleration">
      <stop offset="0%" stopColor="var(--color-acceleration)" />
      <stop offset="100%" stopColor="var(--color-acceleration--light)" />
    </linearGradient>
    <linearGradient id="gradient-success">
      <stop offset="0%" stopColor="var(--color-success)" />
      <stop offset="100%" stopColor="var(--color-success--light)" />
    </linearGradient>
    <linearGradient id="gradient-transfer">
      <stop offset="0%" stopColor="var(--color-transfer)" />
      <stop offset="100%" stopColor="var(--color-transfer--light)" />
    </linearGradient>
    <linearGradient id="gradient-alumni">
      <stop offset="0%" stopColor="var(--color-alumni)" />
      <stop offset="100%" stopColor="var(--color-alumni--light)" />
    </linearGradient>
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
}: DelayedProps & Omit<React.ComponentPropsWithoutRef, keyof DelayedProps>) => {
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

const filterData = (data, filters) => ({
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

const BetaMap = ({ data: initialData }: { data: BetaNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverIncubator, setHoverIncubator] = useState(null);
  const [hoverStartup, setHoverStartup] = useState(null);
  const [startupFilters, setStartupFilters] = useState({ phases: [] });
  const [currentIncubator, setCurrentIncubator] = useState(null);

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

  const onPhaseClick = (phase: string) => {
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
      if (current && current.data.name === newIncubator.data.name) {
        return null;
      }
      return newIncubator;
    });
  };

  const onStartupClick = (e, newStartup) => {
    console.log("onStartupClick", newStartup);
    if (currentIncubator) {
      e.stopPropagation();
      window.open(`https://beta.gouv.fr/startups/${newStartup.data.id}.html`);
    }
  };

  const onClickOutside = () => {
    setCurrentIncubator(null);
  };

  const rect = wrapperRef.current && wrapperRef.current.getBoundingClientRect();
  const ratio = 2;
  const zoomLevel =
    rect && currentIncubator ? (width / (currentIncubator.r * ratio)) * 0.8 : 1;

  const { transformSvg } = useSpring({
    transformSvg: `scale(${zoomLevel}) translate(${
      currentIncubator ? width - currentIncubator.x * ratio : 0
    }px,${currentIncubator ? height - currentIncubator.y * ratio : 0}px)`,
    config: { mass: 1, tension: 60, friction: 14 },
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
          style={{
            transform: transformSvg,
            transformOrigin: `center center`,
          }}
          onClick={() => onClickOutside()}
        >
          <Gradients />
          <g>
            {nodes
              .filter((node) => node.depth === 1)
              .map((incubator, i) => {
                const isActiveIncubator =
                  currentIncubator &&
                  incubator.data.name === currentIncubator.data.name;
                return (
                  <g
                    key={incubator.data.name + i}
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
                    {incubator.children?.map((startup, j) => (
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
                          startup.children?.map((member, k) => {
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
                          (startup, i) =>
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
                  .map((incubator, i) => (
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
          </g>
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
      <h3>beta.gouv.fr map</h3>
      <BetaMap data={startupsData} />
    </>
  );
}

export default App;
