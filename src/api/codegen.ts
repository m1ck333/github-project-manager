import { CodegenConfig } from "@graphql-codegen/cli";

import { GITHUB_GRAPHQL_API_URL } from "@/common/constants/github";
import { env } from "@/config/env";

const token = env.githubToken;

if (!token) {
  console.warn(
    "Warning: GitHub token environment variable is not set. Schema generation will likely fail."
  );
}

const config: CodegenConfig = {
  schema: {
    [GITHUB_GRAPHQL_API_URL]: {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "GitHub-Project-Manager-App",
      },
    },
  },
  documents: [
    "./src/api/operations/**/*.graphql",
    "./src/api/operations/**/queries/*.graphql",
    "./src/api/operations/**/mutations/*.graphql",
  ],
  generates: {
    "./src/api/schema/github-schema.ts": {
      plugins: ["typescript"],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        futureProofEnums: true,
        scalars: {
          DateTime: "string",
          GitObjectID: "string",
          URI: "string",
        },
      },
    },
    "./src/api/generated/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
      config: {
        skipTypename: false,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        urqlImportFrom: "@urql/core",
        dedupeFragments: true,
        dedupeOperations: true,
        inlineFragmentTypes: "combine",
        futureProofEnums: true,
        documentMode: "documentNode",
      },
    },
  },
};

export default config;
