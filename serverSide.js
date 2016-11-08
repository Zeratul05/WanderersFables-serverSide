var fs = require('fs'),
    http = require('http'),
    request = require('request'),
    formidable = require('formidable'),
    util = require('util'),
    msg = [];

    msg['longUrl'] = '';
    msg['mama'] = '';

function main(){
    
    http.createServer(function(req, res){
        var headers  = req.headers,
            method = req.method,
            url = req.url,
            body = [],
            database = fs.readFileSync('betaDummy.JSON'),
            dbContent = JSON.parse(database);
        
        req.on('error', function(err){
            console.error(err);
        }).on('data', function(chunk){
            body.push(chunk);
            
        }).on('end', function(){
            body = Buffer.concat(body).toString();
        
            res.on('error', function(err) {
                console.error(err);
            });
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            
            if(method == 'POST'){
                console.log('POST');
                var jsonBody = JSON.parse(body);
                dbContent['secretQuestion'] += jsonBody.secretQuestion + ',';
                dbContent['username'] += jsonBody.username + ',';
                dbContent['password'] += jsonBody.password + ',';
            }
            
            else
                body = dbContent;
            
            var responseBody = {
                headers: headers,
                method: method,
                url: url,
                body: dbContent
            };
            
            res.write(JSON.stringify(responseBody.body));
            res.end();
            fs.writeFileSync('betaDummy.json', JSON.stringify(dbContent));
        });
        /*
        if(method == 'GET')
            displayForm(res);
        else if(method == 'POST')
            processFormFieldsIndividual(req, res);*/
    }).listen(1234); 
    
    console.log('Server is running on port 1234');
}

function displayForm(res){
    fs.readFile('form.html', function(err, data){
        res.writeHead(200, {
            'Content-Type':'text/html',
            'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

var fields = [];
    fields['name'] = '';
    fields['email'] = '';
    fields['description'] = '';

function processFormFieldsIndividual(req, res){
    var form = new formidable.IncomingForm();
    form.on('field', function(field, value){
        console.log(field + ': ' + value);
        fields[field] += value + ',';
    });
    
    form.on('end', function(){
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('recieved the data:\n\n');
        res.end(util.inspect({
            fields:fields
        }));
    });
    form.parse(req);
}

function processAllFieldsOfTheForm(req, res){
    var form = new formidable.IncomingForm();
    
    form.parse(req, function(err, fields, files){
        res.writeHead(200, {
            'Content-type': 'text/plain'
        });
        res.write('recieved the data: \n\n');
        res.end(util.inspect({
            fields: fields,
            files:files
        }));
    });
}

main();