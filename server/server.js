const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.post('/todos/add', (req, res) => {
    const newTodo = new Todo({
        text: req.body.text
    });
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

//GET /todos/12323434
app.get('/todos/:id',(req,res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        return res.status(200).send({todo});
    },(err) => {
        return res.status(404).send();
    });
});

//DELETE /todos/:id
app.delete('/todos/:id',(req,res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
        // throw new Error('id is not valid');
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        return res.status(200).send({todo});
    },(err) => {
        return res.status(400).send(err);
    });
});

//POST /users/add
app.post('/users/add', (req, res) => {
    const newUser = new User({ email: req.body.email });
    newUser.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app };