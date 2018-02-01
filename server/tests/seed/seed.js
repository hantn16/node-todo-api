const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const seedTodos = [{
    _id: new ObjectID(),
    text: 'the first todo for test'
}, {
    _id: new ObjectID(),
    text: 'the second todo for test',
    completed: true,
    completedAt: 333
}];

const populateTodos = (done) => {
    Todo.remove({})
        .then(() => {
            Todo.insertMany(seedTodos).then(() => done());
        });
};

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const seedUsers = [{
    _id: userOneId,
    email: 'hantn161@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'hantn162@example.com',
    password: 'userTwoPass',
    tokens: []
}];

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(seedUsers[0]).save();
        var userTwo = new User(seedUsers[1]).save();
        return Promise.all([userOne,userTwo])     
    }).then(() => done());
};
module.exports = { seedTodos, populateTodos, seedUsers,populateUsers };