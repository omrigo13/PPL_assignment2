import { isEmpty, map } from 'ramda';
import { Exp, isBoolExp, Program,isNumExp,isStrExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isDefineExp, isProgram, PrimOp, VarDecl, AppExp, CExp, } from '../imp/L3-ast';
import { Result, makeFailure, makeOk, bind, mapResult, safe3, safe2 } from '../shared/result';
import { ProcExp, unparseL31 } from './L31-ast';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 

isBoolExp(exp) ? makeOk(exp.val ? "True" : "False") :
isNumExp(exp) ? makeOk(exp.val.toString()) :
isStrExp(exp) ? makeOk(`"${exp.val}"`):
isVarRef(exp) ? makeOk(exp.var) :
isPrimOp(exp) ? makeOk(processOp(exp)) :
isProcExp(exp)? bind(mapResult(l2ToPython,exp.body),(body:string[])=>makeOk(`(lambda ${map(arg=> arg.var,exp.args).join(",")} : ${body})`)):
isIfExp(exp) ? safe3((test: string, then: string,  alt: string) => makeOk(`(${then} if ${test} else ${alt})`))
                 (l2ToPython(exp.test),l2ToPython(exp.then),  l2ToPython(exp.alt)) :
isAppExp(exp)? (isPrimOp(exp.rator) && !checkIfBoolOrNum(exp.rator.op))? safe2((rator: string, rands: string[]) => makeOk((checkifOpNot(rator))? (`(${ rator} ${rands.join(" ")})` ) : "("+rands.join(" "+rator+" ")+")" )) // not is the only op that gets only one var
                                                                            (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands)):
                                                                      safe2((rator: string, rands: string[])=>makeOk((isEmpty(exp.rands))? `(${rator})` :rator + "("+rands.join(",")+")")) 
                                                                            (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands)):
isDefineExp(exp) ? bind(l2ToPython(exp.val), (val : string) => makeOk(`${exp.var.var} = ${val}`)) :
isProgram(exp) ? bind(mapResult(l2ToPython, exp.exps),exps => makeOk(`${exps.slice(0, -1).join("\n")}\n${exps[exps.length - 1]}`)):
makeFailure("invalid exp");

export const processOp = (primOp: PrimOp): string=>
    primOp.op === "eq?" ? "==":
    primOp.op === "=" ? "==":
    primOp.op === "boolean?" ? "(lambda x : (type(x) == bool))":
    primOp.op === "number?" ? "(lambda x : (type(x) == int))" : 
    primOp.op;


const checkifOpNot = (x: string): boolean =>
    !(["+", "-", "*", "/", ">", "<", "==", "and", "or"].includes(x));

const checkIfBoolOrNum = (x: string):boolean =>
    ["number?","boolean?"].includes(x);