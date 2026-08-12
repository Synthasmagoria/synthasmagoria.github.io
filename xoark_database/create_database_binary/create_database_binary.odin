package database

import "../db"
import "core:fmt"
import "core:os"
import "core:io"

main :: proc() {
	switch len(os.args) {
	case 2:
	case:
		fmt.println(
			"--- WRITE DATABASE BINARY ---\n",
			"Usage: <program> <outfile>")
		return
	}
	path := os.args[1]
	if err := program(path); err != nil {
		fmt.println("Error:", err)
	}
}

Error :: union {
	os.Error,
}

write_string :: proc(w: io.Writer, str: string) {
	length := u16(len(str))
	io.write_ptr(w, &length, size_of(length))
	io.write_string(w, str)
}

write_date :: proc(w: io.Writer, date: db.Date) {
	year := u16(date.year)
	month := u8(date.month)
	day := u8(date.day)
	io.write_ptr(w, &year, 2)
	io.write_byte(w, month)
	io.write_byte(w, day)
}

write_time :: proc(w: io.Writer, time: db.Time) {
	io.write_byte(w, u8(time.hour))
	io.write_byte(w, u8(time.minute))
	io.write_byte(w, u8(time.second))
}

program :: proc(path: string) -> Error {
	f := os.open(path, {.Create, .Write, .Trunc}) or_return
	defer os.close(f)
	w := io.to_writer(io.Stream(os.to_stream(f)))
	for &album in db.discography {
		io.write_ptr(w, &album.genre, 4)
		io.write_byte(w, u8(album.type))
		io.write_byte(w, u8(album.series))
		io.write_byte(w, album.rating)
		write_date(w, album.listened)
		write_date(w, album.released)
		write_time(w, album.duration)
		write_string(w, album.title)
		write_string(w, album.art)
		write_string(w, album.url)
		write_string(w, album.favorite)
		write_string(w, album.comment)
		io.write_ptr(w, &album.listens, size_of(album.listens))
	}
	return nil
}
