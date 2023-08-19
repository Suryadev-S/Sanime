const db = require("../database");
const express = require("express");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/",async (req, res) => {
    const user = res.locals.user;
    const url = 'https://api.jikan.moe/v4/seasons/now';
    if(user){
        const userDoc = await db.getDb()
        .collection('user')
        .findOne({_id: new ObjectId(user.id)});

        axios.get(url).then((response) => {
            const dataObject = response.data;
            res.render('current', {
                dataArray: dataObject.data,
                pages: dataObject.pagination,
                userLibList: userDoc.lib
            });
        })
    }
    else{
        axios.get(url).then((response) => {
            const dataObject = response.data;
            res.render('current', {
                dataArray: dataObject.data,
                pages: dataObject.pagination,
                userLibList: null
            });
        })
    }
})

router.get("/get-anime", async (req, res) => {
    const anime = req.query.anime;
    const user = res.locals.user;

    if(user){
        const userDoc = await db.getDb()
        .collection('user')
        .findOne({_id: new ObjectId(res.locals.user.id)});
    
        const url = `https://api.jikan.moe/v4/anime?q=${anime}`;
        axios.get(url).then((response) => {
            const dataObject = response.data;
            res.render('searched', {
                dataArray: dataObject.data,
                pages: dataObject.pagination,
                anime: anime,
                userLibList: userDoc.lib
            });
        })
    }
    else{
        const url = `https://api.jikan.moe/v4/anime?q=${anime}`;
        axios.get(url).then((response) => {
            const dataObject = response.data;
            res.render('searched', {
                dataArray: dataObject.data,
                pages: dataObject.pagination,
                anime: anime,
                userLibList: userDoc.lib
            });
        })
    }
})

router.get("/get-filtered-anime", async (req, res) => {
    const anime = req.query.anime;
    const filter = req.query.filter;
    const user = res.locals.user;
    let url;
    if (filter === 'all') {
        // url = `https://api.jikan.moe/v4/anime?q=${anime}`;
        return res.redirect(`/get-anime?anime=${anime}`);
    }
    else {
        url = `https://api.jikan.moe/v4/anime?q=${anime}&type=${filter}`;
    }
    if(user){
        const userDoc = await db.getDb()
        .collection('user')
        .findOne({_id: new ObjectId(res.locals.user.id)});
    
        axios.get(url).then((response) => {
            const dataObject = response.data;
            res.render('searched', {
                dataArray: dataObject.data,
                pages: dataObject.pagination,
                anime: anime,
                userLibList: userDoc.lib
            });
        })
    }
    else{
        axios.get(url).then((response) => {
            const dataObject = response.data;
            res.render('searched', {
                dataArray: dataObject.data,
                pages: dataObject.pagination,
                anime: anime,
                userLibList: userDoc.lib
            });
        })
    }
})

router.get('/signup', (req, res) => {
    let sessionInputData = req.session.inputData;

    if(!sessionInputData){
        sessionInputData = {
            hasError: false,
            message: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
    }
    req.session.inputData = null;
    res.render('signup',{inputData: sessionInputData});
})

router.get('/profile',async (req,res)=>{
    if(res.locals.user){
        const userDoc = await db.getDb()
        .collection('user')
        .findOne({_id: new ObjectId(res.locals.user.id)});
        res.render('profile',{userLibList: userDoc.lib});
    }
    else{
        res.redirect('/signup');
    }
})

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/post-signup', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body['confirm-password'];

    if ( 
        !email ||
        !password ||
        !confirmPassword ||
        password != confirmPassword ||
        !email.includes('@')
    ) {
        // console.log("incorrect data");
        req.session.inputData={
            hasError: true,
            message: 'invalid input',
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };
        req.session.save(()=>{
            return res.redirect('/signup');
        })
        return; //kinda important here to avoid response clash
    }

    const existingUser = await db.getDb().collection('user').findOne({ email: email });
    if (existingUser) {
        console.log("user exists already");
        req.session.inputData={
            hasError: true,
            message: 'user exists already',
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };
        return res.redirect('/signup');
    }
    const hashedPass = await bcrypt.hash(password, 12);
    await db.getDb().collection('user').insertOne({
        username: username,
        email: email,
        password: hashedPass
    });
    console.log('user signed in');
    res.redirect('/login');
})

router.post('/post-login', async (req, res) => {
    const { username, password } = req.body;

    const existingUser = await db.getDb().collection('user').findOne({ username: username });
    if (!existingUser) {
        console.log("there is no such user");
        return res.redirect('/login');
    }
    const passAreEqual = await bcrypt.compare(password, existingUser.password);
    if (!passAreEqual) {
        console.log('pass incorrect');
        return res.redirect("/login");
    }

    req.session.user = { id: existingUser._id,username: existingUser.username, email: existingUser.email };
    req.session.isAuthenticated = true;
    req.session.save(() => {
        console.log("user logged in " + existingUser.username);
        res.redirect('/');
    })
})

router.post('/logout',(req,res)=>{
    req.session.user = null;
    req.session.isAuthenticated = false;
    res.redirect("/");
})

router.post('/add-to-lib',async (req,res)=>{
    const {id, image, title} = req.body;
    const user = req.session.user;
    let getLibDoc = await db.getDb().collection('user').find({_id: new ObjectId(user.id)}).project({lib:1,_id:0}).toArray();
    let libArray = getLibDoc[0].lib || [];
    const libItem = {mal_id:id,image:image,title:title};
    libArray.push(libItem);
    await db.getDb().collection('user').updateOne({_id: new ObjectId(user.id)},
    {$set:{
        lib: libArray
    }});
})

router.get('/get-userLibList',async (req,res)=>{
    //returns a json of user lib list
    let getLibDoc = await db.getDb().collection('user').find({_id: new ObjectId(res.locals.user.id)}).project({lib:1,_id:0}).toArray();
    // const jsonLibDoc = JSON.stringify(getLibDoc[0]);
    res.json(getLibDoc[0]);
})
module.exports = router;