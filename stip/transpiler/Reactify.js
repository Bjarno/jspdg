/****************************************************************
 *               TRANSFORMATIONS FOR REDSTONE                   *
 ****************************************************************/

var esprima = require("esprima");

var Reactify = (function () {

    // The context Reactify should work on
    var context = null;
    var setContext = function(newContext) {
        context = newContext;
    };

    // The transpiler for Redstone
    var transformer = {};
    
    if (typeof module !== 'undefined' && module.exports != null) {
        Nodeify = require('./Nodeify').Nodeify;
    }

    // Inherit almost everything from Nodeify
    transformer.transformVariableDecl = Nodeify.transformVariableDecl;
    transformer.transformAssignmentExp = Nodeify.transformAssignmentExp;
    transformer.transformBinaryExp = Nodeify.transformBinaryExp;
    transformer.transformFunctionExp = Nodeify.transformFunctionExp;
    transformer.transformFunctionDecl = Nodeify.transformFunctionDecl;
    transformer.transformCallExp = Nodeify.transformCallExp;
    transformer.transformReturnStm = Nodeify.transformReturnStm;
    transformer.transformIfStm = Nodeify.transformIfStm;
    transformer.transformTryStm = Nodeify.transformTryStm;
    transformer.transformCatchClause = Nodeify.transformCatchClause;
    transformer.transformThrowStm =  Nodeify.transformThrowStm;
    transformer.transformBlockStm = Nodeify.transformBlockStm;
    transformer.transformObjectExp = Nodeify.transformObjectExp;
    transformer.transformNewExp = Nodeify.transformNewExp;
    transformer.transformProperty = Nodeify.transformProperty;
    transformer.transformActualParameter = Nodeify.transformActualParameter;
    transformer.transformFormalParameter = Nodeify.transformFormalParameter;
    transformer.transformExitNode = Nodeify.transformExitNode;

    /**
     * Create an empty call to a directly created blank anonymous function, without any parameters.
     */
    var createEmptyLambdaCall = function() {
        return {
            addToBody: function(expr) {
                this.node.expression.callee.body.body.push(expr);
            },
            node: {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "FunctionExpression",
                        "id": null,
                        "params": [],
                        "defaults": [],
                        "body": {
                            "type": "BlockStatement",
                            "body": []
                        },
                        "generator": false,
                        "expression": false
                    },
                    "arguments": []
                }
            }
        };
    };

    /**
     * Create a call to update the GUI, given the idName of the crumb and the name of the variable containing the current value.
     */
    var createUpdateGuiCall = function(varname) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "REDSTONE"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "updateVariable"
                    }
                },
                "arguments": [
                    {
                        "type": "Literal",
                        "value": varname,
                        "raw": "\"" + varname + "\""
                    },
                    {
                        "type": "Identifier",
                        "name": varname
                    }
                ]
            }
        };
    };

    // Aid function, so the list with identifiers are unique
    var uniq = function uniq(a) {
        return Array.from(new Set(a));
    };

    // Change what happens on an assignment
    var onAssignment = function onAssignment(transpiler) {
        transpiler = Nodeify.transformAssignmentExp(transpiler);

        var node      = transpiler.node;
        var parsenode = node.parsenode;
        var left      = parsenode.expression.left;

        // Doing nothing if left: only static analysis if while object changes
        if (left.type !== esprima.Syntax.Identifier) {
            return transpiler;
        }

        var variableNameAssignment = left.name;

        // Check if varname is in the list of reactive variables
        // And if they have the same declaration node
        var genast = context.stip.generatedAST;

        // Create array to temporary store all calls to update the GUI
        var updateGUI = false;

        // Dirty workaround to break free from forEach without using .every()
        var BreakException= {};

        try {
            var variableNames = [];
            context.crumbs.forEach(function (crumb) {
                variableNames = variableNames.concat(crumb.variableNames);
            });

            variableNames = uniq(variableNames);

            // For all variables in this crumb
            variableNames.forEach(function (varname) {
                // If they have the same name
                if (variableNameAssignment == varname) {
                    var declNode1 = Pdg.declarationOf(left, genast);
                    var declNode2 = context.varname2declNode[varname];

                    // And they share the same declaration node: create call to update GUI
                    if (declNode1 == declNode2) {
                        updateGUI = true;
                        throw BreakException;
                    }
                }
            });
        } catch (e) {
            if (e !== BreakException) {
                throw e;
            }
        }

        // Only do something if there is at least one call to update the GUI 
        if (updateGUI) {
            // Create new empty lambda call, and add the original assignment node
            var oldparsenode = parsenode;
            var lambda = createEmptyLambdaCall();
            lambda.addToBody(oldparsenode);

            // Add all calls to update the GUI too
            lambda.addToBody(createUpdateGuiCall(variableNameAssignment));

            // Output the result
            transpiler.transpiledNode = lambda.node;
        }

        return transpiler;
    };

    transformer.transformAssignmentExp = onAssignment;

    if (typeof module !== 'undefined' && module.exports != null) {
        exports.Reactify  = transformer;
        exports.setContext = setContext;
    }

    return transformer;

})();