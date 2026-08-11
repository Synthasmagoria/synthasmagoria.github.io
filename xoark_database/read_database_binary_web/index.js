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
});

const Type = Object.freeze({
    Album: 0,
    EP: 1,
    Split: 2,
    VA: 3,
    Journey: 4,
    Single: 5,
});

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
});

class Date {
    constructor(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
    }
}

class Time {
    constructor(hours, minutes, seconds) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }
}

function viewGetDate(view, cursor) {
    return new Date(view.getUint16(cursor, true), view.getUint8(cursor + 2), view.getUint8(cursor + 3))
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

class Album {
	genre = 0;                // bit_set[Genre],
	type = 0;                 // Type,
	series = 0;               // Series,
	rating = 0;               // u8,
	listened = null;          // dt.Date,
	released = null;          // dt.Date,
	duration = null;          // dt.Time,
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
    album.listens = view.getInt32(view, cursor);
    cursor += 4;

    return { album: album, cursor: cursor };
}

function albumToString(album) {
    return "{ genre: " + album.genre + ", " +
        "type: " + album.type + ", " +
        "series: " + album.series + ", " +
        "rating: " + album.rating + ", " +
        "listened: " + album.listened + ", " +
        "released: " + album.released + ", " +
        "duration: " + album.duration + ", " +
        "title: " + album.title + ", " +
        "art: " + album.art + ", " +
        "url: " + album.url + ", " +
        "favorite: " + album.favorite + ", " +
        "comment: " + album.comment + ", " +
        "listens: " + album.listens + " }";
}

// fetch("db.bin").then((response) => {
//     if (response.ok) {
//         response.arrayBuffer().then((arrayBuffer) => {
//             const view = new DataView(arrayBuffer);
//             let cursor = 0;
//             while (cursor < view.byteLength) {
//                 const result = viewReadAlbum(view, cursor);
//                 cursor = result.cursor;
//                 const album = result.album;
//                 console.log(album.title);
//             }
//         });
//     }
// });
