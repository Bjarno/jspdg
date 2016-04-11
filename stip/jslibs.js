// Solution for Node JS, for Browser Javascript: paste contents here (easiest solution)
var fs = require("fs");
var path = require("path");

var js_libs = (function () {

    var readLibrary = function (lib) {
        return fs.readFileSync(path.join(__dirname, "jslibs/" + lib + ".placeholder.js"), "utf-8");
    };

    var https   = readLibrary("https");
    var jQuery  = readLibrary("jquery");
    var math    = readLibrary("math");
    var consolo = readLibrary("console");
    var windowo = readLibrary("window");
    var json    = readLibrary("json");
    var fsLib   = readLibrary("fs");
    var dns     = readLibrary("dns");
    var proxy   = readLibrary("proxy");
    var date    = readLibrary("date");

    var libs = [https, consolo, jQuery, math, windowo, json, fsLib, dns, proxy, date];

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