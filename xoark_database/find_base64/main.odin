package main

import "../db"
import "core:fmt"

main :: proc() {
	for item in db.discography {
		valid_base64 := true
		for letter in item.title {
			valid_base64 &= (letter >= 'a' && letter <= 'f') || (letter >= 'A' && letter <= 'F') || (letter >= '0' && letter <= '9')
		}
		if valid_base64 {
			fmt.println(item.title)
		}
	}

}
