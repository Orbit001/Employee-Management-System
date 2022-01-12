const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const dotenv = require('dotenv')


const PORT = process.env.PORT || 3001;
const { parsed: parsedEnv } = dotenv.config();


const db = mysql.createConnection(
  {
    host: "localhost",
    user: parsedEnv.DB_USER,
    password: parsedEnv.DB_PASSWORD,
    database: parsedEnv.DB_NAME
  },
  console.log("Connected to " + parsedEnv.DB_NAME + ".")
);


const Primmenuchoices = [
    "View All Employees",
    "Add Employee",
    "Update Employee Role",
    "Delete Employee",
    "View All Roles",
    "Add Role",
    "Delete Role",
    "View All Departments",
    "Add Department",
    "Delete Department",
    "View Budget",
    "Quit"
  ];

  function beginprog(){

    inquirer
      .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "Choice1",
            choices: [
              Primmenuchoices[0],
              Primmenuchoices[1],
              Primmenuchoices[2],
              Primmenuchoices[3],
              Primmenuchoices[4],
              Primmenuchoices[5],
              Primmenuchoices[6],
              Primmenuchoices[7],
              Primmenuchoices[8],
              Primmenuchoices[9],
              Primmenuchoices[10],
              Primmenuchoices[11],
            ],
          },
      ])
      .then((initialChoice) => {
        switch (initialChoice.Choice1) {
          case Primmenuchoices[0]:
              viewEmployees();
              break;
          case Primmenuchoices[1]:
              addEmployee();
              break;
          case Primmenuchoices[2]:
              UpdateEmployeeRole();
              break;
          case Primmenuchoices[3]:
              DeleteEmployee();
              break;
          case Primmenuchoices[4]:
              DisplayRoles();
              break;
          case Primmenuchoices[5]:
              CreateRole();
              break;
          case Primmenuchoices[6]:
              deleteRole();
              break;
          case Primmenuchoices[7]:
              viewDepartments();
              break;
          case Primmenuchoices[8]:
              CreateDepartment();
              break;
          case Primmenuchoices[9]:
              RemoveDepartment();
              break;
          case Primmenuchoices[10]:
              ViewBudget();
              break;
          case Primmenuchoices[11]:
              console.log("Exiting application, goodbye.");
              process.exit();
        }
      });
  }

  function viewEmployees() { 
    db.query(
      "SELECT emp.id, emp.first_name, emp.last_name, role.title , department.name AS department, role.salary, CONCAT(man.first_name, ' ', man.last_name) AS manager FROM employee AS emp INNER JOIN role ON emp.role_id=role.id INNER JOIN department ON role.department_id=department.id LEFT JOIN employee AS man ON emp.manager_id = man.id",
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.table(results);
        beginprog();
      }
    );
  }
  
  function ViewBudget() { 
    db.query(
      "SELECT department.id, department.name AS Department, employee.role_id, SUM(role.salary) AS Total_Budget, role.department_id, role.id FROM employee INNER JOIN role ON role.id=employee.role_id INNER JOIN department ON department.id=role.department_id GROUP BY department.name ORDER BY Department, Total_Budget",
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.table(results);
        beginprog();
      }
    );
  }

  function addEmployee() { 
    let currentRoles = "";
    let possibleManagers = "";
    db.query("SELECT title, id FROM role;", function (err, result) {
      if (err) {
      }
      currentRoles = result.map((role) => ({
        name: role.title,
        value: { id: role.id, name: role.title },
      }));
      db.query(
        "SELECT first_name, last_name, id FROM employee;",
        function (err, result) {
          if (err) {
          }
          possibleManagers = result.map((manager) => ({
            name: manager.first_name + " " + manager.last_name,
            value: {
              id: manager.id,
              name: manager.first_name + " " + manager.last_name,
            },
          }));
          possibleManagers = possibleManagers.concat({
            name: "No Direct Manager",
            value: {
              id: null,
              name: null,
            },
          });
          inquirer
            .prompt([
              {
                type: "input",
                message: "What is the employee's first name?",
                name: "first_name",
              },
              {
                type: "input",
                message: "What is the employee's last name?",
                name: "last_name",
              },
              {
                type: "list",
                message: "What is the employee's role?",
                name: "emp_role",
                choices: currentRoles,
              },
              {
                type: "list",
                message: "What is the employee's managers id?",
                name: "emp_manager",
                choices: possibleManagers,
              },
            ])
            .then((empData) => {
              let managerId = empData.emp_manager;
              if (managerId.id) {
                managerId = managerId.id;
              } else {
                managerId = null;
              }
              db.query(
                "INSERT INTO employee SET ?",
                {
                  first_name: empData.first_name,
                  last_name: empData.last_name,
                  role_id: empData.emp_role.id,
                  manager_id: managerId,
                },
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(
                    "Added " +
                      empData.first_name +
                      " " +
                      empData.last_name +
                      " to employee table."
                  );
                  beginprog();
                }
              );
            });
        }
      );
    });
  }
  
  function UpdateEmployeeRole(){
    let currentEmployees = "";
    let currentRoles = "";
    db.query("SELECT first_name, last_name, id FROM employee;", function (err, result) {
      if (err) {
      }
      currentEmployees = result.map((emp) => ({
        name: emp.first_name + " " + emp.last_name,
        value: {
          id: emp.id,
          name: emp.first_name + " " + emp.last_name,
        },
      }));
      db.query(
        "SELECT title, id FROM role;",
        function (err, result) {
          if (err) {
          }
          currentRoles = result.map((role) => ({
            name: role.title,
            value: { id: role.id, name: role.title },
          }));
        
  
        inquirer
        .prompt([
        {
          type: "list",
          message: "Which employee's role do you want to update?",
          name: "emp",
          choices: currentEmployees,
        },
        {
          type: "list",
          message: "What is the employee's new role?",
          name: "emp_role",
          choices: currentRoles,
        },
        ]).then((empData) => {
          let empId = empData.emp.id;
          let empRole = empData.emp_role.id;
          db.query("UPDATE employee SET role_id = ? WHERE id = ?;", [empRole, empId], function(err, result){
            if(err){
              console.log(err);
            }
            console.log("Updated " + empData.emp.first_name + "'s role.");
            beginprog();
          });
        });
      });
    });
  }
  
  function DeleteEmployee(){
    let currentEmployees = "";
    db.query("SELECT first_name, last_name, id FROM employee;", function (err, result) {
      if (err) {
      }
      currentEmployees = result.map((emp) => ({
        name: emp.first_name + " " + emp.last_name,
        value: {
          id: emp.id,
          name: emp.first_name + " " + emp.last_name,
        },
      }));
      inquirer.prompt([
        {
          type: "list",
          message: "Which employee do you want to delete?",
          name: "emp",
          choices: currentEmployees,
        },
      ]).then((empData) => {
        let fName = empData.emp.first_name;
        let lName = empData.emp.last_name;
        let empId = empData.emp.id;
        db.query("DELETE FROM employee WHERE id = ?", empId, function(err, result){
          if(err){
            console.log(err);
          }
          console.log("Deleted " + fName + " " + lName + " from employee table.");
          beginprog();
        });
      });
    });
  }
  
  function DisplayRoles() { 
    db.query(
      "SELECT role.title, role.id, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id=department.id",
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.table(results);
        beginprog();
      }
    );
  }
  
  function CreateRole() {
    let currentDepartments = "";
    db.query("SELECT * FROM department", function (err, result) {
      if (err) {
      } else {
        currentDepartments = result.map((department) => ({
          name: department.name,
          value: { id: department.id, name: department.name },
        }));
        inquirer
          .prompt([
            {
              type: "input",
              message: "What is the title of the role?",
              name: "role_title",
            },
            {
              type: "input",
              message: "What is the salary of the role?",
              name: "role_salary",
            },
            {
              type: "list",
              message: "What is the department of the role?",
              name: "role_department",
              choices: currentDepartments,
            },
          ])
          .then((role_data) => {
            db.query(
              "INSERT INTO role SET ?",
              {
                title: role_data.role_title,
                salary: role_data.role_salary,
                department_id: role_data.role_department.id,
              },
              (err, results) => {
                if (err) {
                  console.log(err);
                }
                console.log("Added " + role_data.role_title + " to role table.");
                beginprog();
              }
            );
          });
      }
    });
  }
  
  function deleteRole() {
    let currentRoles = "";
    db.query("SELECT title, id FROM role;", function (err, result) {
      if (err) {
      }
      currentRoles = result.map((role) => ({
        name: role.title,
        value: { id: role.id, name: role.title },
      }));
      inquirer.prompt([
        {
          type: "list",
          message: "Which role do you want to delete?",
          name: "role",
          choices: currentRoles,
        },
      ]).then((roleData) => {
        let roleTitle = roleData.role.title;
        let roleId = roleData.role.id;
        db.query("DELETE FROM role WHERE id = ?", roleId, function(err, result){
          if(err){
            console.log(err);
          }
          console.log("Deleted " + roleTitle + " from role table.");
          beginprog();
        });
      });
    });
  }
  
  function viewDepartments() {
    db.query(
      "SELECT department.id, department.name FROM department",
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.table(results);
        beginprog();
      }
    );
  }
  
  function CreateDepartment() {
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the department?",
          name: "dep_name",
        },
      ])
      .then((dep_data) => {
        db.query(
          "INSERT INTO department SET name = ?",
          dep_data.dep_name,
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log("Added " + dep_data.dep_name + " to department table.");
            beginprog();
          }
        );
      });
  }
  
  function RemoveDepartment(){ 
    let currentDepartments = "";
    db.query("SELECT name, id FROM department;", function (err, result) {
      if (err) {
      }
      currentDepartments = result.map((department) => ({
        name: department.name,
        value: { id: department.id, name: department.name },
      }));
      inquirer.prompt([
        {
          type: "list",
          message: "Which department do you want to delete?",
          name: "department",
          choices: currentDepartments,
        },
      ]).then((depData) => {
        let depName = depData.department.name;
        let depId = depData.department.id;
        db.query("DELETE FROM department WHERE id = ?", depId, function(err, result){
          if(err){
            console.log(err);
          }
          console.log("Deleted " + depName + " from department table.");
          beginprog();
        });
      });
    });
  }
  
  beginprog();