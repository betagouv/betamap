//@ts-check

import createColor from "create-color";
import { domaines } from "./utils.js";

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

  const competences = Array.from(
    new Set(authors.flatMap((s) => s.competences))
  ).filter(Boolean);

  return {
    name: "beta.gouv.fr: compétences dans la communauté",
    children: competences.map((competence) => {
      const name = competence;

      return {
        name,
        color: createColor(name, { format: "hsl" }).replace(
          /,(\d+\%)\)$/,
          ",90%)"
        ),
        children: authors
          .filter(
            (author) =>
              author.competences && author.competences.includes(competence)
          )
          .map((author) => {
            return {
              id: author.id,
              href:
                author.link ||
                (author.github && `https://github.com/${author.github}`),
              name: author.fullname,
              color: domaines.find((p) => p.label === author.domaine)?.color,
              value: 1,
            };
          }),
      };
    }),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
