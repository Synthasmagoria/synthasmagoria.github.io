package database

import "db"
import "core:fmt"
import "core:os"
import "core:io"

main :: proc() {
	if err := program(); err != nil {
		fmt.println("Error:", err)
	}
}

Error :: union {
	os.Error,
}

program :: proc() -> Error {
	f := os.open("db.bin", {.Create, .Write, .Trunc}) or_return
	defer os.close(f)
	w := io.to_writer(io.Stream(os.to_stream(f)))
	for album in db.discography {
		io.write_byte(w, u8(album.type))
	}
	return nil
}
