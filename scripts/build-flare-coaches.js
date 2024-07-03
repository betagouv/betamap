//@ts-check

import createColor from "create-color";
import { phases, getStartupMembers } from "./utils.js";

const isActiveMission = (mission) =>
  new Date(mission.start) <= new Date() && new Date(mission.end) >= new Date();

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

  const coaches = {};

  authors.forEach((author) => {
    if (author.domaine === "Coaching") {
      coaches[author.fullname] = [];
      author.missions.filter(isActiveMission).forEach((mission) => {
        if (mission.startups) {
          coaches[author.fullname].push(
            ...mission.startups.map((id) =>
              startups.data.find((s) => s.id === id)
            )
          );
        }
      });
    }
  });

  return {
    name: "flare",
    children: Object.keys(coaches)
      .map((fullname) => {
        //  const name = thematique;

        return {
          name: fullname,
          color: createColor(fullname, { format: "hsl" }).replace(
            /,(\d+\%)\)$/,
            ",90%)"
          ),
          children: coaches[fullname]
            // .filter((startup) =>
            //   startup.attributes.thematiques.includes(thematique)
            // )
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
                href: `https://beta.gouv.fr/startups/${startup.id}.html`,
                name: startup.attributes.name,
                color: phases.find((p) => p.name === lastPhase.name)?.color,
                pitch: startup.attributes.pitch,
                repository: startup.attributes.repository,
                thematiques: startup.attributes.thematiques,
                link: startup.attributes.link,
                value: members.length + 1,
              };
            }),
        };
      })
      .filter((a) => a.children.length),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
