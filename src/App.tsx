import React from "react";

import { useQueryState } from "nuqs";

import { Flare } from "./Flare/index";
import { flares } from "./flares";

import "./App.css";

const uniq = (arr: any[]) => Array.from(new Set(arr));

function App() {
  const [map, setMap] = useQueryState("name", {
    defaultValue: flares[0].title,
  });
  const onChangeMap = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMap(e.target.value);
  };
  const mapTypes = uniq(flares.map((m) => m.type));

  const selectedMap = flares.find((m) => m.title === map);
  return (
    <>
      <h1>beta.gouv.fr map</h1>
      <select
        onChange={onChangeMap}
        defaultValue={map}
        style={{ fontSize: "1.2rem" }}
      >
        {mapTypes.map((type) => (
          <optgroup label={type} key={type}>
            {flares
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
          <Flare data={selectedMap.data} config={selectedMap} />
        </>
      )}
    </>
  );
}

export default App;
