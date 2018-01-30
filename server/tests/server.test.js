const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');

const seedTodos = [{
    _id: new ObjectID(),
    text: 'the first todo for test'
}, {
    _id: new ObjectID(),
    text: 'the second todo for test'
}];
beforeEach((done) => {
    Todo.remove({})
        .then(() => {
            Todo.insertMany(seedTodos).then(() => done());
        });
});
describe('POST /todos/add', () => {
    it('should create a new todo', (done) => {
        const text = 'Test todo text';
        request(app)
            .post('/todos/add')
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
            .post('/todos/add')
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            }).end(done);
    });
});
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${seedTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seedTodos[0].text);
            }).end(done);
    });
    it('should return 404 if todo not found', (done) => {
        const testID = new ObjectID();
        request(app)
            .get(`/todos/${testID.toHexString}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBe(undefined);
            }).end(done);
    });
    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBe(undefined);
            }).end(done);
    });
});
describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const hexID = seedTodos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seedTodos[0].text);
            }).end((err,result) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 404 if todo not found', (done) => {
        const hexID = new ObjectID().toHexString;
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBe(undefined);
            }).end((err,result) => {
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
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBe(undefined);
            }).end((err,result) => {
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