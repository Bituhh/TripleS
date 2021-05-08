#ifndef TRIPLES_STRING_H
#define TRIPLES_STRING_H

#include "../object.h"

#define IS_STRING(value)  Obj::isObjType(value, OBJ_STRING)

class ObjString {
  Obj obj;
  int length;
  char *chars;
};


#endif //TRIPLES_STRING_H
