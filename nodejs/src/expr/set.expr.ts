import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class SetExpr extends Expr {
  constructor(public object: Expr, public name: Token, public value: Expr) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetExpr(this);
  }
}