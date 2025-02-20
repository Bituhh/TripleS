import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class AssignExpr extends Expr {
  constructor(public name: Token, public value: Expr) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}