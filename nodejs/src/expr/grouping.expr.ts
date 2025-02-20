import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';

export class GroupingExpr extends Expr {
  constructor(public expression: Expr) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}