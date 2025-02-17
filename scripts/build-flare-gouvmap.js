//@ts-check
import unzipper from "unzipper";
import Stream from "stream";

// load ZIP and return JSON
export const importFromDataGouv = () => {
  const zipUrl =
    "https://www.data.gouv.fr/fr/datasets/r/d0158eb2-6772-49c2-afb1-732e573ba1e5";

  return new Promise(async (resolve) => {
    const dataStream = await fetch(zipUrl).then((r) => r.body);
    if (!dataStream) return;
    let content;
    // @ts-ignore todo
    await Stream.Readable.fromWeb(dataStream)
      .pipe(unzipper.Parse())
      .on("entry", async function (entry) {
        let drain = true;
        if (entry.path.match(new RegExp(`\.json$`))) {
          drain = false;
          content = (await entry.buffer()).toString();
        }
        if (drain) entry.autodrain();
      })
      .on("finish", () => {
        resolve(JSON.parse(content));
      })
      .on("error", (e) => {
        console.log("e", e);
        throw e;
      })
      .promise();
  });
};

const getServiceNode = (service, datagouvJson) => {
  return {
    name: service.nom,
    data: {
      id: service.id,
      nom: service.nom,
      type_organisme: service.type_organisme,
      formulaire_contact: service.formulaire_contact,
      site_internet: service.site_internet,
      personnes: service.affectation_personne,
      organigramme: service.organigramme,
      reseau_social: service.reseau_social,
      texte_reference: service.texte_reference,
      type: "service",
    },
    children: service.hierarchie
      .map((h) => unfoldService(h, datagouvJson))
      .filter(Boolean),
    value: 1,
  };
};

const unfoldService = (hierarchie, datagouvJson) => {
  const service =
    datagouvJson.service &&
    datagouvJson.service.find((s) => s.id === hierarchie.service);
  if (service) {
    return {
      ...getServiceNode(service, datagouvJson),
      type: hierarchie.type_hierarchie,
    };
  } else {
  }
};

const build = async () => {
  const datagouvJson = await importFromDataGouv();
  const nodes =
    datagouvJson.service &&
    datagouvJson.service.map((s) => getServiceNode(s, datagouvJson));

  const allChildrenIds = nodes.flatMap((n) => n.children.map((c) => c.data.id));

  const rootNodes = nodes.filter((n) => !allChildrenIds.includes(n.data.id));
  const rootNode = rootNodes.find((n) => n.name === "Administration centrale");

  return rootNode;
};

build().then((flare) => console.log(JSON.stringify(flare, null, 2)));
