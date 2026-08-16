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
      		<th>Listened</th>
      		<th>Released</th>
      		<th>Genre</th>
      		<th>Duration</th>
      		<th>Like</th>
      		<th>Type</th>
      		<th>Favorite</th>
            <th>f(x)</th>
       	</tr>
    </thead>
    <tbody>`];
    for (let i = 0; i < items.length; i++) {
        html.push(`
        <tr>
            <td><a href="${items[i].url}">${items[i].title}</a></td>
            <td>${dateToString(items[i].listened)}</td>
            <td>${items[i].released}</td>
            <td>${genreToString(items[i].genre)}</td>
            <td>${items[i].duration}</td>
            <td>${ratingToStarString(items[i].rating)}</td>
            <td>${TypeString[items[i].type]}</td>
            <td>`);
        if (items[i].comment.length > 0) {
            html.push(`
            <div class="tooltip">
                ${items[i].favorite}
            <span class="tooltiptext">${items[i].comment}</span>
            </div>`);
        } else {
            html.push(`${items[i].favorite}`);
        }
        html.push(`</td>
            <td>${items[i].listens}</td>
        </tr>`);
    }
    html.push(`
        </tbody>
</table>`);
    element.innerHTML = html.join("");
}

function createAndInsertThreeByThree(targetId, items) {
    const element = document.getElementById(targetId);
    if (element === undefined) {
        console.error(targetId + " did not point to a valid element id");
        return;
    }

    html = [];
    for (let i = 0; i < items.length; i++) {
        html.push(
            `<div style="overflow:hidden; background:#222;">
                <a href="${items[i].url}">
                    <img src="/xoark_shared/art/${items[i].art}" style="width:100%; height:100%; object-fit:cover; display:block;">
                </a>
            </div>`
        );
    }

    element.innerHTML = html.join("");
}

function createAndInsertThreeByThreeDescription(targetId, items) {
    const element = document.getElementById(targetId);
    if (element === undefined) {
        console.error(targetId + " did not point to a valid element id");
        return;
    }

    html = [];
    for (let i = 0; i < items.length; i++) {
        html.push(`<li><a href="${items[i].url}">${items[i].title}</a> - ${items[i].comment}</li>`)
    }

    element.innerHTML = html.join("");
}

fetch("/xoark_shared/xoark_db.bin").then((response) => {
    if (!response.ok) {
        throw new Error(response.url + " response was not ok");
    }
    response.arrayBuffer().then((arrayBuffer) => {
        const view = new DataView(arrayBuffer);
        let cursor = 0;
        const albums = [];
        const threeByThree = [];
        while (cursor < view.byteLength) {
            const result = viewReadAlbum(view, cursor);
            cursor = result.cursor;
            const album = result.album;
            if (album.listens > 0) {
                album.listened = new Date(album.listened.year, album.listened.month, album.listened.day);
                albums.push(album);
            }
            if (isInGroup(album.group, XoarkGroup.ThreeByThree)) {
                threeByThree.push(album);
            }
        }
        albums.sort(function (a, b) { return a.listened < b.listened ? 1 : -1; });
        createAndInsertTable("table", albums);
        createAndInsertThreeByThree("threeByThree", threeByThree);
        createAndInsertThreeByThreeDescription("threeByThreeDescription", threeByThree);
    });
});
