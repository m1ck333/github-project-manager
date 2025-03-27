import { CodegenConfig } from "@graphql-codegen/cli";
import { GITHUB_GRAPHQL_API_URL } from "./src/constants/api";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Read the token from VITE_GITHUB_TOKEN
const token = process.env.VITE_GITHUB_TOKEN;
if (!token) {
  console.warn(
    "Warning: VITE_GITHUB_TOKEN environment variable is not set. Schema generation will likely fail."
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
