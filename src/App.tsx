import React, { ReactNode, useState } from "react";
import { Flare, FlareNode } from "./Flare";

import incubateursData from "./incubateurs.json";
import thematiquesData from "./thematiques.json";
import competencesData from "./competences.json";
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
          cursor: "pointer",
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
  description: ReactNode;
  data: FlareNode;
  type: string;
  Legend?: ReactNode;
}[] = [
  {
    title: "Startups par fabrique",
    data: incubateursData,
    description: <p>Les startups par fabrique et par effectif actif</p>,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Startups par thématique",
    data: thematiquesData,
    description: <p>Les startups par thématique et par effectif actif</p>,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Startups par sponsor",
    data: sponsorsData,
    description: <p>Les startups par sponsor et par effectif actif</p>,
    type: "Startups",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Compétences de la communauté",
    description: (
      <p>Les compétences des membres de la communauté, par domaine</p>
    ),
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
      <h1>
        beta.gouv.fr map{" "}
        <select onChange={onChangeMap}>
          {mapTypes.map((type) => (
            <optgroup label={type} key={type}>
              {maps
                .filter((m) => m.type === type)
                .map((map) => (
                  <option>{map.title}</option>
                ))}
            </optgroup>
          ))}
        </select>
      </h1>
      {selectedMap?.description}
      <selectedMap.Legend />
      <Flare data={selectedMap?.data} />
    </>
  );
}

export default App;
