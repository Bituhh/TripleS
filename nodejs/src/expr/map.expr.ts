import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class MapExpr extends Expr {
  constructor(public properties: Map<Token, Expr>) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitMapExpr(this);
  }
}