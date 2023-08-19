let url;
$(document).ready(() => {
    // let anime = $('#anime').val();
    $('li.page-item').click((e) => {
        e.preventDefault();
        if(!$('#anime').val()){
            url = 'https://api.jikan.moe/v4/seasons/now';
            url+=`?page=${$(e.currentTarget).data('page')}`;
        }
        else{
            // let anime = $('#anime').val();
            url = `https://api.jikan.moe/v4/anime?q=${$('#anime').val()}&page=${$(e.currentTarget).data('page')}`;
        }
        $(".row").empty();
        resourceFetch(url,'/get-userLibList').then(([animeDat,userDat]) => {
            showResultSet(animeDat,userDat);
        })
    });

    $('.card-text a').click((e)=>{
        e.preventDefault();
        e.currentTarget.textContent = "Added to library";
        const url = '/add-to-lib';
        const {id,image,title} = e.currentTarget.dataset;
        addToLib(url,id,image,title);
    });
})


async function resourceFetch(url,userLibListUrl) {
    // const response = await fetch(url);
    // const data = await response.json();
    // return data; //which itself is a promise which is handled in the 'then' block
    const [res1,res2] = await Promise.all([fetch(url),fetch(userLibListUrl)]);
    const dataVals = await Promise.all([res1.json(),res2.json()]);
    return dataVals;
}

async function addToLib(url,id,image,title){
    await fetch(url,{
        method: 'POST',
        body: JSON.stringify({
            id: id,
            image: image,
            title: title
        }),
        headers:{
            'Content-type': 'application/json'
        }
    });
}

function showResultSet(animeDat,userDat) {    
    const dataArray = animeDat['data'];
    const libArray = userDat.lib;
    for (let i = 0; i < dataArray.length; i++) {
        $(".row").append(`
        <div class="col">
                        <div class="card h-100">
                            <img src="${dataArray[i].images.jpg.image_url}" class="card-img-top" alt="...">
                            <div class="card-body">
                                <h5 class="card-title">
                                    ${dataArray[i].title}
                                </h5>
                                <p class="card-text">
                                ${libArray?
                                    libArray.find((obj)=>dataArray[i].mal_id == obj.mal_id)?
                                        '<button class="btn btn-success" disabled>In library</button>':
                                        `<a href="/add-to-library" class="btn btn-primary" data-id="${dataArray[i].mal_id}"
                                        data-image="${dataArray[i].images.jpg.image_url}"
                                        data-title="${dataArray[i].title}">Add to library</a>`
                                    :
                                    `<a class="btn btn-primary href="/login">login to add</a>`
                                }
                                </p>
                            </div>
                            <div class="card-footer">
                                <small class="text-body-secondary">${dataArray[i].score}</small>
                            </div>                        
                        </div>
                    </div>
        `);
    }
}