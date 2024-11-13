javac YourProgram.java 2> compile_error.txt
if [ $? -eq 0 ]; then
    java YourProgram < input.txt > output.txt 2> runtime_errors.txt
fi
