import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';

export class LiteralExpr extends Expr {
  constructor(public value: number | string | boolean | null) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}