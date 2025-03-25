import { createClient, cacheExchange, fetchExchange } from "@urql/core";

const GITHUB_API_URL = "https://api.github.com/graphql";

export const client = createClient({
  url: GITHUB_API_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  },
});
