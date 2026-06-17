export type urlParamsType = {
  user_id: string;
  plan: "Free" | "Premium" | "Enterprise";
};

export type explorerBodyType = {
  issue: string;
  context: string;
};

export type plannerBodyType = {
  issue: string;
  filesContent: string;
};
