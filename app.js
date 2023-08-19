const routes = require("./routes/routes");
const db = require("./database");
const path = require("path");
const express = require("express");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session");

const MongoDBStore = mongodbStore(session);

const sessionStore = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/',
    databaseName: 'anime_user',
    collection: 'sessions'
})

const app = express();

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}))

app.use((req,res,next)=>{
    const user = req.session.user;
    if(!user){
        return next();
    }
    res.locals.isAuth = true;
    res.locals.user = user;
    next();
});

app.use(routes);

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');


db.connectDb().then(()=>{
    app.listen(3000,()=>{
        console.log("port and database connected");
    })
})