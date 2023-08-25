const path = require("path");
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: false}));

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
    let url = "https://api.jikan.moe/v4";
    if(anime=='season'){
        url += "/seasons/now";
    }
    else if(anime=="recent"){
        url += "/watch/episodes";
    }
    else{
        url += `/anime?q=${anime}`;
    }
    axios.get(url)
    .then((response)=>{
        dataObject = response.data; //this '.data' is default for axios calls. It converts json to object
        res.render('searched',{
            dataArray: dataObject.data, //this '.data' is accessing the data key of the received json.
            pages: dataObject.pagination,
            anime: anime,
            filter: null //for the sake of working, a bogus variable
        })
    })
})

app.get("/get-filtered-anime",(req,res)=>{
    const anime = req.query.anime;
    const filter = req.query.filter;
    let url = "https://api.jikan.moe/v4";
    if(anime=="season"){
        if(filter == "all"){
            url += "/seasons/now";
        }
        else{
            url += `/seasons/now?filter=${filter}`;
        }
    }
    else{
        if(filter=="all"){
            url += `/anime?q=${anime}`;
        }
        else{
            url += `/anime?q=${anime}&type=${filter}`
        }
    }
    axios.get(url)
    .then((response)=>{
        dataObject = response.data;
        res.render('searched',{
            dataArray: dataObject.data,
            pages: dataObject.pagination,
            anime: anime,
            filter: filter
        })
    })
})

app.set("view engine","ejs");
app.listen(3000,()=>{
    console.log("port connected");
})