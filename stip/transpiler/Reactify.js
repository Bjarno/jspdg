/****************************************************************
 *               TRANSFORMATIONS FOR REDSTONE                   *
 ****************************************************************/

var Reactify = (function () {

    var context = null;
    var setContext = function(newContext) {
        context = newContext;
    }

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

    var onAssignment = function onAssignment(transpiler) {
        var result = Nodeify.transformAssignmentExp(transpiler);
        var node      = transpiler.node;
            parsenode = node.parsenode,
            left      = parsenode.expression.left,
            varname   = left.name;

        console.log("Reactify.transformAssignmentExp()!");
        console.log("Varname: " + varname);

        // Check if varname is in the list of reactive variables
        // And if they have the same declaration node

        var genast = context.stip.generatedAST;

        context.crumbs.forEach(function(crumb) {
            var on_update = crumb.on_update;
            var type = on_update.type;
            switch (type) {
                case 'Identifier':
                    var varnameCrumb = on_update.varname;
                    if (varname == varnameCrumb) {
                        var declNode1 = Pdg.declarationOf(left, genast);
                        var declNode2 = on_update.graph.declarationNode;
                        var sameDeclNode = (declNode1 == declNode2);

                        if (sameDeclNode) {
                            // TODO: Transform
                        }
                    }
            }
        });

        return result;
    };

    transformer.transformAssignmentExp = onAssignment;


    if (typeof module !== 'undefined' && module.exports != null) {
        exports.Reactify  = transformer;
        exports.setContext = setContext;
    }

    return transformer;


})()