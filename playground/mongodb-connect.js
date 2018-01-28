// const MongoClient = require('mongodb').MongoClient;
const {MongoClient,ObjectID} = require('mongodb');


MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb Server!!!');
    }
    console.log('Connected to MongoDb Server');
    const myDb = db.db('TodoApp');
    // console.log(myDb);
    // myDb.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert todo', error);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });
    myDb.collection('Users').insertOne({
        name: 'Han Trinh',
        age: 27,
        location: 'Hai Quang, Hai Hau, Nam Dinh'
    },(error,result) => {
        if (error) {
            return console.log('Unable to insert user', error);
        }
        console.log(JSON.stringify(result.ops,undefined,2));
    });
    db.close();
});