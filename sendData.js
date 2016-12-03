var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    request = require('request'),
    bodyParser = require('body-parser'),
    toString = Object.prototype.toString(),
    data = undefined;

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
            console.log(JSON.parse(body)[0]);
    });
    
   // var data = undefined;
    /*
    var options = {
        hostname: 'localhost',
        port: '1234',
        path: '/',
        agent: false,
    }; 
    
    http.get(options, function(res){
        body = [];
        res.on('data', function(chunk){
            body.push(chunk);
            body = Buffer.concat(body).toString();
            body = JSON.parse(body);
            data = JSON.parse(JSON.stringify(body));
            console.log(data['mama-Profile']['friends'].length);
        });
    });*/
 var obj = {a: "hello", c: "test", po: 33, arr: [1, 2, 3, 4], anotherObj: {a: 33, str: "whazzup", array: [1,2,3,4]}};
var obj2 = JSON.parse(JSON.stringify(obj));
//console.log(obj2['anotherObj'].array.length);   
}

function deepCopy(obj){
    var rv;
    
    switch(typeof obj){
            case"object":
                if(obj == null)
                    rv = null;
                else{
                    switch(obj.toString()){
                            case"[object Array]":
                                rv = obj.map(deepCopy);
                                break;
                            default:
                                rv = Object.keys(obj).reduce(function(prev, key){
                                    prev[key]= deepCopy(obj[key]);
                                    return prev;
                                }, {});
                            break;
                    }
                }
                break;
        default:
            rv = obj;
            break;
    }
    return rv;
}

main();