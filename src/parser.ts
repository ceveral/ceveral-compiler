
import { PackageExpression, ExpressionPosition } from './expressions'
export declare function parse(input: string): PackageExpression;

export interface SyntaxError extends Error {
  message:string;
  expected:string;
  found:string;
  location: ExpressionPosition;
}
