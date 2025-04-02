import * as path from "path";

import { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

import { GITHUB_GRAPHQL_API_URL } from "../common/constants/github";

// Load environment variables from .env files
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });

// Get token directly from process.env instead of the env module
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
