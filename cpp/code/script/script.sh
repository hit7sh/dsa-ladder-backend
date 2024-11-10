g++ -std=c++2a index.cpp -o index 2> compile_errors.txt
./index < input.txt > output.txt 2> runtime_errors.txt
