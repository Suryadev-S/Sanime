const db = require("../database");
const express = require("express");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/",(req,res)=>{
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

router.get("/get-anime",(req,res)=>{
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

router.get("/get-filtered-anime",(req,res)=>{
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

router.get("/get-anime-info",async (req,res)=>{
    const animeId = req.query.anime;
    const animeInLib = await db
    .getDb()
    .collection("user")
    .findOne({$and:[{email:req.session.user.email},{'lib.animeid':animeId}]});
    let url = `https://api.jikan.moe/v4/anime/${animeId}`;
    axios.get(url)
    .then((response)=>{
        dataObject = response.data;
        res.render("anime_info",{
            data: dataObject.data,
            animeInLib: animeInLib
        })
    })
})

router.get("/signup",(req,res)=>{
    const signupInput = req.session.signupInput;
    if(!signupInput){
        return res.render("signup",{message: null});
    }
    req.session.signupInput = null;
    res.render("signup",{message: signupInput.message});
})

router.post("/signup",async (req,res)=>{
    const {email,password} = req.body;
    const existingUser = await db.getDb().collection("user").findOne({email: email});
    // console.log(existingUser);
    if(existingUser){
        // console.log("this user already exists");
        req.session.signupInput = {
            message: "user already exists"
        };
        req.session.save(()=>{
            return res.redirect("/signup");
        })
        return;
    }
    const hashedPass = await bcrypt.hash(password,12);
    await db
    .getDb()
    .collection("user")
    .insertOne({email: email,password: hashedPass});

    res.redirect("/login");
})

router.get("/login",(req,res)=>{
    const loginInput = req.session.loginInput;
    if(!loginInput){
        return res.render("login",{message: null});
    }
    req.session.loginInput = null;
    res.render("login",{message: loginInput.message});
})

router.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const existingUser = await db.getDb().collection("user").findOne({email: email});
    if(!existingUser){
        // console.log("there is no such user");
        req.session.loginInput = {message: "there is no such user.Maybe go and signup first"};
        req.session.save(()=>{
            return res.redirect("/login");
        })
        return;
    }
    const passAreEqual = await bcrypt.compare(password,existingUser.password);
    if(!passAreEqual){
        req.session.loginInput = {message: "password doesn't match"};
        req.session.save(()=>{
            return res.redirect("/login");
        })
        return;
    }
    req.session.user = {
        email: email
    }
    req.session.save(()=>{
        return res.redirect("/");
    })
})

router.post("/libMgmnt",async (req,res)=>{
    const {animeid,action,title,imgurl} = req.body;
    if(action==="add"){
        await db.getDb().collection("user").updateOne({
            email:req.session.user.email
        },
        {
            $push:{
                lib:{
                    animeid: animeid,
                    title: title,
                    imgurl: imgurl
                }
            }
        })
        return res.json({msg:"added"});
    }
    else{
        await db.getDb().collection("user").updateOne({
            email: req.session.user.email
        },
        {
            $pull:{
                lib:{
                    animeid: animeid
                }
            }
        })
        return res.json({msg:"deleted"});
    }
})

router.get("/profile",async (req,res)=>{
    const lib = await db
    .getDb()
    .collection("user")
    .find({email:req.session.user.email})
    .project({lib:1,_id:0})
    .toArray();
    res.render("profile",{lib: lib[0].lib});
})

router.post("/logout",(req,res)=>{
    req.session.user = null;
    res.redirect("/");
})

module.exports = router;