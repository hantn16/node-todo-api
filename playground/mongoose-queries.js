const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

const id = '5a6de1e42394a83e8874b09f';
User.findById(id).then((user) => {
    if (!user) {
        return console.log('user not found!!!');
    }
    console.log('User', user);
}).catch((e) => {
    return console.log(e.message);
});