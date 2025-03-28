import * as path from "path";

import { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

import { GITHUB_GRAPHQL_API_URL } from "./src/constants/github";

// Load environment variables from different env files
// Try to load from .env.development first, then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Read the token from VITE_GITHUB_TOKEN
const token = process.env.VITE_GITHUB_TOKEN;
if (!token) {
  console.warn(
    "Warning: VITE_GITHUB_TOKEN environment variable is not set. Schema generation will likely fail."
  );
}

console.log(
  "Using token:",
  token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "No token found"
);

const config: CodegenConfig = {
  schema: {
    [GITHUB_GRAPHQL_API_URL]: {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "GitHub-Project-Manager-App",
      },
    },
  },
  documents: ["./src/graphql/**/*.graphql"],
  generates: {
    // Generate the base schema types
    "./src/types/github-schema.ts": {
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
    // Generate typed operations and hooks
    "./src/graphql/generated/": {
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
