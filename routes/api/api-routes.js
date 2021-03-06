// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

var db = require("../../models");
var Sequelize = require("sequelize");
// var Op = Sequelize.Op;

// mysql profile: host, port, user and password
require("dotenv").config();
var keys = require("../../keys.js");

// local dev env
var mysqlDatabase = keys.dev.database;
var mysqlUsername = keys.dev.username;
var mysqlPassword = keys.dev.password;
var mysqlHost = keys.dev.host;
var mysqlPort = keys.dev.port;

// Heroku env
if (process.env.JAWSDB_URL) {
  var str = process.env.JAWSDB_URL;
  var arr = str.split("/");
  var arr2 = arr[2].split(":");
  var arr3 = arr2[1].split("@");

  mysqlDatabase = arr[3];
  mysqlUsername = arr2[0];
  mysqlPassword = arr3[0];
  mysqlHost = arr3[1];
  mysqlPort = arr2[2];
}

var sequelize = new Sequelize(mysqlDatabase, mysqlUsername, mysqlPassword, {
  host: mysqlHost,
  port: mysqlPort,
  dialect: "mysql"
});

//Relations (foreign key constraint)
// -- need to have both hasOne and BelongsTo to avoid reference error
//    "ReferenceError: [model] is not defined"
db.role.hasOne(db.user, {
  foreignKey: {
    name: "permissionId",
    allowNull: true
  }
});

db.user.hasMany(db.result, {
  foreignKey: {
    name: "userId",
    allowNull: false
  }
});

db.quiz.hasMany(db.result, {
  foreignKey: {
    name: "quizId",
    allowNull: false
  }
});

// Routes
// =============================================================
module.exports = function(app) {
  app.post("/testuser", function(req, res) {
    console.log(req.body);

    var isManager;

    if (req.body.email === "test1@test.com") {
      isManager = false;
    }

    if (req.body.email === "test2@test.com") {
      isManager = true;
    }

    var obj = {
      email: req.body.email,
      isManager: isManager
    };
    res.json(obj);
  });

  // ---- automentor api routes: user

  // GET route for select all
  app.get("/users", function(req, res) {
    db.user.findAll().then(function(result) {
      res.json(result);
    });
  });

  // GET - select one
  app.get("/users/:email", function(req, res) {
    db.user
      .findOne({ where: { email: req.params.email } })
      .then(function(result) {
        res.json(result);
      });
  });

    // GET - select one by id
    app.get("/users/:id", function(req, res) {
      db.user
        .findOne({ where: { id: req.params.id } })
        .then(function(result) {
          res.json(result);
        });
    });

  // POST - insert
  app.post("/users", function(req, res) {
    db.user.create(req.body).then(function(results) {
      res.json(results);
    });
  });

  // PUT - update
  app.put("/users/:email", function(req, res) {
    db.user
      .update({ phone: req.body.phone }, { where: { email: req.params.email } })
      .then(function(results) {
        res.json(results);
      });
  });

  // DELETE delete
  app.delete("/users/:email", function(req, res) {
    db.user
      .destroy({ where: { email: req.params.email } })
      .then(function(results) {
        res.json(results);
      });
  });

  // ---- automentor api routes: quiz

  // GET route for select all
  app.get("/quizzes", function(req, res) {
    db.quiz.findAll().then(function(result) {
      // console.log("quiz questions to be sent");
      // console.log(result);
      res.json(result);
    });
  });

  // GET - select one
  app.get("/quizzes/:id", function(req, res) {
    db.quiz.findOne({ where: { id: req.params.id } }).then(function(result) {
      res.json(result);
    });
  });

  // POST - insert
  app.post("/quizzes", function(req, res) {
    db.quiz.create(req.body).then(function(results) {
      res.json(results);
    });
  });

  // PUT - update
  app.put("/quizzes/:id", function(req, res) {
    db.quiz
      .update({ question: req.body.question }, { where: { id: req.params.id } })
      .then(function(results) {
        res.json(results);
      });
  });

  // DELETE delete
  app.delete("/quizzes/:id", function(req, res) {
    db.quiz.destroy({ where: { id: req.params.id } }).then(function(results) {
      res.json(results);
    });
  });

  // ---- automentor api routes: resutls

  // GET route for select all
  app.get("/results", function(req, res) {
    db.result.findAll().then(function(result) {
      res.json(result);
    });
  });

  // GET - select one user's result

  app.get("/results/:email", function(req, res) {
    db.user
      .findOne({ where: { email: req.params.email } })
      .then(function(data) {
        db.result
          .findAll({ where: { userId: data.id } })
          .then(function(result) {
            res.json(result);
          });
      });
  });
  app.get("/results/:email/:quizid", function(req, res) {
    db.user
      .findOne({ where: { email: req.params.email } })
      .then(function(data) {
        var whereStatement = {};
        whereStatement.userId = data.id;
        whereStatement.quizId = req.params.quizid;

        // Example of where clause
        db.result.findAll({ where: whereStatement }).then(function(result) {
          res.json(result);
        });
      });
  });

  app.get("/resultsbydate/:date/:userid", function(req, res) {
    var whereStatement = {};
    whereStatement.userId = req.params.userid;

    // not done yet
    db.result.findAll({ where: whereStatement }).then(function(result) {
      res.json(result);
    });
  });

  app.get("/resultsbyusername/:username", function(req, res) {
    var whereStatement = {};
    whereStatement.username = req.params.username;

    // Example of Join Statement
    // SELECT * FROM users JOIN results ON (users.id = results.userId) where users.username = 'jim';
    // required=true means inner join
    // required=false means left outer join
    db.user
      .findAll({
        where: whereStatement,
        include: [
          {
            model: db.result,
            required: true
          }
        ]
      })
      .then(function(result) {
        res.json(result);
      });
  });

  // POST - insert
  app.post("/results", function(req, res) {
    db.result.create(req.body).then(function(results) {
      res.json(results);
    });
  });

  // PUT - update
  app.put("/results/:id", function(req, res) {
    db.result
      .update({ score: req.body.score }, { where: { id: req.params.id } })
      .then(function(results) {
        res.json(results);
      });
  });

  // DELETE delete
  app.delete("/results/:id", function(req, res) {
    db.result.destroy({ where: { id: req.params.id } }).then(function(results) {
      res.json(results);
    });
  });

  // ---- automentor api routes: other routes

  // -- check if user is manager
  app.get("/checkrole/:email", function(req, res) {
    db.user
      .findOne({ where: { email: req.params.email } })
      .then(function(data) {
        db.role
          .findOne({ where: { id: data.permissionId } })
          .then(function(result) {
            res.json(result);
          });
      });
  });

  // ---- automentor api routes: Charts

  // Function to collect data for FIRST Graph
  function getData(callback) {
    sequelize
      .query(
        "SELECT users.firstName, SUM(results.score) as sum FROM results JOIN users ON results.userId = users.id GROUP BY users.firstName"
      )
      .spread(function(results1, metadata) {
        // Results will be resulting array and metadata will contain the number of affected rows.
        // console.log("data1 from database");
        // console.log(results1);
        // console.log(metadata);
        return callback(results1);
      });
}

  // Sends Individual Scores to html file
  app.get("/userscore", function(req, res) {
    getData(function(rows1) {
      // console.log("data1 to be sent");
      // console.log(rows1);
      res.json(rows1);
    });
  });

  // Function to collect data for SECOND Graph
  function getData2(callback) {
    sequelize
      .query(
        "SELECT quizzes.id, SUM(results.score) as sum FROM results JOIN quizzes ON results.quizId = quizzes.id GROUP BY quizzes.id"
      )
      .spread(function(results2, metadata) {
        // Results will be resulting array and metadata will contain the number of affected rows.
        // console.log("data1 from database");
        // console.log(results2);
        // console.log(metadata);
        return callback(results2);
      });
  }

  // Sends Test Values to html file
  app.get("/quizscore", function(req, res) {
    getData2(function(rows2) {
      // console.log("data2 to be sent");
      // console.log(rows2);
      res.json(rows2);
    });
  });

  // Function to collect data for the first TABLE
  function getData3(callback) {
    db.user.findAll({
      include: [{ model: db.result}],
      // include: [{ model: db.quiz}]
    }).then(res=>callback(res))
  }

    // Sends Individual Scores to html file
  app.get("/userincorrect", function(req, res) {
    getData3(function(rows3) {
      console.log("data3 to be sent");
      console.log(rows3);
      res.json(rows3);  
    });
  });

}

