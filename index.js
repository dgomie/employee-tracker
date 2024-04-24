const inquirer = require('inquirer');

const operationChoices = ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department' ]
let managers = ["test1", 'test2'];
let departments = ["dept1", 'dept2'];
let roles = ['role1', 'role2']

inquirer
  .prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'operation',
      choices: operationChoices,
    },
  ])
  .then((response) => {
    console.log(response)
    if (response.operation === "View All Employees") {
        console.log("Displaying all employees")
    } else if (response.operation === "Add Employee") {
        addEmployee();
    }
  }
   
  );


  function addEmployee() {
    inquirer
        .prompt([
            {
              type: 'input',
              message: "What is the employee's first name?",
              name: "firstName",
            },
            {
              type: 'input',
              message: "What is the employee's last name?",
              name: "lastName",
            },
            {
              type: 'list',
              message: "What is the employee's role",
              name: "role",
              choices: roles,
            },
            {
              type: 'list',
              message: "Who is the employee's manager?",
              name: "manager",
              choices: managers
            }
        ])
        .then((newEmployee) => {
            console.log(newEmployee)
        })
  }