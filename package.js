Package.describe({
  summary: "Creates js templates of your markdown files."
});


Package._transitional_registerBuildPlugin({
  name: "compileMarkdownFiles",
  use: ['spacebars-compiler'],
  sources: [
    'plugin/compile-md.js'
  ],
  npmDependencies: {"marked": "0.2.9"}
});
