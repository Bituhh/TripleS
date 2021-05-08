cmake_minimum_required(VERSION 3.19)
project(triples)

set(CMAKE_CXX_STANDARD 14)

add_executable(triples main.cpp interpreter/chunk/chunk.c++ interpreter/chunk/chunk.h tools/memory/memory.c++ tools/memory/memory.h tools/debug/debug.c++ tools/debug/debug.h tools/array/array.c++ tools/array/array.h interpreter/value/value.c++ interpreter/value/value.h interpreter/vm/vm.c++ interpreter/vm/vm.h interpreter/compiler/compiler.c++ interpreter/compiler/compiler.h interpreter/scanner/scanner.c++ interpreter/scanner/scanner.h interpreter/object/object.c++ interpreter/object/object.h interpreter/object/string/string.c++ interpreter/object/string/string.h)
