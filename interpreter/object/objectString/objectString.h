#ifndef TRIPLES_OBJECT_STRING_H
#define TRIPLES_OBJECT_STRING_H

#include <string>
#include "../object.h"

#define IS_STRING(value)  Object::isObjType(value, OBJ_STRING)
#define AS_STRING(value)  ((ObjectString *)AS_OBJ(value))
#define AS_CSTRING(value) (((ObjectString *)AS_OBJ(value))->chars)

class ObjectString : public Object {
 public:
  int length;
  std::string chars;

  explicit ObjectString(const std::string &chars);

  static ObjectString *copy(std::string &chars);

  static ObjectString *takeString(std::string &chars);
};

#endif //TRIPLES_OBJECT_STRING_H
