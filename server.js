var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/login', function (req, res) {
  const txtUserName = req.body.txtUserName;
  const password = req.body.password;
  const recaptchaResponse = req.body['g-recaptcha-response']; // Captcha response sent from the client
  console.log(recaptchaResponse);

  // Validate the reCAPTCHA response
  if (!recaptchaResponse) {
    return res.status(401).send('reCAPTCHA verification failed.');
  } 

  var sql = require("mssql");

  // config for your database
  var config = {
    user: "ctdev",
    password: "qscdf!@#s@#$4",
    server: "182.71.137.235",
    database: "cttest",
    port: 12226,
    dialect: "mssql",

    dialectOptions: {
      instanceName: "SQLEXPRESS",
    },
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };

  // connect to your database
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to the database.');
    }

    // create Request object
    var request = new sql.Request();

    // query to the database and get the EMP_ID for the entered txtUserName
    request.query(`SELECT EMP_ID FROM Employee WHERE txtUserName = '${txtUserName}'`, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send('Error querying the database.');
      }

      if (recordset.recordset.length === 0) {
        return res.status(401).send('Invalid txtUserName.');
      }

      const EMP_ID = recordset.recordset[0].EMP_ID;

      // pass EMP_ID and password to udf_ValidatePassword for validation
      request.query(`SELECT dbo.udf_ValidatePassword(${EMP_ID}, '${password}') AS PasswordValidated`, function (err, recordset) {
        if (err) {
          console.log(err);
          return res.status(500).send('Error querying the database.');
        }

        const passwordValidated = recordset.recordset[0].PasswordValidated;

        if (passwordValidated === 1) {
          return res.status(200).send('Login successful.');
        } else {
          return res.status(401).send('Invalid password.');
        }
      });
    });
  });
});

var server = app.listen(5000, function () {
  console.log("Server is running on http://localhost:5000");
});
