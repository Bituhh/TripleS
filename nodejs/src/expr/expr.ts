import {BinaryExpr} from './binary.expr';
import {GroupingExpr} from './grouping.expr';
import {LiteralExpr} from './literal.expr';
import {UnaryExpr} from './unary.expr';
import {VariableExpr} from './variable.expr';
import {AssignExpr} from './assign.expr';
import {LogicalExpr} from './logical.expr';
import {CallExpr} from './call.expr';
import {GetExpr} from './get.expr';
import {SetExpr} from './set.expr';
import {ThisExpr} from './this.expr';
import {SuperExpr} from './super.expr';
import {ArrayExpr} from './array.expr';
import {GetItemExpr} from './getitem.expr';
import {SetItemExpr} from './setitem.expr';
import {MapExpr} from './map.expr';
import {Value} from '../triples';

export abstract class Expr {
  abstract accept<T>(visitor: ExprVisitor<T>): T;
}

export interface ExprVisitor<R> {
  visitBinaryExpr(expr: BinaryExpr): R extends (number | string | boolean) ? R : R;
  visitGroupingExpr(expr: GroupingExpr): R extends (Value) ? R : R;
  visitLiteralExpr(expr: LiteralExpr): R extends (Value) ? R : R;
  visitUnaryExpr(expr: UnaryExpr): R extends (number | boolean) ? R : R;
  visitVariableExpr(expr: VariableExpr): R extends (Value) ? R : R;
  visitAssignExpr(expr: AssignExpr): R extends (Value) ? R : R;
  visitLogicalExpr(expr: LogicalExpr): R extends (Value) ? R : R;
  visitCallExpr(expr: CallExpr): R extends (Value) ? R : R;
  visitGetExpr(expr: GetExpr): R extends (Value) ? R : R;
  visitSetExpr(expr: SetExpr): R extends (Value) ? R : R;
  visitThisExpr(expr: ThisExpr): R extends (Value) ? R : R;
  visitSuperExpr(expr: SuperExpr): R extends (Function) ? R : R;
  visitArrayExpr(expr: ArrayExpr): R extends (Value) ? R : R;
  visitGetItemExpr(expr: GetItemExpr): R extends (Value) ? R : R;
  visitSetItemExpr(expr: SetItemExpr): R extends (Value) ? R : R;
  visitMapExpr(expr: MapExpr): R extends (Value) ? R : R;
}