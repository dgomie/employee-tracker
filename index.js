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
let managers = ["none", "test1", "test2"];

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
  let currentRoles = [];
  db.query("SELECT * FROM roles", function (err, results) {
    if (err) {
      console.error(err);
    } else {
      results.forEach((result) => {
        currentRoles.push(result.job_title);
      });
    }
  });

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
        choices: currentRoles,
      },
      {
        type: "list",
        message: "Who is the employee's manager?",
        name: "manager",
        choices: managers,
      },
    ])
    .then((newEmployee) => {
        db.query("SELECT * FROM roles", function (err, results) {
            results.forEach((result) => {
                // compare the selected name to name in database in order to pull dept_id
              if (result.job_title === newEmployee.role) {
                const sql = `INSERT INTO employees (first_name, last_name, role_id)VALUES (?,?,?)`; //need to add manager_id and role_id
                const params = [newEmployee.firstName, newEmployee.lastName, result.id];
                console.log("params", params)

                db.query(sql, params, function (err, results) {
                    if (err) {
                        console.error(err);
                    } else {
                    console.log(`Added ${newEmployee.firstName} ${newEmployee.lastName} to the database`
                    );
                    }
                })
                }
            });   
        });
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
      const sql = `INSERT INTO departments (department_name)
      VALUES (?)`;
      const params = [newDepartment.deptName];
      db.query(sql, params, function (err, results) {
        if (err) {
          console.error(err);
        } else {
          console.log(`Added ${newDepartment.deptName} to the database.`);
        }
      });
    });
}

function addRole() {
  let currentDept = [];
  db.query("SELECT * FROM departments", function (err, results) {
    if (err) {
      console.error(err);
    } else {
      results.forEach((result) => {
        currentDept.push(result.department_name);
      });
    }
  });
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
        choices: currentDept,
      },
    ])
    .then((newRole) => {

      db.query("SELECT * FROM departments", function (err, results) {
        results.forEach((result) => {
            // compare the selected name to name in database in order to pull dept_id
          if (result.department_name === newRole.roleDept) {
            const sql = `INSERT INTO roles (job_title, salary, department_id)
      VALUES (?,?,?)`;
            const params = [newRole.roleName, newRole.roleSalary, result.id];
            console.log("params", params);

             // Create new job row in roles table
            db.query(sql, params, function (err, results) {
              if (err) {
                console.error(err);
              } else {
                console.log(`Added ${newRole.roleName} to the database.`);
              }
            });
          }
        });
      });
    });
}

function displayTable(choice) {
  switch (choice) {
    case "employees":
      db.query(
        "SELECT e.id, e.first_name, e.last_name, r.job_title title, d.department_name department, r.salary FROM employees e INNER JOIN roles r ON e.role_ID = r.id INNER JOIN departments d ON r.department_id = d.id",
        function (err, results) {
          if (err) {
            console.error(err);
          } else {
            console.table(results);
          }
        }
      );
      break;

    case "roles":
      db.query(
        "SELECT r.job_title, d.department_name, r.salary FROM departments d JOIN roles r ON d.id = r.department_id",
        function (err, results) {
          if (err) {
            console.error(err);
          } else {
            console.table(results);
          }
        }
      );
      break;

    default:
      db.query(
        `SELECT d.id, d.department_name name FROM departments d`,
        function (err, results) {
          if (err) {
            console.error(err);
          } else {
            console.table(results);
          }
        }
      );
      break;
  }
}
