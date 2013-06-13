Package.describe({
  summary: "Creates js templates of your markdown files."
});

Npm.depends({marked: '0.2.9'});

Package.on_use(function (api) {
  api.use([ 'templating'], 'client');
});

Package.register_extension(
  "md", function (bundle, source_path, serve_path, where) {
    if (where !== "client")
            return;
    var marked = Npm.require('marked');
    var fs = Npm.require('fs');
    var path = Npm.require('path');

    var contents = fs.readFileSync(source_path, 'utf8');
    try {
      var path_part = path.dirname(serve_path);
      if (path_part === '.')
        path_part = '';
      if (path_part.length && path_part !== path.sep)
        path_part = path_part + path.sep;
      var ext = path.extname(source_path);
      var basename = path.basename(serve_path, ext);
      serve_path = path_part + "template." + basename + ".js";

      contents = marked(contents.toString('utf8'));
       
      var code = 'Handlebars.json_ast_to_func(' +
        JSON.stringify(Handlebars.to_json_ast(contents)) + ')';

      var results = "Meteor._def_template(" + JSON.stringify(basename) + ","
          + code + ");\n";

      bundle.add_resource({
        type: "js",
        path: serve_path,
        data: new Buffer(results),
        source_file: source_path,
        where: where
      });
    } catch (e) {
      bundle.error(source_path + ": Marked compiler error: " + e.message);
    }
  }
);
