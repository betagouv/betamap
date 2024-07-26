import Stream from "stream";

import unzipper from "unzipper";

import fm from "front-matter";

export const parseMarkdown = (id, content) => {
  try {
    const { attributes, body } = fm(content);
    return { attributes: { ...attributes, ghid: id }, body };
  } catch (e) {
    console.error(e);
    return { attributes: {}, body: null };
  }
};

// load ZIP and parse markdowns
export const importApiGouv = () => {
  const markdownData = {
    api: [],
    producteurs: [],
  };

  const zipUrl =
    "https://github.com/betagouv/api.gouv.fr/archive/refs/heads/master.zip";

  return new Promise(async (resolve) => {
    const dataStream = await fetch(zipUrl).then((r) => r.body);
    if (!dataStream) return;

    // @ts-ignore
    await Stream.Readable.fromWeb(dataStream)
      .pipe(unzipper.Parse())
      .on("entry", function (entry) {
        let drain = true;
        Object.keys(markdownData).forEach(async (key) => {
          if (entry.path.match(new RegExp(`/_data\/${key}\/.*\.md$`))) {
            drain = false;
            const id = entry.path.replace(/^.*\/([^/]*)\.md$/, "$1");
            const content = (await entry.buffer()).toString();
            markdownData[key].push(parseMarkdown(id, content));
          }
        });
        if (drain) entry.autodrain();
      })
      .on("finish", () => {
        // console.log(
        //   "\n",
        //   "Parsed",
        //   Object.values(markdownData).reduce((a, c) => a + c.length, 0),
        //   "files",
        //   "\n"
        // );
        resolve(markdownData);
      })
      .on("error", (e) => {
        console.log("e", e);
        throw e;
      })
      .promise();
  });
};
