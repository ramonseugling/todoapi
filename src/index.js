const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//www.notion.so/Desafio-01-Conceitos-do-Node-js-59ccb235aecd43a6a06bf09a24e7ede8

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).send({
      error: "User not found with this username",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.json(newUser).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos).send();
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const { id } = request.params;

  const todoToUpdate = user.todos.find((todo) => todo.id === id);

  if (!todoToUpdate) {
    response.status(404).send({
      error: "Todo not found with this uuid",
    });
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = new Date(deadline);

  return response.json(todoToUpdate).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todoToUpdate = user.todos.find((todo) => todo.id === id);

  if (!todoToUpdate) {
    response.status(404).send({
      error: "Todo not found with this uuid",
    });
  }

  todoToUpdate.done = true;

  return response.json(todoToUpdate).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todoToDelete = user.todos.find((todo) => todo.id === id);

  if (!todoToDelete) {
    response.status(404).send({
      error: "Todo not found with this uuid",
    });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;
