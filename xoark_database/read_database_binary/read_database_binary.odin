package database

import "core:os"
import "core:strings"
import "core:fmt"
import "core:io"

main :: proc() {
	switch len(os.args) {
		case 2:
		case:
			fmt.println(
				"--- READ DATABASE BINARY ---\n" +
				"Usage: <program> <bin>")
	}
	path := os.args[1]
	if error := program(path); error != nil {
		fmt.println("Error:", error)
	}
}

Error :: union {
	os.Error,
}

program :: proc(path: string) -> Error {
	data := os.read_entire_file(path, context.allocator) or_return
	cursor := 0
	for cursor < len(data) {
		length := (cast(^i32)&data[cursor])^
		cursor += size_of(i32)
		str := strings.string_from_ptr(&data[cursor], int(length))
		fmt.println(length, str)
		cursor += int(length)
	}
	return nil
}
