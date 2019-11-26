pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;
  /* this is our public variable to be accessed on the blockchain */

  struct Todo {
    uint id;
    string body;
    bool finished;
  }

  mapping(uint => Todo) public todos;
  /* associative array / hash */
  /* becomes our database */

  event TaskCreated(
    uint id,
    string body,
    bool finished
    );

  event TaskCompleted(
    uint id,
    bool finished
    );

  constructor() public{
    createTodo("Present on Ethereum! (badly)");
    createTodo("#2 Test");
  }
  /* initialize */

  function createTodo(string memory _content) public {
    taskCount ++;
    todos[taskCount] = Todo(taskCount, _content, false);
    emit TaskCreated(taskCount, _content, false); // subscribable from outside
  } 

  function toggleCompleted(uint _id) public {
    Todo memory _todo = todos[_id];
    _todo.finished = !_todo.finished;
    todos[_id] = _todo;
    emit TaskCompleted(_id, _todo.finished);
  }



}
