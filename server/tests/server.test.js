const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { populateTodos, seedTodos, seedUsers, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test todo text';
        request(app)
            .post('/todos')
            .set('x-auth',seedUsers[0].tokens[0].token)
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => { //if end() get error
                if (err) {
                    return done(err);
                }
                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done()
                }).catch((e) => done(e)); //if find() get error
            });
    });
    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth',seedUsers[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});
describe('GET /todos', () => {
    it('should get all of todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth',seedUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            }).end(done);
    });
});
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth',seedUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seedTodos[0].text);
            }).end(done);
    });
    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${seedTodos[1]._id.toHexString()}`)
            .set('x-auth',seedUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        const testID = new ObjectID();
        request(app)
            .get(`/todos/${testID.toHexString}`)
            .set('x-auth',seedUsers[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBeFalsy();
            }).end(done);
    });
    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .set('x-auth',seedUsers[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBeFalsy();
            }).end(done);
    });
});
describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const hexID = seedTodos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth',seedUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seedTodos[0].text);
            }).end((err, result) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should not remove a todo created by other user', (done) => {
        const hexID = seedTodos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth',seedUsers[1].tokens[0].token)
            .expect(404)
            .end((err, result) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 404 if todo not found', (done) => {
        const hexID = new ObjectID().toHexString;
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth',seedUsers[1].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBeFalsy();
            }).end((err, result) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 404 if objectID is invalid', (done) => {
        request(app)
            .delete(`/todos/123abc`)
            .set('x-auth',seedUsers[1].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBeFalsy();
            }).end((err, result) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done()
                }).catch((e) => done(e));
            });
    });
});
describe('PATCH /todos/:id', () => {
    it('should update completed from false to true', (done) => {
        const hexId = seedTodos[0]._id.toHexString();
        const text = 'new todo for updating';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',seedUsers[0].tokens[0].token)
            .send({ text, completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeTruthy();
                expect(typeof res.body.todo.completedAt).toBe('number');
            }).end(done);
    });
    it('should not update todo created by other user', (done) => {
        const hexId = seedTodos[0]._id.toHexString();
        const text = 'new todo for updating';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',seedUsers[1].tokens[0].token)
            .send({ text, completed: true })
            .expect(404)
            .end(done);
    });
    it('should clear completedAt when todo is not completed', (done) => {
        const hexId = seedTodos[1]._id.toHexString();
        const completed = false;
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',seedUsers[1].tokens[0].token)
            .send({ completed })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(completed);
                expect(res.body.todo.completedAt).toBeFalsy();
            }).end(done);
    });
});
describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', seedUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(seedUsers[0]._id.toHexString());
                expect(res.body.email).toBe(seedUsers[0].email);
            }).end(done);
    });
    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body._id).toBeFalsy();
                expect(res.body.email).toBeFalsy();
            }).end(done)
    });
});
describe('POST /users', () => {
    it('should create a user', (done) => {
        var user = {
            email: 'hantn16@gmail.com',
            password: 'anhhan16'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(user.email);
                expect(res.headers['x-auth'].toString()).toBeTruthy();
            }).end((err) => {
                if (err) {
                    return done(err)
                }
                User.findOne({ email: user.email }).then((res) => {
                    expect(res).toBeTruthy();
                    expect(res.password).not.toBe(user.password);
                    done();
                });
            });
    });
    it('should return validation errors if request invalid', (done) => {
        var user = {
            _id: new ObjectID(),
            email: 'hantn17@gmail.com',
            password: 'anh16'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .expect((res) => {
                expect(res.body._id).toBeFalsy();
                expect(res.body.email).toBeFalsy();
            }).end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email: user.email }).then((res) => {
                    expect(res).toBeFalsy();
                    done();
                });
            });
    });
    it('should not create user if email in use', (done) => {
        var user = {
            _id: new ObjectID(),
            email: 'hantn161@example.com',
            password: 'anhhan16'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .expect((res) => {
                expect(res.body._id).toBeFalsy();
                expect(res.body.email).toBeFalsy();
            }).end((err) => {
                if (err) {
                    return done(err);
                }
                User.find({ email: user.email }).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    });
});
describe('POST /users/login', () => {
    it('should return an user when email, password is correct', (done) => {
        const email = seedUsers[1].email;
        const password = seedUsers[1].password;
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(email);
                expect(res.headers['x-auth']).toBeTruthy();
            }).end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(seedUsers[1]._id).then((user) => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e))
            });
    });
    it('should return 400 when email or password is not correct', (done) => {
        const email = seedUsers[0].email + "abc";
        const password = seedUsers[0].password;
        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(400)
            .expect((res) => {
                expect(res.body.email).toBeFalsy();
            }).end(done);
    })
});
describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        //DELETE /users/me/token
        request(app)
            .delete('/users/me/token')
            .set('x-auth', seedUsers[0].tokens[0].token)
            .expect(200)
            .end((err,res) => {
                if (err) {
                    return done(err);
                }
                User.findById(seedUsers[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});