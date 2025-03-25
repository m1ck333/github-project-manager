module.exports = {
  quietDeps: true,
  api: "modern",
  sourceMap: true,
  style: "compressed",
  loadPaths: ["src"],
  logger: {
    warn: () => {}, // Suppress all warnings
  },
};
