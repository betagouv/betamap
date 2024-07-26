//@ts-check
import createColor from "create-color";
import { uniq } from "./utils.js";
import { importApiGouv } from "./utils-apigouv.js";

const build = async () => {
  const markdowns = await importApiGouv();
  const producers = uniq(markdowns.api.map((a) => a.attributes.producer));
  return {
    name: "flare",
    children: producers.map((producer) => ({
      name: producer,
      color: createColor(producer, { format: "hsl" }).replace(
        /,(\d+\%)\)$/,
        ",80%)"
      ),
      children: markdowns.api
        .filter((a) => a.attributes.producer === producer)
        .map((a) => ({
          id: a.attributes.title,
          href: `https://api.gouv.fr/les-api/${a.attributes.ghid}`,
          name: a.attributes.title,
          color: createColor(
            a.attributes.themes.length ? a.attributes.themes[0] : "",
            { format: "hsl" }
          ).replace(/,(\d+\%)\)$/, ",80%)"),
          value: 1,
        })),
    })),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
