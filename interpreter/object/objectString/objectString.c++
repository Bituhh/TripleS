#include <cstring>
#include "objectString.h"
#include "../../vm/vm.h"

ObjectString::ObjectString(const std::string &chars) : Object(OBJ_STRING), chars(chars), length(chars.size()) {
  VM::getInstance().strings.insert({chars, this});
}

ObjectString *ObjectString::copy(std::string &chars) {
  try {
    ObjectString *interned = VM::getInstance().strings.at(chars);
    return interned;
  } catch (const std::out_of_range &e) {
    char *heapChars = new char[chars.size() + 1];
    chars.copy(heapChars, chars.size());
    heapChars[chars.size()] = '\0';
    return new ObjectString(heapChars);
  }
}

ObjectString *ObjectString::takeString(std::string &chars) {
  try {
    ObjectString *interned = VM::getInstance().strings.at(chars);
    chars.clear();
    chars.shrink_to_fit();
    return interned;
  } catch (const std::out_of_range &e) {
    return new ObjectString(chars);
  }
}
