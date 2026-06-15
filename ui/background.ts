import { AuthorizeUser } from "./src/services";

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
