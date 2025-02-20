import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class LogicalExpr extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}