export const AuthorizeUser = async (user_id: string, plan: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/authorize/${user_id}/${plan}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
  }
};

export const SendToExplorerLLM = async (
  issue: string,
  context: string,
  user_id: string,
  plan: string,
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/explore-tree/${user_id}/${plan}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issue, context }),
      },
    );
    const filteredFiles = await response.json();
    return filteredFiles;
  } catch (err) {
    console.error(err);
  }
};

export const SendToPlannerLLM = async (issue: string, filesContent: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/generate-plan`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issue, filesContent }),
      },
    );
    const plan = await response.json();
    return plan;
  } catch (err) {
    console.error(err);
  }
};
