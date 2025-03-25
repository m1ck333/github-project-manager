import { createClient, cacheExchange, fetchExchange } from "@urql/core";
import { GITHUB_GRAPHQL_API_URL } from "../constants/api";

export const client = createClient({
  url: GITHUB_GRAPHQL_API_URL,
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
