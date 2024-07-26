//@ts-check
import createColor from "create-color";
import { uniq } from "./utils.js";
import { importApiGouv } from "./utils-apigouv.js";

const build = async () => {
  const markdowns = await importApiGouv();
  const themes = uniq(markdowns.api.flatMap((a) => a.attributes.themes || []));
  return {
    name: "flare",
    children: themes.map((theme) => ({
      name: theme,
      color: createColor(theme, { format: "hsl" }).replace(
        /,(\d+\%)\)$/,
        ",80%)"
      ),
      children: markdowns.api
        .filter((a) => a.attributes.themes.includes(theme))
        .map((a) => ({
          id: a.attributes.title,
          href: `https://api.gouv.fr/les-api/${a.attributes.ghid}`,
          name: a.attributes.title,
          color: "#ccc",
          value: 1,
        })),
    })),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
