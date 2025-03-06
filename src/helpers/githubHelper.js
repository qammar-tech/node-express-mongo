import { Octokit } from "@octokit/rest";

const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchGithubData = async (accessToken, endpoint) => {
  try {
    const octokit = new Octokit({
      auth: accessToken,
      request: {
        retryAfter: 0,
      },
    });

    const [path, query] = endpoint.split("?");
    const route = `GET /${path}`;

    const response = await octokit.request(route, {
      ...(query && { query }), // Add query parameters if they exist
    });

    return response.data;
  } catch (err) {
    if (error.status === 403) {
      console.log("\n\n Error: ", err);
    }
  }
};

export const fetchAllPages = async (
  accessToken,
  endpoint,
  callback,
  query_params = {}
) => {
  let page = 1;
  let hasMore = true;
  const params = new URLSearchParams(query_params);

  while (hasMore) {
    params.set("page", page);
    params.set("per_page", 100);

    const url = `${endpoint}?${params.toString()}`;

    const response = await fetchGithubData(accessToken, url);
    callback(response);

    if (response.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }
};
