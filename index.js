const path = require("path");
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.static(path.join(__dirname,'public')));

app.get("/",(req,res)=>{
    const urls = ['https://api.jikan.moe/v4/seasons/now','https://api.jikan.moe/v4/watch/episodes'];
    let seasonsDataObject,episodesDataObject;
    axios.get(urls[0])
    .then((response) => {
        seasonsDataObject = response.data;
        return axios.get(urls[1]);
    })
    .then((response)=>{
        episodesDataObject = response.data;
        res.render("home",{
            seasonsArray: seasonsDataObject.data.slice(0,5),
            recentEpisodesArray: episodesDataObject.data.slice(0,4)
        })
    })
})

app.get("/get-anime",(req,res)=>{
    const anime = req.query.anime;
    let request;
    if(anime=="season" || anime=="recent"){
        request = anime;
        //fetch only url with no parameters
    }
    else{
        request = anime;
        //fetch url with parameters
    }
    res.render("home",{dataArray:[{
        images: {
            jpg:{
                image_url: "",
            }
        },
        title: "some title",
        score: "8.2"
    },{
        images: {
            jpg:{
                image_url: "",
            }
        },
        title: "another title",
        score: "3.6"
    }]},{
        pages:{last_visible_page: 8}
    });
})

app.set("view engine","ejs");
app.listen(3000,()=>{
    console.log("port connected");
})