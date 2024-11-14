javac index.java 2> compile_errors.txt
if [ $? -eq 0 ]; then
    java index < input.txt > output.txt 2> runtime_errors.txt
fi
