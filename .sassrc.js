export default {
  api: "modern",
  outputStyle: "compressed",
  sourceMap: true,
  loadPaths: ["src"],
  logger: {
    warn: (message) => {
      // Filter out legacy-js-api and import deprecation warnings
      if (!message.includes("legacy-js-api") && !message.includes("@import rules are deprecated")) {
        console.warn(message);
      }
    },
    debug: console.debug,
  },
};
