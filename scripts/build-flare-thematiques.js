//@ts-check

import createColor from "create-color";
import { getStartupMembers } from "./utils.js";

const phases = [
  { name: "investigation", label: "Investigation", color: "#ffd17a" },
  { name: "construction", label: "Construction", color: "#ff914d" },
  { name: "acceleration", label: "Accélération", color: "#fa6bbc" },
  { name: "success", label: "Pérennisé", color: "#0bffb3" },
  { name: "transfer", label: "Transfert", color: "#1fbcff" },
  { name: "alumni", label: "Partenariat terminé", color: "#aaa" },
];

// compile JSON from beta.gouv API
const build = async () => {
  const startups = await await fetch(
    "https://beta.gouv.fr/api/v2.6/startups.json"
  ).then((r) => r.json());
  const incubators = await await fetch(
    "https://beta.gouv.fr/api/v2.6/incubators.json"
  ).then((r) => r.json());
  const authors = await await fetch(
    "https://beta.gouv.fr/api/v2.6/authors.json"
  ).then((r) => r.json());

  const thematiques = Array.from(
    new Set(startups.data.flatMap((s) => s.attributes.thematiques))
  );

  return {
    name: "flare",
    children: thematiques.map((thematique) => {
      const name = thematique;

      return {
        name,
        color: createColor(name, { format: "hsl" }).replace(
          /,(\d+\%)\)$/,
          ",90%)"
        ),
        children: startups.data
          .filter((startup) =>
            startup.attributes.thematiques.includes(thematique)
          )
          .map((startup) => {
            const sortedPhases =
              startup.attributes.phases &&
              startup.attributes.phases
                .filter((phase) => !!phase.start)
                .sort((a, b) => new Date(a.start) - new Date(b.start));
            const firstPhase =
              sortedPhases && sortedPhases.length && sortedPhases[0];
            const lastPhase =
              sortedPhases &&
              sortedPhases.length &&
              sortedPhases[sortedPhases.length - 1];
            const members = getStartupMembers(authors, startup.id);
            return {
              id: startup.id,
              name: startup.attributes.name,
              // children: members.map((member) => ({
              //   name: member.fullname,
              //   github: member.github,
              //   value: 1,
              // })),
              color: phases.find((p) => p.name === lastPhase.name)?.color,
              pitch: startup.attributes.pitch,
              repository: startup.attributes.repository,
              thematiques: startup.attributes.thematiques,
              link: startup.attributes.link,
              value: members.length + 1,
            };
          }),
      };
    }),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
