var express = require('express'),
    fs = require('fs'),
    request = require('request'),
    bodyParser = require('body-parser');

function main(){
    
    /*var options = {
        uri: 'http://localhost:1234/',
        method: 'POST',
        json: {
            "username": "alexei",
            "password": "stutka",
            "secretQuestion": "theShiniest"
        }
    };
        
    console.log(options.method);
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
            console.log(body) // Print the shortened url.
        else if(error)
            console.log(error);
    });*/     
    request.get('http://localhost:1234/', function(error, response, body){
        if(!error && response.statusCode == 200)
            console.log(JSON.parse(body)['mama-Profile']);
    });
}

main();