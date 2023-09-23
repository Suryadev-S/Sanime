const routes = require("./routes/routes");
const path = require("path");
const db = require("./database");
const express = require("express");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session");
const app = express();

const port = 8000 || process.env.PORT;

const MongoDBStore = mongodbStore(session);

const sessionStore = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    databaseName: 'anime_user',
    collection: 'sessions'
})

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: false}));
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
    res.locals.user = user;
    next();
})

app.use(routes);

app.set("view engine","ejs");

db.connectDb().then(()=>{
    app.listen(port,()=>{
        console.log("port and database connected");
    })
})