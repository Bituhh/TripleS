cmake_minimum_required(VERSION 3.30)
project(TripleS)

set(CMAKE_CXX_STANDARD 14)

add_executable(TripleS
        main.cpp
        src/chunk.h
        src/Debug.h
        src/Debug.cpp
        src/value.h
        src/chunk.cpp
        src/value.cpp
        src/vm.cpp
        src/vm.h
        src/compiler/compiler.cpp
        src/compiler/compiler.h
        src/compiler/scanner.cpp
        src/compiler/scanner.h
        src/compiler/token.h
)
