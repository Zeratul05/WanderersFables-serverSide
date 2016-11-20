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
        
                console.log(JSON.stringify(jsonBody));
                if(jsonBody.username){
                    dbContent['secretQuestion'].push(jsonBody.secretQuestion);
                    dbContent['username'].push(jsonBody.username);
                    dbContent['password'].push(jsonBody.password);
                    dbContent[jsonBody.username + '-Profile'] = 
                        {friends:[], requestsFrom:[], Level:0, Wins:0};
                }
                
                else if(jsonBody.reciever){
                    var recieverProfile = dbContent[jsonBody.reciever + '-Profile'],
                        requesterIndex = 
                        findElement(recieverProfile['requestsFrom'], jsonBody.requester);
                    if(requesterIndex == -1)
                        recieverProfile['requestsFrom'].push(jsonBody.requester);
                    console.log(recieverProfile);
                }
                
                else if(jsonBody.concordant){
                    var chatDb = dbContent['chat'],
                        concordantProfile = dbContent[jsonBody.concordant + '-Profile'],
                        requesterProfile = dbContent[jsonBody.requester + '-Profile'],
                        nameAt = 
                        findElement(concordantProfile['requestsFrom'], jsonBody.requester);
                    concordantProfile.requestsFrom.splice(nameAt, 1);
                    concordantProfile.friends.push(jsonBody.requester);
                    requesterProfile.friends.push(jsonBody.concordant);
                    chatDb[jsonBody.requester + '-' + jsonBody.concordant] = [];
                }
                
                else if(jsonBody.stateValue){
                    var userProfile = dbContent[jsonBody.user + '-Profile'];
                    userProfile['State'] = jsonBody.stateValue;
                }
                
                else if(jsonBody.message){
                    var chatDb = dbContent['chat'],
                        chatWindow = chatDb[jsonBody.sender + '-' + jsonBody.deliverTo];
                    if(!chatWindow)
                        chatWindow = chatDb[jsonBody.deliverTo + '-' + jsonBody.sender];
                    
                    chatWindow.push(jsonBody.sender + ': ' + jsonBody.message);
                    chatDb[jsonBody.sender + '-' + jsonBody.deliverTo] = chatWindow;
                }
                
                else if(jsonBody.deck){
                    var ownerProfile = dbContent[jsonBody.owner + '-Profile'];
                    ownerProfile['decks'].push(jsonBody.deck);
                }
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

function findElement(array, element){
    var i,
        length = array.length;
    
    for(i = 0; i < length; i+=1){
        if(array[i] == element)
            return i;
    }
    
    return -1;
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