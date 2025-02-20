import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';

export class ArrayExpr extends Expr {
  constructor(public elements: Expr[]) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitArrayExpr(this);
  }
}