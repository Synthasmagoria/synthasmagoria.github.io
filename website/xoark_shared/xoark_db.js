const Genre = Object.freeze({
    IDM: 0,
    Noise: 1,
    Glitch: 2,
    Breakcore: 3,
    SoCalledDnb: 4,
    Ambient: 5,
    Placeholder01: 6,
    Placeholder02: 7,
    Placeholder03: 8,
    Placeholder04: 9,
    Placeholder05: 10,
    Placeholder06: 11,
    Placeholder07: 12,
    Placeholder08: 13,
    Placeholder09: 14,
    Placeholder10: 15,
    Placeholder11: 16,
    Placeholder12: 17,
    Placeholder13: 18,
    Placeholder14: 19,
    Placeholder15: 20,
    Placeholder16: 21,
    _Count: 22,
});

const GenreString = [
    "IDM",
    "Noise",
    "Glitch",
    "Breakcore",
    "SoCalledDnb",
    "Ambient",
    "Placeholder01",
    "Placeholder02",
    "Placeholder03",
    "Placeholder04",
    "Placeholder05",
    "Placeholder06",
    "Placeholder07",
    "Placeholder08",
    "Placeholder09",
    "Placeholder10",
    "Placeholder11",
    "Placeholder12",
    "Placeholder13",
    "Placeholder14",
    "Placeholder15",
    "Placeholder16",
];

function genreToString(genre) {
    let genres = "";
    for (let i = 0; i < Genre._Count; i++) {
        if ((genre >> i) & 1) {
            if (genres.length == 0) {
                genres += GenreString[i];
            } else {
                genres += ", " + GenreString[i];
            }
        }
    }
    return genres;
}

function ratingToStarString(rating) {
    switch (rating) {
        case 0: return "☆☆☆☆☆";
        case 1: return "★☆☆☆☆";
        case 2: return "★★☆☆☆";
        case 3: return "★★★☆☆";
        case 4: return "★★★★☆";
        case 5: return "★★★★★";
    }
}

const Type = Object.freeze({
    Album: 0,
    EP: 1,
    Split: 2,
    VA: 3,
    Journey: 4,
    Single: 5,
});

const TypeString = [
    "Album",
    "E.P.",
    "Split",
    "V.A.",
    "Journey",
    "Single",
];

const Series = Object.freeze({
    None: 0,
    Hex: 1,
    Base64: 2,
    P: 3,
    Missing_Broken: 4,
    Satellits: 5,
    Praspis: 6,
    Gnocchi: 7,
    Runtime: 8,
    _Count: 9,
});

class XoarkDate {
    constructor(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
    }
    toString() {
        return this.year + "-" +
            this.month.toString().padStart(2, "0") + "-" +
            this.day.toString().padStart(2, "0");
    }
}

class Time {
    constructor(hours, minutes, seconds) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }
    toString() {
        return this.hours.toString().padStart(2, "0") + ":" +
            this.minutes.toString().padStart(2, "0") + ":" +
            this.seconds.toString().padStart(2, "0");
    }
}

class Album {
	genre = 0;                // bit_set[Genre],
	type = 0;                 // Type,
	series = 0;               // Series,
	rating = 0;               // u8,
	listened = null;          // Date,
	released = null;          // Date,
	duration = null;          // Time,
	title = "";               // string,
	art = "";                 // string,
	url = "";                 // string,
	favorite = "";            // string,
	comment = "";             // string,
	listens = 0;              // i32,
}

function viewReadAlbum(view, cursor) {
    const album = new Album();
    album.genre = view.getUint32(cursor, true);
    cursor += 4;
    album.type = view.getUint8(cursor);
    cursor += 1;
    album.series = view.getUint8(cursor);
    cursor += 1;
    album.rating = view.getUint8(cursor);
    cursor += 1
    album.listened = viewGetDate(view, cursor);
    cursor += 4;
    album.released = viewGetDate(view, cursor);
    cursor += 4;
    album.duration = viewGetTime(view, cursor);
    cursor += 3;
    {
        const result = viewGetString(view, cursor);
        album.title = result.string;
        cursor += result.bytes;
    }
    {
        const result = viewGetString(view, cursor);
        album.art = result.string;
        cursor += result.bytes;
    }
    {
        const result = viewGetString(view, cursor);
        album.url = result.string;
        cursor += result.bytes;
    }
    {
        const result = viewGetString(view, cursor);
        album.favorite = result.string;
        cursor += result.bytes;
    }
    {
        const result = viewGetString(view, cursor);
        album.comment = result.string;
        cursor += result.bytes;
    }
    album.listens = view.getInt32(cursor, true);
    cursor += 4;

    return { album: album, cursor: cursor };
}

function viewGetDate(view, cursor) {
    return new XoarkDate(view.getUint16(cursor, true), view.getUint8(cursor + 2), view.getUint8(cursor + 3))
}

function viewGetTime(view, cursor) {
    return new Time(view.getUint8(cursor), view.getUint8(cursor + 1), view.getUint8(cursor + 2));
}

function viewGetString(view, cursor) {
    const length = view.getUint16(cursor, true);
    const decoder = new TextDecoder("utf-8");
    const array = new Uint8Array(view.buffer, cursor + 2, length);
    return { string: decoder.decode(array), bytes: 2 + length };
}
