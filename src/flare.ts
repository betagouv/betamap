// adapted from https://observablehq.com/@d3/zoomable-circle-packing@165
import * as d3 from "d3";

import { default as startupsData } from "./startups.json";

interface CircleNodeRoot {
  name: string;
  value?: number;
  children: CircleNodeIncubateur[];
}

interface CircleNodeIncubateur {
  name: string;
  value?: number;
  children: CircleNode[];
}

interface CircleNode {
  id: string;
  name: string;
  phase: string;
  phaseStart: string;
  pitch: string;
  repository?: string;
  link?: string;
  value: number;
}

type PhaseType = {
  id: string;
  label: string;
  color: string;
};

function createPhasesArray<
  T extends readonly PhaseType[] & Array<{ id: V }>,
  V extends string
>(...args: T) {
  return args;
}

const phases = createPhasesArray(
  { id: "investigation", label: "Investigation", color: "#ffd079" },
  { id: "construction", label: "Construction", color: "#ff914d" },
  { id: "acceleration", label: "Accélération", color: "#fa6bbc" },
  { id: "success", label: "Pérennisé", color: "#0bffb3" },
  { id: "transfer", label: "Transfert", color: "#1fbcff" },
  { id: "alumni", label: "Partenariat terminé", color: "#aaa" }
);

type Phase = (typeof phases)[number]["id"];

const getPhaseKey = (id: Phase, key: "label" | "color") => {
  const phaseData = phases.find((p) => p.id === id);
  if (phaseData) {
    return phaseData[key];
  }
  return null;
};

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // on resize, move the vizdetail
    const node = d3.select(entry.target).select("svg").node() as Element;
    if (node) {
      const { width, height } = node.getBoundingClientRect();
      const minSize = Math.min(width, height);
      const details = d3.select(entry.target).select("#vizdetail");
      details
        .style("width", minSize + "px")
        .style("left", (window.innerWidth - minSize) / 2 + "px");
    }
  }
});

type StatupData = {
  name: string;
  phase: Phase;
  phaseStart: string;
  pitch: string;
  link: string;
  id: string;
  repository: string;
};

const getStartupTemplate = (startupData: StatupData) => {
  return `
          <h2>${startupData.name}</h2>
          
          Phase: ${getPhaseKey(startupData.phase, "label")}
          <br/>
          ${
            (startupData.phaseStart &&
              `<span style="font-size:0.8em">Depuis le: ${toDateFr(
                startupData.phaseStart
              )}</span>`) ||
            ""
          }
          <br/>
          <br/>
          <p>${startupData.pitch}</p>
          <br/>
          <img src="https://beta.gouv.fr/img/startups/${startupData.id}.png">
          ${
            (startupData.link &&
              `<p>🌍 <a href="${startupData.link}" target="_blank">${startupData.link}</a></p>`) ||
            ""
          }
          <p>ℹ️ <a href="https://beta.gouv.fr/startups/${
            startupData.id
          }.html" target="_blank">Fiche beta.gouv.fr</a></p>
          ${
            (startupData.repository &&
              `<p>📦 <a href="${startupData.repository}" target="_blank">Code source</a></p>`) ||
            ""
          }
        `;
};
const shortify = (str: string, maxLength = 30) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

const slugify = (str: string) => str.replace(/[\W]/g, "-").toLowerCase();

const toDateFr = (str: string) => str && str.split("-").reverse().join("/");

const svgDefs = `
<defs>
  <linearGradient id="gradient-investigation">
     <stop offset="0%" stop-color="var(--color-investigation)" />
     <stop offset="100%" stop-color="var(--color-investigation--light)" />
  </linearGradient>
  <linearGradient id="gradient-construction">
     <stop offset="0%" stop-color="var(--color-construction)" />
     <stop offset="100%" stop-color="var(--color-construction--light)" />
  </linearGradient>
  <linearGradient id="gradient-acceleration">
     <stop offset="0%" stop-color="var(--color-acceleration)" />
     <stop offset="100%" stop-color="var(--color-acceleration--light)" />
  </linearGradient>
  <linearGradient id="gradient-success">
     <stop offset="0%" stop-color="var(--color-success)" />
     <stop offset="100%" stop-color="var(--color-success--light)" />
  </linearGradient>
  <linearGradient id="gradient-transfer">
     <stop offset="0%" stop-color="var(--color-transfer)" />
     <stop offset="100%" stop-color="var(--color-transfer--light)" />
  </linearGradient>
  <linearGradient id="gradient-alumni">
     <stop offset="0%" stop-color="var(--color-alumni)" />
     <stop offset="100%" stop-color="var(--color-alumni--light)" />
  </linearGradient>

</defs
`;

// const color = d3
//   .scaleLinear()
//   .domain([0, 5])
//   //@ts-ignore
//   .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
//   //@ts-ignore
//   .interpolate(d3.interpolateHcl);

//const svgDefsElement = document.createElement(svgDefs);

const width = 700;
const height = 700;

export function drawChart(
  container: HTMLElement,
  data: CircleNodeRoot = startupsData
) {
  resizeObserver.observe(container);

  d3.select(container)
    .append("svg")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", "transparent")
    .html(svgDefs);

  return loadData(container, data);
}

let currentPhase;
export const onLegendClick = (phase) => {
  //l//oadData(svg, container, data);
  d3.select(document.querySelector<HTMLDivElement>("#viz"))
    .selectAll("g")
    .remove();
  const container = document.querySelector<HTMLDivElement>("#viz");
  if (currentPhase === phase) {
    currentPhase = "";

    return loadData(container, startupsData);
  }
  currentPhase = phase;
  return loadData(container, {
    ...startupsData,
    children: [
      ...startupsData.children.map((child) => ({
        ...child,
        children: child.children.filter((d) => d.phase === phase),
      })),
    ],
  });
};

export function loadData(container, data = startupsData) {
  const svg = d3
    .select(container)
    .select("svg")
    .on("click", (event) => {
      console.log("root.onclick", event);
      d3.selectAll("circle").attr("stroke", null);
      zoomDepth = 0;
      zoom(event, root);
    })
    .append("g");
  //svg.attr("style", "opacity:0").transition().attr("style", "opacity:1");
  const root = d3.pack().size([width, height]).padding(2)(
    d3
      .hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
  );

  let focus = root;
  //@ts-ignore
  let view;
  let zoomDepth = 0;

  const vizDetail = d3.select(container).append("div").attr("id", "vizdetail");

  // add the circles for incubators
  const incubators = svg
    .append("g")
    .selectAll("circle")
    .data(root.descendants().filter((node) => node.depth === 1))
    .join(
      function (enter) {
        return enter
          .append("circle")
          .attr("fill", "var(--color-incubators)")
          .attr("id", (node) => `incubator-${slugify(node.data.name)}`)
          .attr(
            "class",
            (node) => `incubator incubator--${slugify(node.data.name)}`
          );

        //.attr(
        //.append("circle").style("opacity", 0.25);/
      },
      function (update) {
        return update;
      },
      function (exit) {
        return exit.transition("incubators").style("opacity", 0).remove();
      }
    );
  //.exit((node) => node.remove());
  // .transition("incubators")
  // .attr("style", "opacity:1");
  //.transition();
  //.attr("style", "opacity:1");

  // .join("circle")
  // .attr("fill", "var(--color-incubators)")
  // .attr("id", (node) => `incubator-${slugify(node.data.name)}`)
  // .attr("class", (node) => `incubator incubator--${slugify(node.data.name)}`);
  // .join(
  //   function enter(enter) {
  //     return enter;
  //   },
  //   function update() {},
  //   function exit() {}
  // );
  //    .attr("stroke", "red");

  // add the circles for startups
  const startups = svg
    .append("g")
    .selectAll("circle")
    .data(root.descendants().filter((node) => node.depth === 2))
    .join("circle")
    // .transition("startups")
    // .attr("style", "opacity:1")

    .attr("alt", (node) => `Startup d'état "${node.data.name}"`)
    .attr("class", (node) => `startup startup--${slugify(node.data.name)}`)
    .attr("data-incubator", function (node) {
      const incubator = slugify(node.parent.data.name);
      return incubator;
    })
    .attr("fill", function (node) {
      //@ts-ignore
      // const circleColor = getPhaseKey(d.data.phase, "color") || "white";
      //   return d.children ? color(d.depth) : circleColor;
      return `url(#gradient-${getPhaseKey(node.data.phase, "id")})`;
    });

  svg
    .selectAll("circle")
    .on("mouseover", function (event, node: any) {
      d3.select(this).attr("stroke", "#bbb");
      if (node.depth === 2) {
        d3.select(`#incubator-${slugify(node.parent.data.name)}`).attr(
          "stroke",
          "#888"
        );
      }
    })
    .on("mouseout", function (_, node) {
      d3.selectAll("circle").attr("stroke", null);
    })
    .on("click", function (event, d) {
      const depth = d.depth;
      if (depth === zoomDepth) {
        zoomDepth -= 1;
        zoom(event, d.parent);
      } else if (depth === zoomDepth + 1 || depth === zoomDepth - 1) {
        zoomDepth = depth || 0;
        if (focus !== d) {
          zoom(event, d);
        }
      } else {
        zoomDepth += 1;
        zoom(event, d.parent);
      }
      event.stopPropagation();
    });

  // add the labels for all nodes
  const labels = svg
    .append("g")
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(
      root
        .descendants()
        .filter((n) => (n.depth === 1 ? n.data.children.length > 0 : true))
    )
    .join("text")
    // .transition("labels")
    // .attr("style", "opacity:1")
    .attr("class", (node) => {
      return node.depth === 1 && "incubator-label";
    })
    .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
    .style("display", (d) => (d.parent === root ? "inline" : "none"))
    // shortify labels for startups
    //@ts-ignore
    .text((d) => (d.depth === 2 && shortify(d.data.name)) || d.data.name);

  //@ts-ignore
  function zoomTo(v) {
    const k = width / v[2];

    view = v;

    labels.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    incubators.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    incubators.attr("r", (d) => d.r * k);
    startups.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    startups.attr("r", (d) => d.r * k);
  }

  //@ts-ignore
  function zoom(event: MouseEvent, d) {
    focus = d;

    console.log("zoom", svg, svg.transition);

    const transition = svg
      .transition("zoom")
      .duration(event.altKey ? 7500 : 750)
      .tween("zoom", () => {
        //@ts-ignore
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        //@ts-ignore
        return (t) => zoomTo(i(t));
      });

    if (zoomDepth === 2) {
      // show startup details
      //console.log(d);
      const node = svg.node();
      if (node) {
        const { width, height } = node.getBoundingClientRect();
        const minSize = Math.min(width, height);
        vizDetail
          .style("width", minSize + "px")
          .style("left", (window.innerWidth - minSize) / 2 + "px")
          .html(getStartupTemplate(d.data))
          .transition("viz")
          .delay(300)
          .style("display", "block")
          .duration(event.altKey ? 7500 : 750)
          .style("opacity", 1);
      }
    } else {
      vizDetail
        .transition("viz")
        .duration(event.altKey ? 7500 : 300)
        .style("opacity", 0)
        .on("end", () => {
          vizDetail.style("display", "none");
        });
    }

    labels
      .filter(function (d) {
        //@ts-ignore
        return d.parent === focus || this.style.display === "inline";
      })
      //@ts-ignore
      .transition(transition)
      .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
      .on("start", function (d) {
        //@ts-ignore
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        //@ts-ignore
        if (d.parent !== focus) this.style.display = "none";
      });
  }

  svg
    .selectAll("circle")
    .attr("style", "opacity:0")
    .transition()
    .delay(() => Math.random() * 200)
    .attr("style", "opacity:1");

  zoomTo([root.x, root.y, root.r * 2]);

  return svg.node();
}

export const drawLegend = (container: HTMLElement) => {
  container.innerHTML = `
  ${phases
    .map(
      (phase) =>
        `<li style="cursor:pointer" onClick="onLegendClick('${phase.id}')"><span style="background-color:${phase.color}" class="color"></span>${phase.label}</li>`
    )
    .join("\n")}
    <br/>
    <br/>
  `;
};
