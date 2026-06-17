import {
  AuthorizeUser,
  SendToExplorerLLM,
  SendToPlannerLLM,
} from "./src/services";
import { fetchFilesContent } from "./src/services/github";
import {
  setCachedPlan,
  setGenerationStatus,
  saveSettings,
} from "./src/utils/storage";

chrome.runtime.onInstalled.addListener(async () => {
  try {
    console.log("RootIssue extention installed successfuly ✅");

    const data = await chrome.storage.sync.get("USER_ID");

    if (data.USER_ID) {
      console.log("Welcome back! Existing user_id:", data.USER_ID);
      await AuthorizeUser(data.USER_ID as string, "Free");
      return; // Stop here
    }

    const user_id = crypto.randomUUID();
    await chrome.storage.sync.set({ USER_ID: user_id });

    await AuthorizeUser(user_id, "Free");
  } catch (err) {
    console.error(err);
  }
});

async function generatePlanInBackground(
  activeIssueContext: any,
  repoFiles: string[],
  globalSettings: any,
  credits: number,
) {
  const issueKey = `${activeIssueContext.owner}/${activeIssueContext.repo}#${activeIssueContext.issueNumber}`;

  try {
    // Step 1: Initialize
    await setGenerationStatus({
      status: "loading",
      step: 1,
      issueKey,
    });

    const treeContext = repoFiles.join("\n");

    // Step 2: ExplorerLLM
    await setGenerationStatus({
      status: "loading",
      step: 2,
      issueKey,
    });

    let filteredPathsRes = await SendToExplorerLLM(
      activeIssueContext.fullText,
      treeContext,
      globalSettings.userId || "",
      globalSettings.plan || "free",
    );

    let filteredPaths = [];
    if (typeof filteredPathsRes === "object" && filteredPathsRes.result) {
      filteredPaths = filteredPathsRes.result
        .split("\n")
        .map((p:any) => p.trim())
        .filter(Boolean);
    } else if (Array.isArray(filteredPathsRes)) {
      filteredPaths = filteredPathsRes;
    }

    console.log("Filtered files: \n", filteredPaths);

    const filesContentArray = await fetchFilesContent(
      activeIssueContext.owner,
      activeIssueContext.repo,
      filteredPaths,
      globalSettings.githubToken,
    );
    const filesContentStr = filesContentArray
      .map((fc) => `--- ${fc.path} ---\n${fc.content}\n`)
      .join("\n");

    // Step 3: PlannerLLM
    await setGenerationStatus({
      status: "loading",
      step: 3,
      issueKey,
    });

    const planRes = await SendToPlannerLLM(
      activeIssueContext.fullText,
      filesContentStr,
    );

    const newPlan = typeof planRes === "string" ? planRes : planRes?.plan || planRes?.result || "";
    if (!newPlan) {
      throw new Error("No plan returned from the Planner model");
    }

    // Cache the plan
    const cacheKey = `plan:${activeIssueContext.owner}/${activeIssueContext.repo}#${activeIssueContext.issueNumber}`;
    await setCachedPlan(cacheKey, newPlan);

    // Decrement credits
    if (credits > 0) {
      const newCredits = credits - 1;
      await saveSettings({ credits: newCredits });
    }

    // Done
    await setGenerationStatus({
      status: "success",
      step: 3,
      issueKey,
      plan: newPlan,
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    await setGenerationStatus({
      status: "error",
      step: 0,
      issueKey,
      error: error?.message || "Plan generation failed",
    });
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_PLAN_GENERATION") {
    const { activeIssueContext, repoFiles, globalSettings, credits } =
      message.payload;

    generatePlanInBackground(
      activeIssueContext,
      repoFiles,
      globalSettings,
      credits,
    ).catch((err) => {
      console.error("Background plan generation failed:", err);
    });

    sendResponse({ status: "started" });
  }
  return true; // Keep message channel open
});
