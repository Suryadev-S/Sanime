let url;
$(document).ready(() => {
    $('.pagination a').click((e)=>{
        e.preventDefault();
        let filter = $('input[type="radio"]:checked').val();
        if($('#anime').val()==='season'){
            if(filter=="all"){
                url = "https://api.jikan.moe/v4";
                url+=`/seasons/now?page=${$(e.currentTarget).data('page')}`;
            }
            else{
                url = "https://api.jikan.moe/v4";
                url += `/seasons/now?filter=${filter}&page=${$(e.currentTarget).data('page')}`;
            }
        }
        else{
            if(filter=="all"){
                url = "https://api.jikan.moe/v4";
                url+=`/anime?q=${$('#anime').val()}&page=${$(e.currentTarget).data('page')}`
            }
            else{
                url = "https://api.jikan.moe/v4";
                url+=`/anime?q=${$('#anime').val()}&type=${filter}&page=${$(e.currentTarget).data('page')}`
            }
        }
        $(".gallery").empty();
        resourceFetch(url).then((data) => {
            showResultSet(data);
        })
    })
    $("button.lib").click((e)=>{
        const {action,animeid,title,imgurl} = e.currentTarget.dataset;
        console.log(action,animeid,title,imgurl);
        libMgmt(animeid,action,title,imgurl).then((msg)=>{
            e.currentTarget.textContent = msg.msg;
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
                <form action="/get-anime-info" method="GET">
                    <input type="hidden" name="anime" value="${data.mal_id}">
                    <button>view more</button>
                </form>
            </div>
        `)
    });
}

async function libMgmt(animeid,action,title=null,imgurl=null){
    const response = await fetch("/libMgmnt",{
        method: 'POST',
        body: JSON.stringify({
            animeid: animeid,
            action: action,
            title: title,
            imgurl: imgurl
        }),
        headers: {
            "Content-type": "application/json"
        }
    });
    const message = await response.json();
    return message;
}

