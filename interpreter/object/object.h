#ifndef TRIPLES_OBJECT_H
#define TRIPLES_OBJECT_H

#include "../value/value.h"

#define OBJ_TYPE(value)   (AS_OBJ(value)->type)

typedef enum {
  OBJ_STRING,
} ObjType;

class Obj {
private:
  ObjType type;
public:
  static inline bool isObjType(Value value, ObjType type);
};


#endif //TRIPLES_OBJECT_H
