

export const parseGitHubIssueUrl = (url: string) => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/;
  const match = url.match(regex);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      issueNumber: match[3],
    };
  }
  return null;
};

export const fetchIssueDetails = async (owner: string, repo: string, issueNumber: string, token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, { headers });
  if (!response.ok) {
    if (response.status === 404 || response.status === 401) {
      throw new Error("Failed to fetch issue. If this is a private repository, please ensure you have provided a valid GitHub token in the Settings.");
    }
    throw new Error('Failed to fetch issue details');
  }
  const data = await response.json();
  return {
    title: data.title,
    body: data.body,
    fullText: `${data.title}\n\n${data.body}`
  };
};

export const fetchRepoTree = async (owner: string, repo: string, token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // 1. Get default branch
  const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoInfoRes.ok) {
    if (repoInfoRes.status === 404 || repoInfoRes.status === 401) {
      throw new Error("Failed to fetch repository info. If this is a private repository, please ensure you have provided a valid GitHub token in the Settings.");
    }
    throw new Error('Failed to fetch repo info');
  }
  const repoInfo = await repoInfoRes.json();
  const defaultBranch = repoInfo.default_branch;

  // 2. Get tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
  if (!treeRes.ok) throw new Error('Failed to fetch repo tree');
  const treeData = await treeRes.json();
  
  return treeData.tree
    .filter((item: any) => item.type === 'blob')
    .map((item: any) => item.path);
};

export const fetchFilesContent = async (owner: string, repo: string, paths: string[], token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const fetchPromises = paths.map(async (path) => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    
    // GitHub API returns base64 encoded content
    let content = '';
    try {
      // Decode base64, handling potential unicode characters
      content = decodeURIComponent(escape(atob(data.content)));
    } catch (e) {
      content = atob(data.content);
    }

    return {
      path,
      content
    };
  });

  const results = await Promise.all(fetchPromises);
  return results.filter(r => r !== null);
};
