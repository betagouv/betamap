export const getStartupMembers = (authors, startupId) => {
  return authors
    .filter(
      (author) =>
        author.missions &&
        author.missions
          .filter(
            (mission) =>
              new Date(mission.start) <= new Date() &&
              new Date(mission.end) >= new Date()
          )
          .flatMap((mission) => mission.startups || [])
          .includes(startupId)
    )
    .map((author) => ({
      name: author.fullname,
      domaine: author.domaine,
      link: author.link,
      role: author.role,
      id: author.id,
      type: "member",
      github: author.github,
      value: 1,
      children: getMemberChildren(author),
    }));
};

export const getMemberChildren = (author) =>
  [
    author.github && {
      name: "github",
      type: "github",
      href: `https://github.com/${author.github}`,
      value: 1,
    },
    author.link && {
      name: "link",
      type: "link",
      href: author.link,
      value: 1,
    },
    {
      name: "fiche membre",
      type: "link",
      href: `https://espace-membre.incubateur.net/community/${author.id}`,
      value: 1,
    },
  ].filter(Boolean);
/**
 *
 * @param {number[]} arr
 * @returns
 */
export const sum = (arr) => arr.reduce((a, c) => a + c, 0);

export const domaines = [
  { label: "Développement", color: "#FFB7AE" },
  { label: "Déploiement", color: "#FF9575" },
  { label: "Animation", color: "#869ECE" },
  { label: "Intraprenariat", color: "#34CB6A" },
  { label: "Design", color: "#21AB8E" },
  { label: "Data", color: "#AEA397" },
  { label: "Produit", color: "#e1000f" },
  { label: "Coaching", color: "#5d2c20" },
  { label: "Autre", color: "#aaa" },
];

export const phases = [
  { name: "investigation", label: "Investigation", color: "#FFB7AE" },
  { name: "construction", label: "Construction", color: "#FF9575" },
  { name: "acceleration", label: "Accélération", color: "#869ECE" },
  { name: "success", label: "Pérennisé", color: "#34CB6A" },
  { name: "transfer", label: "Transfert", color: "#21AB8E" },
  { name: "alumni", label: "Partenariat terminé", color: "#AEA397" },
];

export const uniq = (arr) => Array.from(new Set(arr));

export const shortify = (str, maxLength = 50) => {
  if (str.startsWith("https://github.com/")) {
    return str.replace(/^https:\/\/github\.com\//, "");
  }
  if (str.length > maxLength) return str.slice(0, maxLength) + "...";
  return str;
};
