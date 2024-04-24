const inquirer = require("inquirer");
const mysql = require("mysql2");
const { PASSWORD } = require("./password");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: PASSWORD,
    database: "dunder_db",
  },
  console.log(`Connected to the dunder_db database.`)
);

const operationChoices = [
  "View All Employees",
  "Add Employee",
  "Update Employee Role",
  "View All Roles",
  "Add Role",
  "View All Departments",
  "Add Department",
  "Quit",
];
let managers = ["test1", "test2"];
let departments = ["dept1", "dept2"];
let roles = ["role1", "role2"];

inquirer
  .prompt([
    {
      type: "list",
      message: "What would you like to do?",
      name: "operation",
      choices: operationChoices,
    },
  ])
  .then((response) => {
    console.log(response);

    switch (response.operation) {
      case "View All Employees":
        displayTable("employees");
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Update Employee Role":
        console.log("Create function to ask for new role");
        break;
      case "View All Roles":
        displayTable("roles");
        break;
      case "Add Role":
        addRole();
        break;
      case "View All Departments":
        displayTable("departments");
        break;
      case "Add Department":
        addDepartment();
        break;
      default:
        console.log(`Goodbye.`);
    }
  });


function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employee's first name?",
        name: "firstName",
      },
      {
        type: "input",
        message: "What is the employee's last name?",
        name: "lastName",
      },
      {
        type: "list",
        message: "What is the employee's role",
        name: "role",
        choices: roles,
      },
      {
        type: "list",
        message: "Who is the employee's manager?",
        name: "manager",
        choices: managers,
      },
    ])
    .then((newEmployee) => {
        console.log(`Added ${newEmployee.firstName} ${newEmployee.lastName} to the database.`);
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "deptName",
      },
    ])
    .then((newDepartment) => {
        console.log(`Added ${newDepartment.deptName} to the database.`);
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What is the salary of the role?",
        name: "roleSalary",
      },
      {
        type: "list",
        message: "What department does the role belong to?",
        name: "roleDept",
        choices: departments,
      },
    ])
    .then((newRole) => {
      console.log(`Added ${newRole.roleName} to the database.`);
      console.log(newRole);
    });
}

// function updateRole() {

// }

function displayTable(choice) {
  db.query(`SELECT * FROM ${choice}`, function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.table(results);
    }
  });
}

