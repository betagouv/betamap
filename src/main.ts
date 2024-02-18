import "./style.css";

import { drawChart, drawLegend, onLegendClick } from "./flare";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Les startups d'état par structure et par effectif</h1>
    <div id="legend"></div>
    <div id="viz"></div>
  </div>
`;

//@ts-ignore

drawChart(document.querySelector<HTMLDivElement>("#viz")!);
drawLegend(document.querySelector<HTMLDivElement>("#legend")!);

window.onLegendClick = onLegendClick;
