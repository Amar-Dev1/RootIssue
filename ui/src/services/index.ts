export const SendToExplorerLLM = async (
  issue: string,
  context: string,
  provider?: string,
  model?: string,
  apiKey?: string,
) => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["api-key"] = apiKey;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/explore-tree`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ issue, context, provider, model }),
      },
    );
    const filteredFiles = await response.json();
    return filteredFiles;
  } catch (err) {
    console.error(err);
  }
};

export const SendToPlannerLLM = async (
  issue: string, 
  filesContent: string,
  provider?: string,
  model?: string,
  apiKey?: string,
) => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["api-key"] = apiKey;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/generate-plan`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ issue, filesContent, provider, model }),
      },
    );
    const plan = await response.json();
    return plan;
  } catch (err) {
    console.error(err);
  }
};

