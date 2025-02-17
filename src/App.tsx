import React, { ReactNode, useState } from "react";
import { Flare, FlareNode } from "./Flare";

import incubateursData from "./incubateurs.json";
import thematiquesData from "./thematiques.json";
import competencesData from "./competences.json";
import coachesData from "./coaches.json";
import apigouvThemes from "./apigouv-themes.json";
import apigouvProducteurs from "./apigouv-producteurs.json";
import codeGouvDependencies from "./codegouv-dependencies.json";
import gouvMapDependencies from "./gouvmap.json";

import sponsorsData from "./sponsors.json";
import { phases, domaines } from "../scripts/utils";

import "./App.css";

type LegendItem = {
  label: string;
  color: string;
};

const legendItemsStartups: LegendItem[] = phases.map((phase) => ({
  label: phase.label,
  color: phase.color,
}));

const legendItemsMembers: LegendItem[] = domaines.map((domaine) => ({
  label: domaine.label,
  color: domaine.color,
}));

const Legend = <T extends LegendItem>({
  onClick,
  legendItems,
}: {
  legendItems: T[];
  onClick: (arg0: T) => void;
}) => (
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
  Legend?: (arg0: any) => ReactNode;
}[] = [
  {
    title: "Produits par fabrique et par effectif",
    data: incubateursData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Produits par thématique et par effectif",
    data: thematiquesData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Produits par sponsor et par effectif",
    data: sponsorsData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
  },
  {
    title: "Produits par coach et par effectif",
    data: coachesData,
    type: "Produits",
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
  {
    title: "APIs par thématique",
    data: apigouvThemes,
    type: "api.gouv.fr",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />
  },
  {
    title: "APIs par producteur",
    data: apigouvProducteurs,
    type: "api.gouv.fr",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />
  },
  {
    title: "Repos par écosystème et dépendance",
    data: codeGouvDependencies,
    type: "code.gouv.fr",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />
  },
  {
    title: "L'administration centrale par effectif",
    data: gouvMapDependencies,
    type: "DILA",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />
  },
];

const uniq = (arr: any[]) => Array.from(new Set(arr));

function App() {
  const [map, setMap] = useState(maps[0].title);
  const onChangeMap = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMap(e.target.value);
  };
  const mapTypes = uniq(maps.map((m) => m.type));

  const selectedMap = maps.find((m) => m.title === map);
  return (
    <>
      <h1>beta.gouv.fr map</h1>
      <select onChange={onChangeMap} style={{ fontSize: "1.2rem" }}>
        {mapTypes.map((type) => (
          <optgroup label={type} key={type}>
            {maps
              .filter((m) => m.type === type)
              .map((map) => (
                <option key={map.title}>{map.title}</option>
              ))}
          </optgroup>
        ))}
      </select>
      <br />
      <br />
      {selectedMap && selectedMap.Legend && (
        <>
          <selectedMap.Legend />
          <Flare data={selectedMap.data} />
        </>
      )}
    </>
  );
}

export default App;
