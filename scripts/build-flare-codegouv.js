//@ts-check

import createColor from "create-color";
import { uniq, sum } from "./utils.js";

const enabledOrgsList = [
  "https://github.com/betagouv",
  "https://github.com/socialgouv",
  "https://github.com/codegouvfr",
  "https://github.com/numerique-gouv",
  "https://github.com/MTES-MCT",
  "https://gitlab.com/incubateur-territoires", // bug
  "https://github.com/incubateur-ademe",
];

const getCodegouvData = async () => {
  /** @type {{name: string, organization_url: string, platform: string}[]} */
  const orgs = await fetch(
    "https://code.gouv.fr/data/organizations/json/all.json"
  ).then((r) => r.json());
  const repos = await fetch(
    "https://code.gouv.fr/data/repositories/json/all.json"
  ).then((r) => r.json());
  /** @type {{t: string, n: string, r: string[]}[]} */
  const deps = await fetch("https://code.gouv.fr/data/deps.json").then((r) =>
    r.json()
  );

  const enabledOrgs = orgs.filter((o) =>
    enabledOrgsList
      .map((o2) => o2.toLowerCase())
      .includes(o.organization_url.toLowerCase())
  );

  const enabledDeps = deps.filter((d) =>
    d.r.find((r) =>
      enabledOrgs.find(
        (o) => true
        //r.toLowerCase().startsWith(o.organization_url.toLowerCase())
      )
    )
  );

  enabledDeps.sort((a, b) => b.r.length - a.r.length);

  // console.log("enabledOrgs", enabledOrgs);
  // console.log("enabledDeps", enabledDeps.slice(0, 10));

  return enabledDeps;
};

const isEnabledOrgRepo = (repo) => true;
// enabledOrgsList
//   .map((org) => org.toLowerCase())
//   .find((org) => repo.toLowerCase().startsWith(org));

const groups = {
  npm: {
    React: ["react", "@babel", "React", "react-dom"],
    axios: ["axios"],
    mui: ["mui"],
    sentry: ["@sentry", "sentry"],
    eslint: ["eslint"],
    d3: ["d3"],
    typescript: ["@types", "typescript", "tsc", "ts-node"],
    prisma: ["prisma"],
    PostgreSQL: ["pg", "PostgreSQL"],
    angular: ["angular", "ng"],
    nextjs: ["nextjs", "next"],
    vue: ["vue"],
    jest: ["jest"],
    express: ["express"],
    lodash: ["lodash"],
    gatsby: ["gatsby"],
    yaml: ["yaml"],
    markdown: ["markdown"],
    emotion: ["emotion"],
    typeorm: ["typeorm"],
    tiptap: ["tiptap"],
    tanstack: ["tanstack"],
  },
  pypi: {
    django: ["django", "Django"],
    fastapi: ["fastapi"],
    flask: ["flask", "Flask"],
    ml: ["huggingface", "metabase", "airflow", "numpy", "pandas"],
  },
  composer: {
    symfony: ["symfony"],
    laravel: ["laravel"],
    doctrine: ["doctrine"],
    wordpress: ["wordpress"],
  },
  bundler: {
    rails: ["rails"],
  },
  maven: {
    spring: ["spring"],
    spark: ["spark"],
  },
  Autres: {},
};

const getGroups = (tech, dep) => {
  if (groups[tech]) {
    const found = Object.entries(groups[tech])
      .filter(([key, values]) =>
        values.find((v) => dep.toLowerCase().startsWith(v.toLowerCase()))
      )
      .map(([key, values]) => key);
    if (found.length) {
      return found;
    }
  }
  return ["Autres"];
};

// compile from https://code.gouv.fr
// group by ecosystem type and thematic
const build = async () => {
  const codeGouvData = await getCodegouvData();
  /** @type {Record<string, {tech: string, groups: string[], dep: string, repos: string[]}[]>} */
  const types = codeGouvData.reduce((a, c) => {
    const tech = c.t || "Autres";
    if (!a[tech]) {
      a[tech] = [];
    }
    if (!a[tech].map((a) => a.dep).includes(c.n))
      a[tech].push({
        tech,
        groups: getGroups(tech, c.n),
        dep: c.n,
        repos: uniq(c.r),
      });
    return a;
  }, {});

  return {
    name: "code.gouv.fr : beta.gouv.fr ecosystem dependencies",
    // ecosystem types
    children: Object.entries(types).map(([type, children]) => {
      const name = type;
      const groups = Array.from(new Set(children.flatMap((c) => c.groups)));
      return {
        name,
        color: createColor(name, { format: "hsl" }).replace(
          /,(\d+\%)\)$/,
          ",90%)"
        ),
        // exosystem sub groups types
        children: groups.map((g) => {
          const childs = children
            .filter((c) => c.groups.includes(g))
            // .filter((c) => {
            //   const repos = uniq(c.repos).filter((r) => isEnabledOrgRepo(r));
            //   return c.repos.length > 1;
            // })
            .map((c) => {
              const repos = uniq(c.repos).filter((r) => isEnabledOrgRepo(r));
              return {
                id: c.dep,
                name: c.dep,
                value: repos.length || 1,
                // repos
                children: repos.map((r) => ({
                  id: r,
                  name: r,
                  value: 1,
                  href: r,
                })),
              };
            });
          return {
            id: g,
            name: g,
            value: sum(childs.map((c) => c.value)),
            children: childs,
          };
        }),
        /*
        [
          ...children.map((dep) => ({
            id: dep.n,
            name: dep.n,
            children: (dep.r || []).map((r) => ({
              id: r,
              name: r,
              value: 1,
            })),
          })),
          {
            id: "Autres",
            name: "Autres",
            children: (dep.r || []).map((r) => ({
              id: r,
              name: r,
              value: 1,
            })),
          },
        ],
        */
        // children: startups.data
        //   .filter((startup) =>
        //     startup.attributes.thematiques.includes(thematique)
        //   )
        //   .map((startup) => {
        //     const sortedPhases =
        //       startup.attributes.phases &&
        //       startup.attributes.phases
        //         .filter((phase) => !!phase.start)
        //         .sort((a, b) => new Date(a.start) - new Date(b.start));
        //     const firstPhase =
        //       sortedPhases && sortedPhases.length && sortedPhases[0];
        //     const lastPhase =
        //       sortedPhases &&
        //       sortedPhases.length &&
        //       sortedPhases[sortedPhases.length - 1];
        //     const members = getStartupMembers(authors, startup.id);
        //     return {
        //       id: startup.id,
        //       href: `https://beta.gouv.fr/startups/${startup.id}.html`,
        //       name: startup.attributes.name,
        //       color: phases.find((p) => p.name === lastPhase.name)?.color,
        //       pitch: startup.attributes.pitch,
        //       repository: startup.attributes.repository,
        //       thematiques: startup.attributes.thematiques,
        //       link: startup.attributes.link,
        //       value: members.length + 1,
        //     };
        //   }),
      };
    }),
  };
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
