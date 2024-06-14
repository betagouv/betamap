export const getStartupMembers = (authors, startupId) => {
  return authors.filter(
    (author) =>
      // todo: filter by date !
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

export const domaines = [
  { label: "Développement", color: "#ffd17a" },
  { label: "Déploiement", color: "#ff914d" },
  { label: "Animation", color: "#fa6bbc" },
  { label: "Intraprenariat", color: "#0bffb3" },
  { label: "Design", color: "#1fbcff" },
  { label: "Data", color: "#b10000" },
  { label: "Produit", color: "#56be00" },
  { label: "Coaching", color: "#b549ff" },
  { label: "Autre", color: "#aaa" },
];

export const phases = [
  { name: "investigation", label: "Investigation", color: "#ffd17a" },
  { name: "construction", label: "Construction", color: "#ff914d" },
  { name: "acceleration", label: "Accélération", color: "#fa6bbc" },
  { name: "success", label: "Pérennisé", color: "#0bffb3" },
  { name: "transfer", label: "Transfert", color: "#1fbcff" },
  { name: "alumni", label: "Partenariat terminé", color: "#aaa" },
];
