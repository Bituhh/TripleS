#ifndef TRIPLES_VALUE_H
#define TRIPLES_VALUE_H

#include <cstdio>
#include <vector>

typedef class Object Object;

typedef enum {
  VAL_BOOL,
  VAL_NULL,
  VAL_NUMBER,
  VAL_OBJ,
} ValueType;

typedef struct {
  ValueType type;
  union {
    bool boolean;
    double number;
    Object *obj;
  } as;
} Value;

#define IS_BOOL(value)    ((value).type == VAL_BOOL)
#define IS_NULL(value)    ((value).type == VAL_NULL)
#define IS_NUMBER(value)  ((value).type == VAL_NUMBER)
#define IS_OBJ(value)     ((value).type == VAL_OBJ)

#define AS_BOOL(value)    ((value).as.boolean)
#define AS_NUMBER(value)  ((value).as.number)
#define AS_OBJ(value)     ((value).as.obj)

#define BOOL_VAL(value)   ((Value){VAL_BOOL, {.boolean = (value)}})
#define NULL_VAL          ((Value){VAL_NULL, {.number = 0}})
#define NUMBER_VAL(value) ((Value){VAL_NUMBER, {.number = (value)}})
#define OBJ_VAL(object)   ((Value){VAL_OBJ, {.obj = (Object *)(object)}})

class ValueArray : public std::vector<Value> {
public:
  static void print(Value value);
  static bool valuesEqual(Value a, Value b);
};


#endif //TRIPLES_VALUE_H
