//import {type.} from "d3-hierarchy/umd"

import {
  ElementType,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { useSpring, animated, useTransition } from "@react-spring/web";

import startupsData from "./startups.json";

import "./App.css";
import { satisfies } from "semver";

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
  children?: React.ReactNode;
}

const Delayed = ({
  as = "div",
  delay = 300,
  ...props
}: DelayedProps & Omit<React.ComponentPropsWithoutRef, keyof DelayedProps>) => {
  const rnd = useMemo(() => Math.random() * delay, [delay]);
  const [styleProps] = useSpring(
    {
      from: { opacity: 0 },
      to: { opacity: 1 },
      delay: rnd,
      duration: 400,
    },
    [rnd]
  );
  const Component = animated[as];

  return <Component style={styleProps} {...props} />;
};

const filterData = (data, filters) => ({
  ...data,
  children: data.children.map((child) => ({
    ...child,
    children: child.children.filter((startup) => {
      if (filters.phase) {
        return startup.phase === filters.phase;
      }
      return true;
    }),
  })),
});

//const Incubateur = ({}) =>

const BetaMap = ({ data: initialData }: { data: BetaNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState(null);
  const [startupFilters, setStartupFilters] = useState({});
  //const [translate, setTranslate] = useState([0, 0]);
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
    setStartupFilters((filters) => {
      const newPhase = filters.phase === phase ? null : phase;
      return {
        ...filters,
        phase: newPhase,
      };
    });
  };

  const onIncubateurClick = (newIncubator) => {
    console.log("onIncubateurClick", newIncubator);
    setCurrentIncubator((current) => {
      if (current === newIncubator) {
        //setTranslate([0, 0]);
        return null;
      }
      return newIncubator;
    });
    //setTranslate([-newIncubator.x / 2, -newIncubator.y / 2]);
  };

  const rect = wrapperRef.current && wrapperRef.current.getBoundingClientRect();
  const ratio = 2;
  const zoomLevel =
    rect && currentIncubator ? (700 / (currentIncubator.r * ratio)) * 0.9 : 1;

  const { transformSvg } = useSpring({
    transformSvg: `scale(${zoomLevel}) translate(${
      currentIncubator ? 700 - currentIncubator.x * ratio : 0
    }px,${currentIncubator ? 700 - currentIncubator.y * ratio : 0}px)`,
    //opacityIncubateur: `opacity:{}`,
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
                (phase.id === startupFilters.phase && "underline") || "auto",
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
      <div ref={wrapperRef} style={{ overflow: "hidden" }}>
        <animated.svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            transform: transformSvg,
            transformOrigin: `center center`,
          }}
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
                    onClick={() => onIncubateurClick(incubator)}
                    onMouseOver={() => setHover(incubator.data.name)}
                    onMouseOut={() => setHover(null)}
                  >
                    <Delayed
                      as="circle"
                      cx={incubator.x}
                      cy={incubator.y}
                      fill={
                        hover === incubator.data.name
                          ? `var(--color-incubators--active)`
                          : `var(--color-incubators)`
                      }
                      className={`incubator`}
                      r={incubator.r}
                    />
                    {incubator.children?.map((startup, j) => (
                      <g key={startup.data.id}>
                        <Delayed
                          as="circle"
                          cx={startup.x}
                          cy={startup.y}
                          fill={`url(#gradient-${startup.data.phase}`}
                          className={`startup`}
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
                                fill={`#ccc`}
                                className={`member`}
                                r={member.r}
                              />
                            );
                          })}
                      </g>
                    ))}
                    {
                      /* another loop to have text on top */
                      isActiveIncubator &&
                        incubator.children.map((startup, i) => (
                          <Label
                            key={startup.data.name}
                            className="startup-label"
                            x={startup.x}
                            y={startup.y}
                          >
                            {shortify(startup.data.name)}
                          </Label>
                        ))
                    }
                  </g>
                );
              })}
            {
              /* another loop to have text on top */
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
      <button onClick={() => setCount((count) => count + 1)}>
        click: {count}
      </button>
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
