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
      		<th>Duration</th>
      		<th>Type</th>
            <th></th>
    	</tr>
    </thead>
    <tbody>`];
    for (let i = 0; i < items.length; i++) {
        html.push(`
        <tr>
            <td><a href="${items[i].url}">${items[i].title}</a></td>
            <td>${dateToString(items[i].released)}</td>
            <td>${genreToString(items[i].genre)}</td>
            <td>${items[i].duration}</td>
            <td>${TypeString[items[i].type]}</td>
            <td>${items[i].listens > 0 ? "X" : "-"}</td>
        </tr>`);
    }
    html.push(`
        </tbody>
</table>`);
    element.innerHTML = html.join("");
}

fetch("/xoark_shared/xoark_db.bin").then((response) => {
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
            const album = result.album;
            if (album.series != Series.None) {
                album.released = new Date(album.released.year, album.released.month, album.released.day);
                albums[result.album.series].push(album);
            }
        }
        for (let i = 0; i < albums.length; i++) {
            albums[i].sort(function (a, b) { return a.released < b.released ? 1 : -1; });
        }
        console.log(albums[Series.Satellits].length);
        createAndInsertTable("satellits", albums[Series.Satellits]);
        createAndInsertTable("hex", albums[Series.Hex]);
        createAndInsertTable("p", albums[Series.P]);
        createAndInsertTable("praspis", albums[Series.Praspis]);
    });
});
