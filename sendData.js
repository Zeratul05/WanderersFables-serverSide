var express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http'),
    request = require('request'),
    bodyParser = require('body-parser'),
    toString = Object.prototype.toString(),
    data = undefined;

function main(){
    
    app.post('/about', function(req, res){
        res.send('mda');
        console.log('asd');
    });
    
    app.get('/about', function(req, res){
        res.send('hello world');
    });
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