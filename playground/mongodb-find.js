// const MongoClient = require('mongodb').MongoClient;
const {MongoClient,ObjectID} = require('mongodb');


MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb Server!!!');
    }
    console.log('Connected to MongoDb Server');
    const myDb = db.db('TodoApp');
    myDb.collection('Users').find({age: 27}).count().then((count) =>{
        console.log(`The count of documents is: ${count}`);
    }, (err) => {
        console.log(`Unable to count the documents`);
        console.log(JSON.stringify(err,undefined,2));
    });
    db.close();
});