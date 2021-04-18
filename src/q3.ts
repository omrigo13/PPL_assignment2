import { ClassExp, ProcExp,  Exp, Program,Binding,makeAppExp, isProgram, makeProgram, isExp, isDefineExp, isClassExp, isAtomicExp, isNumExp, isBoolExp, isPrimOp, isVarRef, isAppExp, isProcExp, isIfExp, isLitExp, makeDefineExp, makeLetExp } from "./L31-ast";
import { Result, makeFailure, mapResult, makeOk, safe2 } from "../shared/result";
import { makeBoolExp, makeIfExp, makeLitExp, makePrimOp, makeProcExp, makeVarDecl, makeVarRef,CExp } from "./L31-ast";
import { bind, is, isEmpty, map } from "ramda";
import { makeSymbolSExp } from "../imp/L3-value";
import { rest } from "../shared/list";
import { isLetExp } from "../imp/L3-ast";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/


export const class2proc = (exp: ClassExp): ProcExp =>{
    return makeProcExp(exp.fields,[makeProcExp([makeVarDecl("msg")],[methodsTobody(exp.methods)])]);
}

/*
Purpose: Transform Classbinding to if expression 
Signature: methodsTobody(Binding[])
Type: Binding[] => CExp
*/
export const methodsTobody = (methods:Binding[]):CExp=>
  {
    return isEmpty(methods) ? makeBoolExp(false):
        makeIfExp(makeAppExp(makePrimOp("eq?"),[makeVarRef("msg"),makeLitExp(makeSymbolSExp(methods[0].var.var))]),
        makeAppExp(methods[0].val,[]),methodsTobody(rest(methods)));
  
      
  }


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    // isProgram(exp) ? bind(mapResult(L31ExptoL3, exp.exps), (exps: Exp[]) => makeOk(makeProgram(exps))) :
    // isExp(exp) ? L31ExptoL3(exp) :
    // makeFailure("Never");

    isExp(exp) ? makeOk(L31ExptoL3(exp)) :
    isProgram(exp) ? makeOk(makeProgram(map(L31ExptoL3, exp.exps))) :
    //****check next line:
    makeFailure("exp. cannot be identified")

export const L31ExptoL3 = (exp:Exp): Exp=>
    isDefineExp(exp) ? makeDefineExp(exp.var, L31CExpToL3(exp.val)) :
    L31CExpToL3(exp);
    

    
export const L31CExpToL3 = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp:
    isAppExp(exp) ? makeAppExp(L31CExpToL3(exp.rator), map(L31CExpToL3, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(L31CExpToL3, exp.body)) : 
    isIfExp(exp) ? makeIfExp(L31CExpToL3(exp.test), L31CExpToL3(exp.then), L31CExpToL3(exp.alt)) :
    isLetExp(exp) ? makeLetExp(exp.bindings,map(L31CExpToL3,exp.body)):
    isClassExp(exp) ? L31CExpToL3(class2proc(exp)):
    exp;