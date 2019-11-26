App = {
  loading: false,
  contracts: {},
  load: async() => {
    // load the App

    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
loadWeb3: async () => {
  if (typeof web3 !== 'undefined') {
    App.web3Provider = web3.currentProvider
    web3 = new Web3(web3.currentProvider)
  } else {
    window.alert("Please connect to Metamask.")
  }
  // Modern dapp browsers...
  if (window.ethereum) {
    window.web3 = new Web3(ethereum)
    try {
      // Request account access if needed
      await ethereum.enable()
      // Acccounts now exposed
      web3.eth.sendTransaction({/* ... */})
    } catch (error) {
      // User denied account access...
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = web3.currentProvider
    window.web3 = new Web3(web3.currentProvider)
    // Acccounts always exposed
    web3.eth.sendTransaction({/* ... */})
  }
  // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
},

loadAccount: async () => {  // loads account from metamask
  App.account = web3.eth.accounts[0]
  console.log(App.account)
},

loadContract: async () => {
  const todoList = await $.getJSON('TodoList.json')
  console.log(todoList)
  App.contracts.TodoList = TruffleContract(todoList) // creates a smart version of our contract that we can call func on
  App.contracts.TodoList.setProvider(App.web3Provider)  // where it is on the blockchain

  App.todoList = await App.contracts.TodoList.deployed() // exactly like console

},

render: async () => {
  // always use protection
  if (App.loading) {
    return // exit to protect yourself from double rendering
  }

  //update state
  App.setLoading(true)

  $('#account').html(App.account) // loads account from bc displays to our index.html

  await App.renderTasks()

  App.setLoading(false)


},

renderTasks: async () => {
  // load from Blockchain
  const taskCount = await App.todoList.taskCount()

  const $taskTemplate = $('.taskTemplate')

  // render it into formatting

  for (var i = 1; i <= taskCount; i++){  // loop through task list
    const task = await App.todoList.todos(i)
    const taskId = task[0].toNumber()
    const taskContent = task[1]
    const taskCompleted = task[2]

    // gen html
    const $newTaskTemplate = $taskTemplate.clone()
    $newTaskTemplate.find('.content').html(taskContent)
    $newTaskTemplate.find('input').prop('name', taskId)
    .prop('checked', taskCompleted).on('click', App.toggleCompleted)

    if (taskCompleted) {
      $('#completedTaskList').append($newTaskTemplate)
    }

    else{
      $('#taskList').append($newTaskTemplate)
    }

    $newTaskTemplate.show()  // displays

  }

},

createTask: async () => {
  const content = $('#newTask').val()  // grab from form
  console.log(content)
  await App.todoList.createTodo(content)
  App.setLoading(false)
  // refreshes the page to bypass double render and event listener cause im laz
  window.location.reload()
},

toggleCompleted: async (e) => {
  App.setLoading(true)
  const taskId = e.target.name
  await App.todoList.toggleCompleted(taskId)
  window.location.reload()
},

setLoading: (boolean) => {  // this is super hacky could prob be better
  App.loading = boolean
  const loader = $('#loader')
  const content = $('#content')

  if (boolean) {
    loader.show()
    content.hide()
  }

  else{
    loader.hide()
    content.show()
  }

},



}

$(() => {
  $(window).load(()=>{
    App.load()
  })
})
