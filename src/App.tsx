import React, { ReactNode, useState } from "react";
import { Flare, FlareNode } from "./Flare";

import incubateursData from "./incubateurs.json";
import thematiquesData from "./thematiques.json";
import competencesData from "./competences.json";
import coachesData from "./coaches.json";

import sponsorsData from "./sponsors.json";
import { phases, domaines } from "../scripts/utils";

import "./App.css";

const legendItemsStartups = phases.map((phase) => ({
  label: phase.label,
  color: phase.color,
}));

const legendItemsMembers = domaines.map((domaine) => ({
  label: domaine.label,
  color: domaine.color,
}));

const Legend = ({ onClick, legendItems }) => (
  <div style={{ fontSize: "0.7em" }}>
    {legendItems.map((legendItem) => (
      <span
        key={legendItem.label}
        className="hoverline"
        style={{
          marginRight: 15,
          // cursor: "pointer",
          // textDecoration:
          // (startupFilters.phases.includes(phase.id) && "underline") || "auto",
        }}
        onClick={() => onClick(legendItem)}
      >
        <span
          style={{
            width: 15,
            height: 15,
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: 5,
            backgroundColor: legendItem.color,
          }}
        />
        {legendItem.label}
      </span>
    ))}
  </div>
);

const maps: {
  title: string;
  data: FlareNode;
  type: string;
  Legend?: ReactNode;
}[] = [
  {
    title: "Startups par fabrique et par effectif",
    data: incubateursData,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Startups par thématique et par effectif",
    data: thematiquesData,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Startups par sponsor et par effectif",
    data: sponsorsData,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Startups par coach et par effectif",
    data: coachesData,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Compétences de la communauté par domaine",
    data: competencesData,
    type: "Communauté",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsMembers} />
    ),
  },
];

const uniq = (arr: any[]) => Array.from(new Set(arr));

function App() {
  const [map, setMap] = useState(maps[0].title);
  const onChangeMap = (e) => {
    setMap(e.target.value);
  };
  const mapTypes = uniq(maps.map((m) => m.type));

  console.log("mapTypes", mapTypes);
  const selectedMap = maps.find((m) => m.title === map);
  return (
    <>
      <h1>beta.gouv.fr map</h1>
      <select onChange={onChangeMap} style={{ fontSize: "1.2rem" }}>
        {maps.map((map) => (
          <option>{map.title}</option>
        ))}
      </select>
      <br />
      <br />
      <selectedMap.Legend />
      <br />
      <Flare data={selectedMap?.data} />
    </>
  );
}

export default App;
