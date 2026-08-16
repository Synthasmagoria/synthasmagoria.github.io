package xoark_db

Date :: struct {
	year:   i16,
	month:  i8,
	day:    i8,
}

Time :: struct {
	hour:   i8,
	minute: i8,
	second: i8,
}

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

Group :: enum u8 {
	ThreeByThree,
	Placeholder0,
	Placeholder1,
	Placeholder2,
	Placeholder3,
	Placeholder4,
	Placeholder5,
	Placeholder6,
}

Album :: struct {
	genre:        bit_set[Genre],
	group:        bit_set[Group],
	type:         Type,
	series:       Series,
	rating:       u8,
	listened:     Date,
	released:     Date,
	duration:     Time,
	title:        string,
	art:          string,
	url:          string,
	favorite:     string,
	comment:      string,
	listens:      i32,
}
