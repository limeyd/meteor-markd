var fs = Npm.require('fs');
var path = Npm.require('path');
var marked = Npm.require('marked');
var Future = Npm.require('fibers/future');

Plugin.registerSourceHandler("md",
                             {isTemplate:true},
                             function (compileStep) {


  if (! compileStep.archMatches('browser')) {
    // XXX in the future, might be better to emit some kind of a
    // warning if a stylesheet is included on the server, rather than
    // silently ignoring it. but that would mean you can't stick .css
    // at the top level of your app, which is kind of silly.
    return;
  }
  var path_part = path.dirname(compileStep.inputPath);
  if (path_part === '.')
    path_part = '';
  if (path_part.length && path_part !== path.sep)
    path_part = path_part + path.sep;
  var ext = path.extname(compileStep.inputPath);
  var basename = path.basename(compileStep.inputPath, ext);
  var source = compileStep.read().toString('utf8');

  try {
    contents = marked(source);

    var renderFuncCode = Spacebars.compile(
      contents, {
      isTemplate: true,
      sourceName: 'Template "' + basename + '"'
    });

    results = "Template.__define__(" + JSON.stringify(basename) +
      ", " + renderFuncCode + ");";
  } catch (e) {
    compileStep.error({
        message: "Markdown compiler error: " + e.message,
        sourcePath: e.filename || compileStep.inputPath,
        line: e.line - 1,  // dunno why, but it matches
        column: e.column + 1
      });
    return;
  }

  compileStep.addJavaScript({
    path: path.join(path_part, "template." + basename + ".js"),
    sourcePath: compileStep.inputPath,
    data: results,
  })
});
