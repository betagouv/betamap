//@ts-check
import createColor from "create-color";
import { uniq } from "./utils.js";
import { importApiGouv } from "./utils-apigouv.js";

const build = async () => {
  const markdowns = await importApiGouv();
  const themes = uniq(markdowns.api.flatMap((a) => a.attributes.themes || []));
  return {
    name: "api.gouv.fr: APIs par thématique",
    children: themes.map((theme) => ({
      name: theme,
      children: markdowns.api
        .filter((a) => a.attributes.themes.includes(theme))
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
