// Solution for Node JS, for Browser Javascript: paste contents here (easiest solution)
var fs = require("fs");
var path = require("path");

var js_libs = (function () {

    var readLibrary = function (lib) {
        return fs.readFileSync(path.join(__dirname, "jslibs-stubs/" + lib + ".stubs.js"), "utf-8");
    };

    var libs = ["https", "jquery", "math", "console", "window", "json", "fs", "dns", "proxy", "date"];

    libs = libs.map(function (libname) {
        return readLibrary(libname);
    });

    return  { 
        getLibraries : function () {
            return libs.map(function (lib) {
                var ast = esprima.parse(lib).body[0];
                Ast.augmentAst(ast);
                return ast;
            })
        }
    };

})();

if (typeof module !== 'undefined' && module.exports != null) {
    var esprima = require('./lib/esprima.js');
    var Ast = require('../jipda-pdg/ast.js').Ast;
    exports.js_libs = js_libs;
}