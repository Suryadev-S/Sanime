const {MongoClient} = require('mongodb');
let database;

async function connect(){
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
    database = client.db('anime_user');
}

function db(){
    if(!database){
        throw({message: "failed connection"});
    }
    return database;
}

module.exports = {
    connectDb: connect,
    getDb: db
}