package xoark_db

import dt "core:time/datetime"

Genre :: enum u8 {
	IDM,
	Noise,
	Glitch,
	Breakcore,
	SoCalledDnb,
	Ambient,
	Placeholder01,
	Placeholder02,
	Placeholder03,
	Placeholder04,
	Placeholder05,
	Placeholder06,
	Placeholder07,
	Placeholder08,
	Placeholder09,
	Placeholder10,
	Placeholder11,
	Placeholder12,
	Placeholder13,
	Placeholder14,
	Placeholder15,
	Placeholder16,
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
