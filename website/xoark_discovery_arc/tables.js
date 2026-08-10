function createAndInsertTable(targetId) {
    const table = [];
    for (let i = 0; i < window.xoark_database.length; i++) {
        const item = window.xoark_database[i];
        if (item.listens > 0) {
            item.listened_date = new Date(item.listened);
            table.push(item);
        }
    }
    table.sort(function (a, b) { return a.listened_date < b.listened_date ? -1 : 1; });

    const element = document.getElementById(targetId);
    if (element === undefined) {
        console.error(targetId + " did not point to a valid element id");
        return;
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

    html = [`
<table style="border:1px solid gray; width:100%; position:relative;">
    <thead>
        <tr>
      		<th>Title</th>
      		<th>Listened</th>
      		<th>Released</th>
      		<th>Genre</th>
      		<th>Length</th>
      		<th>Like</th>
      		<th>Type</th>
      		<th>Favorite</th>
            <th>f(x)</th>
       	</tr>
    </thead>
    <tbody>`];
    for (let i = 0; i < table.length; i++) {
        html.push(`
        <tr>
            <td><a href="${table[i].url}">${table[i].title}</a></td>
            <td>${table[i].listened}</td>
            <td>${table[i].released}</td>
            <td>${table[i].genre}</td>
            <td>${table[i].duration}</td>
            <td>${ratingToStarString(table[i].rating)}</td>
            <td>${table[i].type}</td>
            <td>${table[i].favorite}</td>
            <td>${table[i].listens}</td>
        </tr>`);
    }
    html.push(`
        </tbody>
</table>`);
    element.innerHTML = html.join("");
}
