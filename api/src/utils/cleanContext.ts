export const CleanContext = async () => {
  const response = await fetch(
    `https://api.github.com/repos/oovaa/mustashar/git/trees/main?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    },
  );

  const fullTree = await response.json();

  console.log(
    // @ts-ignore
    fullTree.tree
      .filter((item: any) => item.type === "blob")
      .map((item: any) => item.path),
  );
};

CleanContext();



