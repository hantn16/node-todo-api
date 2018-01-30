const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TodoApp');

module.exports = {mongoose};

// var newUser = new User({email: 'aaaaa'});
// newUser.save().then((doc) => {
//     console.log(`saved user`, doc);
// }, (err) => {
//     console.log(`Unable to save user`, err);
// });