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
