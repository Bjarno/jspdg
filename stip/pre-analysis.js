
/* Gets the ast and an array of strings, which represent names of functions 
   that are used as callback functions on the client side.
   Calls for these functions are automatically added in the client side block.
*/
var pre_analyse = function (ast, callbackFunctionsC, reactiveVarsC) {
    var anonf_ct    = 0;
    var anonf_name  = 'anonf';
    var primitives  = ["$", "console", "window"]; 
    var asyncs      = ["https", "dns", "fs", "proxy"];
    var anonfC      = [];
    var anonfS      = [];
    var anonfSh     = [];
    var decl        = [];
    var callS       = [];
    var callC       = [];
    var callSh      = [];
    var assumes     = [];
    var primdefs    = {};
    var primreturns = {};
    var primtoadd   = {};
    var fundefsC    = [];
    var sharedblock;
    var reactiveVarExprs = {};

    function function_args (callnode) {
        return callnode.arguments.filter(function (arg) {
            return Aux.isFunExp(arg) ||
                   (Aux.isIdentifier(arg) && fundefsC[arg.name])
        }) 
    }
    
    function createIdentifier (id) {
        return {type:'Identifier', name:id};
    }

    function createIdentifierExpression(id) {
        var expression = {
            "type": "ExpressionStatement",
            "expression": {
                "type": "Identifier",
                "name": id
            }
        };
        Ast.augmentAst(expression);
        return expression;
    }

    function createDeclaration  (id) {
        return { type:'VariableDeclaration', 
                declarations: [{
                    type:'VariableDeclarator',
                    id: createIdentifier(id),
                    init: null
                }],
                kind:'var'
            }
    }

    function createAssignment  (id, value) {
        return {
            type: 'ExpressionStatement',
            expression : {
                type : 'AssignmentExpression',
                operator : '=',
                left : id,
                right : value
            }
        }
    }

    function createFunction  (arg, id) {
        return {    
            type:"ExpressionStatement",
            expression: {
                type: "AssignmentExpression",
                operator: "=",
                left: createIdentifier(id),
                right: arg
            }
        }
    }

    function createReturnValue  (type) {
        switch (type) {
            case "Num": 
                return  {
                            "type": "Literal",
                            "value": 0
                        }
            case "String":
                return  {
                            "type": "Literal",
                            "value": ""
                        }
            case "Bool":
                return  {
                            "type": "Literal",
                            "value": true,
                        }
            case "Obj":
                return {
                            "type": "ObjectExpression",
                            "properties": []
                       }
            default:
                return null
            }

    }

    function createFunExp  (args, returntype) {
        var funexp =  {
                    type: "FunctionExpression",
                    id: null,
                    params: args,
                    defaults: [],
                    body: {
                        type: "BlockStatement",
                        body: [
                            {
                                type: "ReturnStatement",
                                argument: createReturnValue(returntype)
                            }
                        ]
                    },
                    generator: false,
                    expression: false
            };
        Ast.augmentAst(funexp);
        return funexp;
    }

    function createFunDecl (id, args, returntype) {
        var fundecl =  {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": id
            },
            "params": args,
            "defaults": [],
            "body": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ReturnStatement",
                        "argument": createReturnValue(returntype)
                    }
                ]
            },
            "generator": false,
            "expression": false
        };
        Ast.augmentAst(fundecl);
        return fundecl;
    }

    function createCall (id) {
        var call = {
            type:"ExpressionStatement",
            expression: {
                type:"CallExpression",
                callee: createIdentifier(id),
                arguments:[],
                isPreAnalyse: true
            }
        };
        Ast.augmentAst(call);        
        return call;
    }


    /* Gets annotation of form '@assumes [variable, function(x)]' */
    function extractAssumes (string) {
        var regexp = /\[.*?\]/,
            assumesS, assumesA;
        if (string.search(regexp >= 0)) {
            assumesS = string.match(regexp)[0].slice(1,-1);
            assumesA = assumesS.split(";");
            assumesA.map(function (assume) {
                var type, args, name;
                regexp = /\:.*/;
                type = assume.match(regexp)[0].slice(1);
                regexp = /\(.*?\)/;
                if (assume.search(regexp) > 0) {
                    args = assume.match(regexp)[0].slice(1,-1).split(",");
                    args = args.map(function (arg) { return createIdentifier(arg)});
                    name = assume.slice(0, assume.indexOf("("));
                    assumes.push(createFunDecl(name, args, type));
                } else {
                    assumes.push(createDeclaration(assume))
                }
            })
        }
    }

    var comments;
    function getComments (node) {
        if (!comments) {
            var parent = node;
            while (!Aux.isProgram(parent)) {
                parent = Ast.parent(parent, ast);
            }
            comments =  parent.comments;
        }
        return comments;
    }

    function isBlockAnnotated (node) {
       var parent = node,
            annotation;
        while(!Aux.isProgram(parent)) {
            if (Aux.isBlockStm(parent) && parent.leadingComment) {
                break;
            } else {
                parent = Ast.parent(parent, ast);
            }
        }
        if (Aux.isBlockStm(parent)) {
            return parent.leadingComment;
        }
        return;
    }

    function getCurrentBlock (node) {
        var parent = node;
        while(!Aux.isProgram(parent)) {
            if (Aux.isBlockStm(parent)) {
                break;
            } else {
                parent = Ast.parent(parent, ast);
            }
        }
        return parent;
    }


    function generateCallbackCalls() {
        var calls = [];
        callbackFunctionsC.map(function (cb) {
            var call = createCall(cb);
            var func = fundefsC[cb];


            call.leadingComment = {type: "Block", value:"@generated", range: [0,16]};
            call.clientCalls = 1;

            if (func) {
                func.params.map(function (param) {
                    call.expression.arguments = call.expression.arguments.concat({
                        "type": "Literal",
                        "value": null
                    });
                });
                calls.push(call);
            }
        });

        return calls;
    }

    function generateReativeVarExpressions() {
        var expressions = [];
        var nodes = {};

        reactiveVarsC.forEach(function (varname) {
            var expression = createIdentifierExpression(varname);
            expression.leadingComment = {type: "Block", value:"@generated", range: [0,16]};
            expression.clientCalls = 1;

            // Add to result expressions to be added to AST tree
            expressions.push(expression);
            
            // Add node to object to reference to later.
            reactiveVarExprs[varname] = expression;
        });

        return expressions;
    }

    Aux.walkAst(ast, {

        pre: function (node) {
            /* Needs to be done upfront */
            if (Aux.isFunDecl(node)) {
                var comment = isBlockAnnotated(node);
                if (comment && Comments.isClientAnnotated(comment)) 
                    fundefsC[node.id.name] = node;
            }
        },

        post: function (node) {

            getComments(node);


            /* @assumes annotation */
            if (node.leadingComment && Comments.isAssumesAnnotated(node.leadingComment.value)) {
                extractAssumes(node.leadingComment.value);
            }

            /* If a block has updateFirst and/or updateLast property, 
               these statements should be added in the beginning / ending of the block */
            if (Aux.isBlockStm(node) || Aux.isProgram(node)) {
                var comment = node.leadingComment;

                if (comment && Comments.isSharedAnnotated(comment)) {
                    sharedblock = node;
                    return;
                }

                if (node.updateFirst) {
                    node.body = node.updateFirst.concat(node.body);
                }
                if (node.updateLast) {
                    node.body = node.body.concat(node.updateLast)
                }
                   
                if (comment && Comments.isClientAnnotated(comment)) {
                    node.body = node.body.concat(generateCallbackCalls());
                }

                if (comment && Comments.isClientAnnotated(comment)) {
                    node.body = node.body.concat(generateReativeVarExpressions());
                }
            }

            /* If a node is tagged as primitive, add it to the primitive definitions.
               This causes later accesses to the primitive (such as element.jquerymethod()) 
               to be added to e.g. the jquery primitive */
            if (node.primitive) {
                if (Aux.isVarDeclarator(node))
                  primdefs[node.id.name] = node;
                else if (Aux.isAssignmentExp(node))
                  primdefs[node.left.name] = node;
            }

            if (Aux.isMemberExpression(node) && !node.primitive &&
              !Aux.isThisExpression(node.object)) {
                var name = node.property.name;
                var objname;
                if (Aux.isCallExp(node.object)) {
                    objname = node.object.callee.name;
                }
                else { 
                    objname = node.object.name;
                }
                
                primtoadd[objname] ? primtoadd[objname].push(name) : primtoadd[objname] = [name] ;
            }


            if (Aux.isCallExp(node)) {

                var name    = Aux.getCalledName(node);
                var anonf   = function_args(node);
                var obj     = Aux.isMemberExpression(node.callee) ? node.callee.object.name : false;
                var primdef = obj ? primdefs[obj] : primdefs[name];

                if (primitives.indexOf(name) >= 0 ) {
                    node.primitive = true;
                    node.parent = Ast.parent(node, ast);
                    if (Aux.isExpStm(node.parent) || Aux.isVarDecl(node.parent) || 
                        Aux.isAssignmentExp(node.parent) || Aux.isVarDeclarator(node.parent))
                        node.parent.primitive = name;
                }
                if (anonf.length > 0) {
                    var comment    = isBlockAnnotated(node);
                    var enclBlock  = getCurrentBlock(node);
                    var bodyFirst  = [];
                    var bodyLast   = [];
                    node.arguments = node.arguments.map(function (arg) {
                        var comment = isBlockAnnotated(arg);
                        if (Aux.isFunExp(arg)) {
                            var name = anonf_name + ++anonf_ct;
                            var func = createFunDecl(name, arg.params);
                            var call = createCall(name);
                            

                            call.leadingComment = {type: "Block", value:"@generated", range: [0,16]};
                            if (comment && Comments.isClientAnnotated(comment)) {
                                call.clientCalls = 1;
                            }
                            else if (comment && Comments.isServerAnnotated(comment)) {
                                call.serverCalls = 1;
                            }
                            func.body = arg.body;
                            func.params.map(function (param) {
                                call.expression.arguments = call.expression.arguments.concat({
                                        "type": "Literal",
                                        "value": null
                                    });
                            });
                            Ast.augmentAst(func);
                            bodyFirst.push(func);
                            bodyLast.push(call);
                            return createIdentifier(name);
                        }
                        else if (Aux.isIdentifier(arg) && fundefsC[arg.name]) {
                            call = createCall(arg.name);
                            call.leadingComment = {type: "Block", value:"@generated"};
                            if (comment && Comments.isClientAnnotated(comment)) {
                                call.clientCalls = 1;
                            }
                            else if (comment && Comments.isServerAnnotated(comment)) {
                                call.serverCalls = 1;
                            }
                            bodyLast = bodyLast.concat(call);
                            return arg;
                        }
                        else
                            return arg;
                    });

                    if (!enclBlock.updateFirst) {
                        enclBlock.updateFirst = [];
                        enclBlock.updateLast = [];
                    }
                    enclBlock.updateFirst = enclBlock.updateFirst.concat(bodyFirst);
                    enclBlock.updateLast = enclBlock.updateLast.concat(bodyLast);

                }
            }

        }
    })

    ast.body = js_libs.getLibraries().concat(anonfSh).concat(callSh).concat(ast.body);

    return  { 
        ast        : ast,
        assumes    : js_libs.getLibraries().concat(assumes),
        shared     : sharedblock,
        primitives : primitives,
        asyncs     : asyncs,
        reactiveVarExprs: reactiveVarExprs
    };
}


if (typeof module !== 'undefined' && module.exports != null) {
    Ast = require('../jipda-pdg/ast.js').Ast;
    Aux = require('./aux.js').Aux;
    Comments = require('./annotations.js').Comments;
    
    var js_libs  = require('./jslibs.js').js_libs;

    exports.pre_analyse         = pre_analyse;
    exports.asyncs              = ["https", "dns", "fs", "proxy"];
}