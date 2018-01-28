// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb Server!!!');
    }
    console.log('Connected to MongoDb Server');
    const myDb = db.db('TodoApp');
    myDb.collection('Users').findOneAndUpdate({
        _id: new ObjectID("5a6d8b50655fbf14b100c96b")
    }, {
            $set: { name: 'Han Trinh' },
            $inc: { age: -1 }
        }, { returnOriginal: false }).then((result) => {
            console.log(JSON.stringify(result,undefined,2));
        })
    db.close();
});