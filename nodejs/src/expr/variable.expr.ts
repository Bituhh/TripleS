import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class VariableExpr extends Expr {
  constructor(public name: Token) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}