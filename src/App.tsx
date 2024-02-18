//import {type.} from "d3-hierarchy/umd"

import { useMemo, useState } from "react";
import * as d3 from "d3";

import startupsData from "./startups.json";

import "./App.css";

const shortify = (str: string, maxLength = 30) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const slugify = (str: string) =>
  (str && str.replace(/[\W.-]/g, "-").toLowerCase()) || "-";

const toDateFr = (str: string) => str && str.split("-").reverse().join("/");

const width = 700;
const height = 700;

type FlareData = {
  name: string;
  children: FlareData[];
  value?: number;
};

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

// const phases = createPhasesArray(
//   { id: "investigation", label: "Investigation", color: "#ffd079" },
//   { id: "construction", label: "Construction", color: "#ff914d" },
//   { id: "acceleration", label: "Accélération", color: "#fa6bbc" },
//   { id: "success", label: "Pérennisé", color: "#0bffb3" },
//   { id: "transfer", label: "Transfert", color: "#1fbcff" },
//   { id: "alumni", label: "Partenariat terminé", color: "#aaa" }
// );

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

const BetaMap = ({ data }: { data: FlareData }) => {
  const [count, setCount] = useState(0);
  const hierarchy = useMemo(() => {
    return d3.pack<FlareData>().size([width, height]).padding(5)(
      d3
        .hierarchy<FlareData>(data) // TODO: TS
        .sum((d) => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
    );
  }, [data]);

  const nodes = hierarchy.descendants();

  console.log("hierarchy", hierarchy);
  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: "#eee" }}
      >
        <Gradients />
        {nodes
          .filter((node) => node.depth === 1)
          .map((incubator, i) => (
            <g key={incubator.data.name + i}>
              <circle
                cx={incubator.x}
                cy={incubator.y}
                fill={`var(--color-incubators)`}
                r={incubator.r}
              />
              {incubator.children?.map((startup, j) => (
                <g key={startup.data.id}>
                  <circle
                    cx={startup.x}
                    cy={startup.y}
                    fill={`url(#gradient-${startup.data.phase}`}
                    className={`startup startup--${startup.data.id}`}
                    r={startup.r}
                  />
                  {startup.children?.map((member, k) => {
                    return (
                      <circle
                        key={member.name}
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
            </g>
          ))}
        {
          /* another loop to have text on top */
          nodes
            .filter((node) => node.depth === 1)
            .map((incubator, i) => (
              <text
                x={incubator.x}
                y={incubator.y}
                textAnchor="middle"
                className="incubator-label"
              >
                {incubator.data.name}
              </text>
            ))
        }
      </svg>
      <button onClick={() => setCount((count) => count + 1)}>
        click: {count}
      </button>
    </>
  );
};

function App() {
  return (
    <>
      <div>io</div>
      <BetaMap data={startupsData} />
    </>
  );
}

export default App;
