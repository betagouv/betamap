//@ts-check

import createColor from "create-color";
import { phases, getStartupMembers } from "./utils.js";

// compile JSON from beta.gouv API
const build = async () => {
  const startups = await await fetch(
    "https://beta.gouv.fr/api/v2.6/startups.json",
  ).then((r) => r.json());
  const authors = await await fetch(
    "https://beta.gouv.fr/api/v2.6/authors.json",
  ).then((r) => r.json());

  const technos = Array.from(
    new Set(
      startups.data.flatMap((s) =>
        s.attributes.technos.map((t) => t.toLowerCase().trim()),
      ),
    ),
  ).filter(Boolean);

  return {
    name: "beta.gouv.fr : produits par techno",
    children: technos.map((techno) => {
      const name = techno;

      return {
        name,
        color: createColor(name, { format: "hsl" }).replace(
          /,(\d+\%)\)$/,
          ",90%)",
        ),
        children: startups.data
          .filter((startup) => startup.attributes.technos.includes(techno))
          .map((startup) => {
            const sortedPhases =
              startup.attributes.phases &&
              startup.attributes.phases
                .filter((phase) => !!phase.start)
                .sort(
                  (a, b) =>
                    new Date(a.start).getTime() - new Date(b.start).getTime(),
                );
            const lastPhase =
              sortedPhases &&
              sortedPhases.length &&
              sortedPhases[sortedPhases.length - 1];
            const members = getStartupMembers(authors, startup.id);
            return {
              id: startup.id,
              type: "produit",
              name: startup.attributes.name,
              color: phases.find((p) => p.name === lastPhase.name)?.color,
              pitch: startup.attributes.pitch,
              repository: startup.attributes.repository,
              thematiques: startup.attributes.thematiques,
              technos: startup.attributes.technos,
              link: startup.attributes.link,
              value: members.length + 1,
              children: members,
            };
          }),
      };
    }),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
