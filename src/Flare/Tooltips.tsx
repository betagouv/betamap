import memoizee from "memoizee";

const sumCount = memoizee(
  (service: { children: any[] }) =>
    1 +
    ((service.children || []).length
      ? service.children.reduce((a, c) => a + sumCount(c), 0)
      : 0)
);

const sumPersonnes = memoizee(
  (service: { children: any[]; personnes: any[] }) =>
    (service.personnes || []).length +
    (service.children || []).reduce((a, c) => a + sumPersonnes(c), 0)
);

export const TooltipProduit = ({ data }) => (
  <div>
    <b>{data.name}</b>
    <br />
    <br />
    {data.pitch}
    <br />
    <br />
    <a href={`https://beta.gouv.fr/startups/${data.id}.html`} target="_blank">
      fiche beta.gouv.fr
    </a>
    <br />
    <br />
    {(data.children && data.children.length && (
      <>
        {data.children.length} membre
        {data.children && data.children.length > 1 ? "s" : ""} actif
        {data.children && data.children.length > 1 ? "s" : ""}
      </>
    )) ||
      null}
  </div>
);

export const TooltipFabrique = ({ data }) => {
  return (
    <div>
      <b>{data.name}</b>
      <br />
      <br />
      <a
        href={`https://beta.gouv.fr/incubateurs/${data.id}.html`}
        target="_blank"
      >
        fiche beta.gouv.fr
      </a>
      <br />
      <br />
      {data.children.length} produit{data.children.length > 1 ? "s" : ""}{" "}
      numérique{data.children.length > 1 ? "s" : ""}
    </div>
  );
};
export const TooltipMember = ({ data }) => {
  return (
    <div>
      <b>{data.name}</b>
      <br />
      <br />
      {data.domaine} : {data.role}
      <br />
      <br />
      <a
        href={`https://espace-membre.incubateur.net/community/${data.id}`}
        target="_blank"
      >
        fiche espace-membre
      </a>
      <br />
      <br />
      {data.github && (
        <>
          <a href={`https://github.com/${data.github}`} target="_blank">
            fiche GitHub
          </a>
          <br />
          <br />
        </>
      )}
      {data.link && (
        <>
          <a href={data.link} target="_blank">
            {data.link.replace(/^https:\/\//, "")}
          </a>
          <br />
          <br />
        </>
      )}
    </div>
  );
};

// const findStructure = (node, id) => {
//   if (node.id === id) {
//     return node;
//   }
//   for (const child of node.children || []) {
//     const found = findStructure(child, id);
//     if (found) {
//       return found;
//     }
//   }

//   return null;
// };

// const findParentStructure = (node, id) => {
//   if (node.children.map((c) => c.id).includes(id)) {
//     return node;
//   }
//   for (const child of node.children || []) {
//     const found = findParentStructure(child, id);
//     if (found) {
//       return found;
//     }
//   }
//   return null;
// };

export const TooltipAdministrationDila = ({ node }) => (
  <>
    <h2>{node.name}</h2>
    <div style={{ textAlign: "left" }}>
      <p>
        Ce service compte {sumCount(node)} structure
        {sumCount(node) > 1 ? "s" : ""} et {sumPersonnes(node)} contact
        {sumPersonnes(node) > 1 ? "s" : ""}
      </p>
      {node.id && (
        <a
          href={`https://lannuaire.service-public.fr/gouvernement/${node.id}`}
          target="_blank"
        >
          Fiche annuaire service-public
        </a>
      )}
      {(node.site_internet && node.site_internet.length && (
        <div>
          <h3>Liens:</h3>
          <ul style={{ padding: 0 }}>
            {node.site_internet
              .filter((s) => s.valeur)
              .map((s) => (
                <li key={s.valeur} style={{ listStyleType: "none" }}>
                  <a target="_blank" href={s.valeur}>
                    {s.libelle || s.valeur}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )) ||
        null}
      {node.mission && (
        <div>
          <h3>Mission:</h3>
          <p>{node.mission}</p>
        </div>
      )}
      {(node.organigramme && node.organigramme.length && (
        <div>
          <h3>Organigrammes:</h3>
          <ul style={{ padding: 0 }}>
            {node.organigramme
              .filter((s) => s.valeur)
              .map((s) => (
                <li key={s.valeur} style={{ listStyleType: "none" }}>
                  <a target="_blank" href={s.valeur}>
                    {s.libelle || "Organigramme"}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )) ||
        null}
      {(node.formulaire_contact && node.formulaire_contact.length && (
        <div>
          <h3>Contact:</h3>
          <ul style={{ padding: 0 }}>
            {node.formulaire_contact.map((s) => (
              <li key={s} style={{ listStyleType: "none" }}>
                <a target="_blank" href={s}>
                  {"Contact"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )) ||
        null}

      {(node.texte_reference && node.texte_reference.length && (
        <div>
          <h3>Textes de référérence</h3>
          <ul style={{ padding: 0 }}>
            {node.texte_reference
              .filter((t) => t.valeur)
              .map((t) => (
                <li style={{ listStyleType: "none" }}>
                  <i />
                  <a target="_blank" href={t.valeur}>
                    {t.libelle}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )) ||
        null}
      {(node.personnes && node.personnes.length && (
        <div>
          <h3>Personnes</h3>
          <ul style={{ padding: 0 }}>
            {node.personnes
              .filter((p) => p.personne)
              .map((p) => {
                const href =
                  p.personne.texte_reference &&
                  p.personne.texte_reference.length
                    ? p.personne.texte_reference[0].valeur
                    : "";
                const civilite = `${p.personne.civilite || ""} ${
                  p.personne.nom || ""
                } ${p.personne.prenom || ""}`.trim();
                const description = (
                  <>
                    {p.fonction}
                    {civilite ? ": " : ""}
                  </>
                );
                return (
                  <li style={{ listStyleType: "none" }}>
                    <i />
                    {description}
                    {href ? (
                      <a target="_blank" href={href}>
                        {civilite}
                      </a>
                    ) : (
                      civilite
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )) ||
        null}
    </div>
  </>
);
