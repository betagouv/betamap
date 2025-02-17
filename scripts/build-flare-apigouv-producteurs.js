//@ts-check
import createColor from "create-color";
import { uniq } from "./utils.js";
import { importApiGouv } from "./utils-apigouv.js";

const build = async () => {
  const markdowns = await importApiGouv();
  const producers = uniq(markdowns.api.map((a) => a.attributes.producer));
  return {
    name: "api.gouv.fr: APIs par producteur",
    children: producers.map((producer) => ({
      name: producer,
      children: markdowns.api
        .filter((a) => a.attributes.producer === producer)
        .map((a) => ({
          id: a.attributes.title,
          href: `https://api.gouv.fr/les-api/${a.attributes.ghid}`,
          name: a.attributes.title,
          value: 1,
        })),
    })),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
