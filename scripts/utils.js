export const getStartupMembers = (authors, startupId) => {
  return authors.filter(
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
  );
};

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
