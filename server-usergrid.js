var argo = require('argo');
var express = require('express');
var GitHubApi = require('github');

var app = express();
  	
var github = new GitHubApi({
  // required
  version: "3.0.0"
});


var proxy = argo()
    .target('https://api.usergrid.com')
    .build();

// This will be the default response for any unsupported responses.
app.all('/', function(req, res) {
    res.send('Client requesting invalid resource. Rejecting request...');
});


// Oauth is dealt with via Apigee policies. Utilizing native error message in event of failure.
app.get('/oauth', function(req, res) {
    res.send('Oauth request Successfully recieved');
  	
});

app.get('/basic', function(req, res) {
  	
 	// Get the authentication credentials from the request headers, store them
  	var authorization = req.header("Authorization");
  	var username = req.header("username");
  	var password = req.header("password");
  
  
  // If any of the fields are empty respond with an error message
  if(username == null || password == null || authorization == null) {
    	res.send("Missing credentials! Please enter all approprate information");
    	return;
  }
  
  // Check to see if the authorization matches the encoded client_id:client_secret
  if(authorization = "Basic c3lUWHBKdHBOTk9WbGZLb0N3OTFrdDVWbEtJdWNHZHc6REEwbkJnZTJnWkdlOUE1OA=="){
    
    // Give the github module the saved credentials
  	github.authenticate({
        type: "basic",
        username: username,
        password: password
    });
    
    
    // Pass the github response to the user if successful in authentication. Otherwise print error.
	github.user.get({ user: username} , function(err, githubResponse) {
      if(err == null) {
      	res.send(githubResponse); 
      } else {
      	res.send("Invalid github credentials... Please try again.");
      }
        // Again, forward the github response if given proper credentials. Otherwise print error
      	github.repos.getAll({}, function(err, githubResponse) {
          if(err == null) {
            res.send(githubResponse); 
          } else {
            res.send("Invalid github request... Please try again.");
          }

        });
    });  
  }
    else
      // Print error if given invalid basic authentication token
      res.send('Invalid basic authentication token...');
	
});


// Unsupported HTTP requests error
app.all('*', function(req, res) {
 	res.send('Unsupported HTTP request! We only support GET to both resources and POST to get OAuth Tokens!!!'); 
});

// This was here by default
app.all('*', proxy.run);


app.listen(3000);
