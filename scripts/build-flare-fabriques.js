import { phases, getStartupMembers } from "./utils.js";

// compile JSON from beta.gouv API
const build = async () => {
  const startups = await await fetch(
    "https://beta.gouv.fr/api/v2.6/startups.json"
  ).then((r) => r.json());
  const authors = await await fetch(
    "https://beta.gouv.fr/api/v2.6/authors.json"
  ).then((r) => r.json());
  const incubators = await await fetch(
    "https://beta.gouv.fr/api/v2.6/incubators.json"
  ).then((r) => r.json());
  const organisations = await await fetch(
    "https://beta.gouv.fr/api/v2.6/organisations.json"
  ).then((r) => r.json());

  return {
    name: "Fabriques du réseau beta.gouv.fr",
    children: Object.keys(incubators).map((incubator) => {
      const name = incubators[incubator].title;
      return {
        name,
        children: startups.data
          .filter(
            (startup) => startup.relationships.incubator.data.id === incubator
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
              color: phases.find((p) => p.name === lastPhase.name)?.color,
              pitch: startup.attributes.pitch,
              repository: startup.attributes.repository,
              link: startup.attributes.link,
              dateStart: firstPhase.start,
              phase: lastPhase.name,
              phaseStart: lastPhase.start,
              href: `https://beta.gouv.fr/startups/${startup.id}.html`,
              children: members.map((member) => ({
                name: member.fullname,
                github: member.github,
                value: 1,
              })),
              sponsors: startup.attributes.sponsors
                .map((sponsor) =>
                  organisations.find(
                    (org) =>
                      org.id === sponsor.replace(/^\/organisations\//, "")
                  )
                )
                .filter(Boolean),
              value: members.length + 1,
            };
          }),
      };
    }),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
