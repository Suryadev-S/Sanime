let url;
$(document).ready(() => {
    $('.pagination a').click((e)=>{
        e.preventDefault();
        if($('#anime').val()==='season'){
            url = "https://api.jikan.moe/v4";
            url+=`/seasons/now?page=${$(e.currentTarget).data('page')}`;
        }
        else{
            url = "https://api.jikan.moe/v4";
            url+=`/anime?q=${$('#anime').val()}&page=${$(e.currentTarget).data('page')}`
        }
        $(".gallery").empty();
        resourceFetch(url).then((data) => {
            showResultSet(data);
        })
    })
})


async function resourceFetch(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data; //which itself is a promise object which is handled in the 'then' block
    // const [res1,res2] = await Promise.all([fetch(url),fetch(userLibListUrl)]);
    // const dataVals = await Promise.all([res1.json(),res2.json()]);
    // return dataVals;
}

function showResultSet(animeDat) {
    const dataArray = animeDat.data;
    dataArray.forEach((data) => {
        $(".gallery").append(`
            <div class="card">
                <img src="${data.images.jpg.image_url}" class="top">
                <div class="card-body">
                    <div class="card-title">${data.title}</div>
                    <p>${data.score}</p>
                </div>
            </div>
        `)
    });
}