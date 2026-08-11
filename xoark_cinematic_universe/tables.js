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
    _Count: 9,
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

function createAndInsertTable(targetId, items) {
    const element = document.getElementById(targetId);
    if (element === undefined) {
        console.error(targetId + " did not point to a valid element id");
        return;
    }

    html = [`
<table style="border:1px solid gray; width:100%; position:relative;">
    <thead>
        <tr>
      		<th>Title</th>
      		<th>Released</th>
      		<th>Genre</th>
      		<th>Length</th>
      		<th>Type</th>
            <th></th>
    	</tr>
    </thead>
    <tbody>`];
    for (let i = 0; i < items.length; i++) {
        html.push(`
        <tr>
            <td><a href="${items[i].url}">${items[i].title}</a></td>
            <td>${items[i].released}</td>
            <td>${items[i].genre}</td>
            <td>${items[i].duration}</td>
            <td>${items[i].type}</td>
            <td>${items[i].listens > 0 ? "X" : "-"}</td>
        </tr>`);
    }
    html.push(`
        </tbody>
</table>`);
    element.innerHTML = html.join("");
}

fetch("/xoark_db.bin").then((response) => {
    if (!response.ok) {
        throw new Error(response.url + " response was not ok");
    }
    response.arrayBuffer().then((arrayBuffer) => {
        const view = new DataView(arrayBuffer);
        let cursor = 0;
        const albums = new Array(Series._Count);
        for (let i = 0; i < albums.length; i++) {
            albums[i] = [];
        }
        while (cursor < view.byteLength) {
            const result = viewReadAlbum(view, cursor);
            cursor = result.cursor;
            albums[result.album.series].push(result.album);
        }
        console.log(albums[Series.Satellits].length);
        createAndInsertTable("satellits", albums[Series.Satellits]);
        createAndInsertTable("hex", albums[Series.Hex]);
    });
});
