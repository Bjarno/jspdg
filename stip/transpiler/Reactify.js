/****************************************************************
 *               TRANSFORMATIONS FOR REDSTONE                   *
 ****************************************************************/


var Reactify = (function () {

    var transformer = {};
    
    if (typeof module !== 'undefined' && module.exports != null) {
        Nodeify = require('./Nodeify').Nodeify;
    }

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
        // TODO: Do reactivity stuff here!
        console.log("Reactify.transformAssignmentExp()!");
        return Nodeify.transformAssignmentExp(transpiler);
    };

    transformer.transformAssignmentExp = onAssignment;

    if (typeof module !== 'undefined' && module.exports != null) {
        exports.Reactify  = transformer;
    }

    return transformer;


})()