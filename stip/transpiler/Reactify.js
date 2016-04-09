/****************************************************************
 *               TRANSFORMATIONS FOR REDSTONE                   *
 ****************************************************************/

var Reactify = (function () {

    // The context Reactify should work on
    var context = null;
    var setContext = function(newContext) {
        context = newContext;
    }

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
    var createUpdateGuiCall = function(idname, object) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "RUpdateGUI"
                },
                "arguments": [
                    {
                        "type": "Literal",
                        "value": idname,
                        "raw": "\"" + idname + "\""
                    },
                    {
                        "type": "Identifier",
                        "name": object
                    }
                ]
            }
        };
    };

    // Change what happens on an assignment
    var onAssignment = function onAssignment(transpiler) {
        transpiler = Nodeify.transformAssignmentExp(transpiler);

        var node      = transpiler.node;
            parsenode = node.parsenode,
            left      = parsenode.expression.left,
            varname   = left.name;

        if (varname === undefined) {
            return transpiler;
        }

        // Check if varname is in the list of reactive variables
        // And if they have the same declaration node

        var genast = context.stip.generatedAST;

        // Create array to temporary store all calls to update the GUI
        var updateGUICalls = [];

        context.crumbs.forEach(function(crumb) {
            var on_update = crumb.on_update;
            var type = on_update.type;
            var varnameCrumb = on_update.varname;
            var declNode2 = on_update.graph.declarationNode;

            // If this variable name is the same as the variable name in the crumb
            if (varname == varnameCrumb) {
                switch (type) {
                    case 'Identifier':
                    case 'MemberExpression':
                        var declNode1 = Pdg.declarationOf(left, genast);
                        var sameDeclNode = (declNode1 == declNode2);

                        // And they share the same declaration node: create call to update GUI
                        if (sameDeclNode) {
                            var updateGUICall = createUpdateGuiCall(crumb.id, varname);
                            updateGUICalls.push(updateGUICall);
                        }
                        break;
                }
            }    
        });

        // Only do something if there is at least one call to update the GUI 
        if (updateGUICalls.length >= 1) {
            // Create new empty lambda call, and add the original assignment node
            var oldparsenode = parsenode;
            var lambda = createEmptyLambdaCall();
            lambda.addToBody(oldparsenode);

            // Add all calls to update the GUI too
            updateGUICalls.forEach(function(call) {
                lambda.addToBody(call);
            });

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