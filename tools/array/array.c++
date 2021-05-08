#include "array.h"
#include "../../interpreter/value/value.h"

template<class T>
Array<T>::Array() : length(0), capacity(0), values(nullptr) {
}

template<class T>
Array<T>::~Array() {
  FREE_ARRAY(T, this->values, this->capacity);
  this->capacity = 0;
  this->length = 0;
  this->values = nullptr;
}

template<class T>
void Array<T>::write(T value) {
  if (this->capacity < this->length + 1) {
    int oldCapacity = this->capacity;
    this->capacity = GROW_CAPACITY(oldCapacity);
    this->values = GROW_ARRAY(T, this->values, oldCapacity, this->capacity);
  }

  this->values[this->length] = value;
  this->length++;
}

template class Array<uint8_t>;
template class Array<int>;
template class Array<double>;
template class Array<Value>;
