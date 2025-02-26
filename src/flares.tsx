import incubateursData from "./fabriques.json";
import thematiquesData from "./thematiques.json";
import competencesData from "./competences.json";
import coachesData from "./coaches.json";
import apigouvThemes from "./apigouv-themes.json";
import apigouvProducteurs from "./apigouv-producteurs.json";
import codeGouvDependencies from "./codegouv-dependencies.json";
import gouvMapDependencies from "./gouvmap.json";
import sponsorsData from "./sponsors.json";

import { phases, domaines } from "../scripts/utils";
import { FlareConfig } from "./Flare/index";
import { Legend, LegendItem } from "./Legend";

import {
  TooltipAdministrationDila,
  TooltipFabrique,
  TooltipMember,
  TooltipProduit,
} from "./Flare/Tooltips";

const legendItemsStartups: LegendItem[] = phases.map((phase) => ({
  label: phase.label,
  color: phase.color,
}));

const legendItemsMembers: LegendItem[] = domaines.map((domaine) => ({
  label: domaine.label,
  color: domaine.color,
}));

export const flares: FlareConfig[] = [
  {
    title: "Produits par fabrique et par effectif",
    data: incubateursData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
    Detail: ({ data }) => {
      if (data.type === "produit") {
        return <TooltipProduit data={data} />;
      } else if (data.type === "member") {
        return <TooltipMember data={data} />;
      } else if (data.type === "fabrique") {
        return <TooltipFabrique data={data} />;
      } else {
        return null;
      }
    },
  },
  {
    title: "Produits par thématique et par effectif",
    data: thematiquesData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
    Detail: ({ data }) => {
      if (data.type === "produit") {
        return <TooltipProduit data={data} />;
      }
    },
  },
  {
    title: "Produits par sponsor et par effectif",
    data: sponsorsData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
    Detail: ({ data }) => {
      if (data.type === "produit") {
        return <TooltipProduit data={data} />;
      }
    },
  },
  {
    title: "Produits par coach et par effectif",
    data: coachesData,
    type: "Produits",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsStartups} />
    ),
    Detail: ({ data }) => {
      if (data.type === "produit") {
        return <TooltipProduit data={data} />;
      } else if (data.type === "member") {
        return <TooltipMember data={data} />;
      }
    },
  },
  {
    title: "Compétences de la communauté par domaine",
    data: competencesData,
    type: "Communauté",
    Legend: ({ onClick }) => (
      <Legend onClick={onClick} legendItems={legendItemsMembers} />
    ),
    Detail: ({ data }) => {
      if (data.type === "member") {
        return <TooltipMember data={data} />;
      }
    },
  },
  {
    title: "APIs par thématique",
    data: apigouvThemes,
    type: "api.gouv.fr",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />,
    Detail: ({ data }) => {
      if (data.type === "apigouv") {
        return (
          <div>
            <b>{data.name}</b>
            <br />
            <br />
            <a href={data.href} target="_blank">
              fiche api.gouv.fr
            </a>
          </div>
        );
      }
    },
  },
  {
    title: "APIs par producteur",
    data: apigouvProducteurs,
    type: "api.gouv.fr",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />,
    Detail: ({ data }) => {
      if (data.type === "apigouv") {
        return (
          <div>
            <b>{data.name}</b>
            <br />
            <br />
            <a href={data.href} target="_blank">
              fiche api.gouv.fr
            </a>
          </div>
        );
      }
    },
  },
  {
    title: "Repos par écosystème et dépendance",
    data: codeGouvDependencies,
    type: "code.gouv.fr",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />,
    Detail: ({ data }) => {
      if (data.type === "repository") {
        return (
          <div>
            <b>GIT: {data.name}</b>
            <br />
            <br />
            <a href={data.href} target="_blank">
              repository
            </a>
          </div>
        );
      } else if (data.type === "dependency") {
        return (
          <div>
            <b>
              Dépendance {data.ecosystem}: {data.name}
            </b>
          </div>
        );
      }
    },
  },
  {
    title: "L'administration centrale",
    data: gouvMapDependencies,
    type: "DILA",
    Legend: ({ onClick }) => null, //<Legend onClick={onClick} legendItems={legendItemsMembers} />,
    Detail: ({ data }) => {
      if (data.type === "service" || data.type === "Service Fils") {
        return <TooltipAdministrationDila node={data} />;
      }
    },
  },
];
