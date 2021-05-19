cmake_minimum_required(VERSION 3.19)
project(triples)

#set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /std:c++latest")

add_executable(triples main.cpp interpreter/chunk/chunk.c++ interpreter/chunk/chunk.h tools/debug/debug.c++ tools/debug/debug.h interpreter/value/value.c++ interpreter/value/value.h interpreter/vm/vm.c++ interpreter/vm/vm.h interpreter/compiler/compiler.c++ interpreter/compiler/compiler.h interpreter/scanner/scanner.c++ interpreter/scanner/scanner.h interpreter/object/object.c++ interpreter/object/object.h interpreter/object/objectString/objectString.c++ interpreter/object/objectString/objectString.h)
