const inquirer = require("inquirer");
const mysql = require("mysql2");
const { PASSWORD } = require("./password");
const header = require("./assets/ascii/header");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: PASSWORD,
    database: "dunder_db",
  },
  console.log(`Connected to the dunder_db database.`)
);

function init() {
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
          updateEmployeeRole();
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
          process.exit();
      }
    });
}

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

  let employeesArray = [{ name: "none", id: null }];
  db.query("SELECT * FROM employees", function (err, results) {
    if (err) {
      console.error(err);
    } else {
      results.forEach((result) => {
        let fullName = `${result.first_name} ${result.last_name}`;
        employeesArray.push({ name: fullName, id: result.id });
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
        choices: employeesArray,
      },
    ])
    .then((newEmployee) => {
      db.query("SELECT * FROM roles", function (err, results) {
        0;
        results.forEach((result) => {
          // compare the selected name to name in database in order to pull dept_id
          if (result.job_title === newEmployee.role) {
            employeesArray.forEach((employee) => {
              if (employee.name === newEmployee.manager) {
                let newEmployeeManagerId = employee.id;
                const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)VALUES (?,?,?,?)`; //need to add manager_id and role_id
                const params = [
                  newEmployee.firstName,
                  newEmployee.lastName,
                  result.id,
                  newEmployeeManagerId,
                ];
                console.log("params", params);

                db.query(sql, params, function (err, results) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(
                      `Added ${newEmployee.firstName} ${newEmployee.lastName} to the database\n`
                    );
                    init();
                  }
                });
              }
            });
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
          console.log(`Added ${newDepartment.deptName} to the database.\n`);
          init();
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
                console.log(`Added ${newRole.roleName} to the database.\n`);
                init();
              }
            });
          }
        });
      });
    });
}

function updateEmployeeRole() {
  let rolesArray = [];
  let employeesArray = [];

  db.query("SELECT * FROM roles", function (err, roles) {
    if (err) {
      console.error(err);
    } else {
      roles.forEach((role) => {
        rolesArray.push({ name: role.job_title, value: role.id });
      });

      db.query("SELECT * FROM employees", function (err, employees) {
        if (err) {
          console.error(err);
        } else {
          employees.forEach((employee) => {
            let fullName = `${employee.first_name} ${employee.last_name}`;
            employeesArray.push({ name: fullName, value: employee.id });
          });

          inquirer
            .prompt([
              {
                type: "list",
                message: "Which employee's role do you want to update?",
                name: "employee",
                choices: employeesArray,
              },
              {
                type: "list",
                message:
                  "Which role do you want to assign the selected employee?",
                name: "role",
                choices: rolesArray,
              },
            ])
            .then((response) => {
              console.log(response)
              const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
              const params = [response.role, response.employee];
              db.query(`UPDATE employees SET role_id = ? WHERE id = ?`, params, function (err, results) {
                if (err) {
                  console.error(err);
                } else {
                  console.log(`Updated employee's role in the database.\n`);
                  console.log(results)
                  init();
                }
            })
          });
        }
      });
    }
  });
}

function displayTable(choice) {
  switch (choice) {
    case "employees":
      db.query(
        "SELECT e1.id, e1.first_name, e1.last_name, r.job_title title, d.department_name department, r.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager FROM employees e1 INNER JOIN roles r ON e1.role_ID = r.id INNER JOIN departments d ON r.department_id = d.id LEFT JOIN employees e2 ON e1.manager_id = e2.id",
        function (err, results) {
          if (err) {
            console.error(err);
          } else {
            console.table(results);
            init();
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
            init();
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
            init();
          }
        }
      );
      break;
  }
}

// initialize program
console.log(header);
init();