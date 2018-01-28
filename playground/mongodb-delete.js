// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb Server!!!');
    }
    console.log('Connected to MongoDb Server');
    const myDb = db.db('TodoApp');
    // myDb.collection('Users').deleteMany({name: 'Han Trinh'});
    myDb.collection('Users').findOneAndDelete({ _id: new ObjectID("5a6d8b0f655fbf14b100c95d") }).then((result) => {
        console.log(JSON.stringify(result, undefined, 2));
    })
    db.close();
});