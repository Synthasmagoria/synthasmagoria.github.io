package xoark_db

import "core:time"
import dt "core:time/datetime"

Genre :: enum u8 {
	IDM,
	Noise,
	Glitch,
	Breakcore,
	SoCalledDnb,
	Ambient,
}

Type :: enum u8 {
	Album,
	EP,
	Split,
	VA,
	Journey,
	Single,
}

Series :: enum u8 {
    None,
    Hex,
    Base64,
    P,
    Missing_Broken,
    Satellits,
    Praspis,
    Gnocchi,
    Runtime,
};

Album :: struct {
	genre:        bit_set[Genre],
	type:         Type,
	series:       Series,
	rating:       u8,
	listened:     dt.Date,
	released:     dt.Date,
	duration:     dt.Time,
	title:        string,
	art:          string,
	url:          string,
	favorite:     string,
	comment:      string,
	listens:      i32,
}
