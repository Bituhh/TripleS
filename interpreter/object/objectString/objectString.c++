#include <cstring>
#include "objectString.h"

ObjectString::ObjectString(char *chars, int length) : Object(OBJ_STRING), chars(chars), length(length) {
}

ObjectString *ObjectString::copy(const char *chars, int length) {
  char *heapChars = new char[length + 1];
  memcpy(heapChars, chars, length);
  heapChars[length] = '\0';
  return new ObjectString(heapChars, length);
}

ObjectString *ObjectString::takeString(char *chars, int length) {
  return new ObjectString(chars, length);
}
