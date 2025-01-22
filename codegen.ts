import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  generates: {
    "src/generated/schema.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        mappers: {
          Company: "../db/types#CompanyEntity",
          Job: "../db/types#JobEntity",
        },
        skipTypename: true,
      },
    },
  },
};
export default config;
