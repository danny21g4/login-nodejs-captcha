var express = require("express");
const http = require('http');
const url = require('url');
const fs = require('fs');
var app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));


// After the static files middleware
app.use(express.static('public'));

// Root route
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


  
app.post('/login', function (req, res) {
    const txtUserName = req.body.txtUserName; // Get the txtUserName from the login form
    const password = req.body.password; // Get the password from the login form
    const recaptchaResponse = req.body['g-recaptcha-response'];

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
                    return res.status(200).send('Login successful. 1');
                } else {
                    return res.status(401).send('Invalid password.');
                }
            });
        });
    });
});



// ... (remaining code for the application)

var server = app.listen(5000, function () {
  console.log("Server is running on http://localhost:5000");
});



// 


<script>
var onloadCallback = function () {
  // reCAPTCHA script loaded, do any initialization here if needed
};

function submitForm() {
  // Trigger reCAPTCHA verification
  grecaptcha.execute().then(function (token) {
    // Append reCAPTCHA token to the form data
    var form = document.querySelector('form');
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'g-recaptcha-response';
    input.value = token;
    form.appendChild(input);

    // Submit the form
    form.submit();
  });
}
</script>