import { CodegenConfig } from "@graphql-codegen/cli";
import { GITHUB_GRAPHQL_API_URL } from "./src/constants/api";

const config: CodegenConfig = {
  schema: GITHUB_GRAPHQL_API_URL,
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "./src/api/gql/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
