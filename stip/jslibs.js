// Solution for Node JS, for Browser Javascript: paste contents here (easiest solution)
var fs = require("fs");
var path = require("path");

var js_libs = (function () {

    var https   = "var https = {get : function(options) {return {on: function (type, fn) {}}}};";
    var jQuery  = fs.readFileSync(path.join(__dirname, "jslibs/jquery.placeholder.js"), "utf-8");
    var math    = "var Math = {random : function () {return 0}};";
    var console = "var console = {log: function (txt) {} };";
    var windowo = "var window = {innerWidth : 0, innerHeight : 0, screenX : 0, screenY : 0, outerWidth: 0, outerHeight : 0 };"
    var json    = "var JSON = {parse : function (str) {return []}};"



    var libs = [https, console, jQuery, math, windowo, json];


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