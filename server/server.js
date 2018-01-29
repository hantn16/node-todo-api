const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

var app = express();
app.use(bodyParser.json());
app.post('/todo/add', (req, res) => {
    const newTodo = new Todo({
        text: req.body.text
    });
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});

app.post('/users/add', (req, res) => {
    const newUser = new User({ email: req.body.email });
    newUser.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});
app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};