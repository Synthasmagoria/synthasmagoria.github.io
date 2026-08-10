const tables = new Map();
for (let i = 0; i < window.xoark_database.length; i++) {
    const item = window.xoark_database[i];
    if (!tables.has(item.series)) {
        tables.set(item.series, []);
    }
    item.released_date = new Date(item.released);
    tables.get(item.series).push(item);
}
const iter = tables.values();
const sortFn = function (a, b) { return a.released_date < b.released_date ? -1 : 1; };
for (let item = iter.next(); item.value != undefined; item = iter.next()) {
    item.value.sort(sortFn);
}
window.xoark_tables = tables;

function createAndInsertTable(targetId, series) {
    const element = document.getElementById(targetId);
    if (element === undefined) {
        console.error(targetId + " did not point to a valid element id");
        return;
    }
    const items = window.xoark_tables.get(series);
    if (items === undefined) {
        console.error(series + " was not a valid xoark series");
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
