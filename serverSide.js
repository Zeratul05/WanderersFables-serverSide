var fs = require('fs'),
    http = require('http'),
    request = require('request'),
    util = require('util'),
    express = require('express'),
    app = express(),
    router = express.Router();

function main(){
 var server = http.createServer(function(req, res){
        var headers  = req.headers,
            method = req.method,
            url = req.url,
            body = [],
            database = fs.readFileSync('betaDummy.JSON'),
            dbContent = JSON.parse(database),
            charactersDb = fs.readFileSync('characters.json'),
            characters = JSON.parse(charactersDb),
            decksDb = fs.readFileSync('decks.json'),
            decks = JSON.parse(decksDb);
          /*  playGameQueueDb = fs.readFileSync('playGameQueue.json'),
            playGameQueue = JSON.parse(playGameQueueDb);
        */
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

            console.log(method);

            
            if(method == 'POST'){
                var jsonBody = JSON.parse(body);
        
                console.log(JSON.stringify(jsonBody));
                if(jsonBody.username){
                    dbContent['secretQuestion'].push(jsonBody.secretQuestion);
                    dbContent['username'].push(jsonBody.username);
                    dbContent['password'].push(jsonBody.password);
                    var userId;

                    while(!userId || dbContent[jsonBody.username + '#' + userId]){
                         userId = 
                             Math.round(Math.random()* 9) +
                             Math.round(Math.random()* 9) * 10 + 
                             Math.round(Math.random()* 9) * 100 + 
                             Math.round(Math.random()* 9) * 1000;
                    }
                    
                    dbContent['uid'].push(userId);
                    dbContent[jsonBody.username + '#' + userId] = 
                        {friends:[], requestsFrom:[], level:0, wins:0, state:"offline"};
                    characters[jsonBody.owner + jsonBody.ownerID] = [];
                    decks[jsonBody.owner + jsonBody.ownerID] = [];
                }
                
                else if(jsonBody.reciever){
                    var requesterIndex = 
                        findElement(dbContent[jsonBody.reciever]['requestsFrom'],
                                    jsonBody.requester + jsonBody.requesterID);
                    if(requesterIndex == -1)
                        dbContent[jsonBody.reciever]['requestsFrom']
                            .push(jsonBody.requester+ jsonBody.requesterID);
                    console.log(dbContent[jsonBody.reciever] + jsonBody.requesterID);
                }
                
                else if(jsonBody.concordant){
                    var chatDb = dbContent['chat'],
                    nameAt = findElement(
                            dbContent[jsonBody.concordant]
                            ['requestsFrom'], jsonBody.requester);
                    dbContent[jsonBody.concordant].requestsFrom.splice(nameAt, 1);
                    dbContent[jsonBody.concordant].friends.push(jsonBody.requester);
                    dbContent[jsonBody.requester].friends.push(jsonBody.concordant);
                    chatDb[jsonBody.requester + '-' 
                           + jsonBody.concordant] = [];
                }
                
                else if(jsonBody.stateValue){
                    var userProfile = dbContent[jsonBody.user + jsonBody.userID];
                    console.log(userProfile);
                    userProfile['state'] = jsonBody.stateValue;
                }
                
                else if(jsonBody.message){
                    var chatDb = dbContent['chat'];
                       // chatWindow = ;
                   
                    console.log('1)' + jsonBody.sender +jsonBody.senderID + '-' + 
                                jsonBody.deliverTo);
                    console.log('2)' + jsonBody.deliverTo + '-' + jsonBody.sender+ 
                                jsonBody.senderID);
                    if(!chatDb[jsonBody.sender + jsonBody.senderID + '-' +
                               jsonBody.deliverTo]){
                        
                        chatDb[jsonBody.deliverTo+ '-' +
                               jsonBody.sender +jsonBody.senderID]
                            .push(jsonBody.sender + ': ' + jsonBody.message);
                    }
                    
                    else{
                        chatDb[jsonBody.sender+ jsonBody.senderID + '-' + jsonBody.deliverTo]
                            .push(jsonBody.sender + ': ' + jsonBody.message);
                    }
                }
                
                else if(jsonBody.character){
                    characters[jsonBody.owner + jsonBody.ownerID].push({
                        name:jsonBody.character,level:jsonBody.level, exp:jsonBody.exp, 
                        class: jsonBody.class,spells:jsonBody.spells});
                }
                
                else if(jsonBody.deck)
                     decks[jsonBody.owner + jsonBody.ownerID].push(jsonBody.deck); 
                
                else if(jsonBody.signedFor){
                    if(jsonBody.signedFor == 'Play Game')
                        playGameQueue[jsonBody.user + jsonBody.userID] = {};
                }
            }
            
            else
                body = dbContent;
            
            console.log(req.url);
            
            if(req.url == '/character')
                res.write(JSON.stringify(characters));
            else if(req.url == '/decks')
                res.write(JSON.stringify(decks));
            else
                res.write(JSON.stringify(dbContent));
            
            res.end();
            fs.writeFileSync('betaDummy.json', JSON.stringify(dbContent));
            fs.writeFileSync('characters.json', JSON.stringify(characters));
            fs.writeFileSync('decks.json', JSON.stringify(decks));
        });
    }).listen(1234); 
    
    var io = require('socket.io')(server);
    
    io.on('connection', function (socket){
        var database = JSON.parse(fs.readFileSync('betaDummy.JSON')),
            decks = JSON.parse(fs.readFileSync('decks.JSON')),
            characters = JSON.parse(fs.readFileSync('characters.json')),
            queuedFor = JSON.parse(fs.readFileSync('queuedFor.json'));
        console.log('connection');
        
        var isLoggedIn;
        
        socket.on('LogIn', function(data){
            var userId = '#' + database['uid']                  
            [findElement(database['username'],data.username)];
            
            if(findElement(database['username'], data.username) == 
               findElement(database['password'], data.password))
                isLoggedIn = true;
         
            if(!isLoggedIn)
                return;
                
           database[data.username+userId]['state']=
               database[data.username+userId]['lastState'];
            
            socket.emit('LoggedState', {state:database[data.username+userId]['lastState']});
            socket.emit('LogConfirm', {isLogged: isLoggedIn});
            socket.emit('UserID', 
                        {userID: userId});
            socket.emit('UserData', {profile: database[data.username+userId]});
            console.log(data.username+userId);
            socket.emit('Characters', {chars: characters[data.username+userId]});
            socket.emit('Decks', {createdDecks: decks[data.username+userId]});
            
            fs.writeFile('betaDummy.json', JSON.stringify(database));
        });
                
        socket.on('Register', function(data){
            database['username'].push(data.username);
            database['password'].push(data.password);
            database['secretQuestion'].push(data.secretQuestion);          
            var userId;
                   
            while(!userId || database[data.username + '#' + userId]){
                    userId = 
                        Math.round(Math.random()* 9) +
                        Math.round(Math.random()* 9) * 10 + 
                        Math.round(Math.random()* 9) * 100 + 
                        Math.round(Math.random()* 9) * 1000;
            }
               
            database['uid'].push(userId);
            database[data.username + '#' + userId] = 
                {friends:[], requestsFrom:[], level:0, wins:0, state:"offline", lastState:''};
            characters[data.username + userId] = [];
            decks[data.username + userId] = [];
            fs.writeFile('betaDummy.json', JSON.stringify(database));
            fs.writeFile('decks.json', JSON.stringify(decks));
            fs.writeFile('characters.json', JSON.stringify(characters));
        });
        
        socket.on('CreatedDeck', function(data){
            decks[data.username+data.userID]
                .push({name: data.deckName, deck: data.deck, isUsable: data.isUsable});
            fs.writeFile('decks.json', JSON.stringify(decks));
        });
        
        socket.on('CH01', function(from, msg){
            console.log('MSG', from, ' saying ' , msg);
        });
        
        socket.on('CreatedCharacters', function(data){
            characters[data.username+data.userID]
                .push({name:data.name, level:data.level,exp:data.exp,class:data.class, 
                       spells:data.spells});
            fs.writeFile('characters.json', JSON.stringify(characters));
        });
        
        socket.on('SendMessage', function(data){
           var chatDb = database['chat'],
               chatHeading = data.sender + data.senderID + '-' + data.deliverTo;
            
           console.log('1)' + data.sender +data.senderID + '-' + 
                       data.deliverTo);
           console.log('2)' + data.deliverTo + '-' + data.sender+ 
                       data.senderID);
            
           if(!chatDb[chatHeading]){
               chatHeading =data.deliverTo+ '-' +data.sender +data.senderID; 
               chatDb[chatHeading].push(data.sender + ': ' + data.message);
           }
            
           else{
               chatDb[chatHeading]
                   .push(data.sender+': ' + data.message);
           }
            
            socket.emit('AllChats', {chat:chatDb[chatHeading]});
        });
        
        socket.on('RequestFriendProfile', function(data){
            console.log(database[data.friend]);
            socket.emit('FriendProfile', {friendProfile:database[data.friend]});
        });
        
        socket.on('SendFriendRequest', function(data){
          if(findElement(database[data.reciever]['requestsFrom'], data.username+data.userID)){
            database[data.reciever]['requestsFrom'].push(data.username+data.userID);
            fs.writeFile('betaDummy.json', JSON.stringify(database));
          }
        });
        
        socket.on('AcceptFriendRequest', function(data){
            var nameAt = findElement(database[data.concordant]
                                     ['requestsFrom'], data.requester);
             database[data.concordant]['requestsFrom'].splice(nameAt, 1);
             database[data.concordant]['friends'].push(data.requester);
             database[data.requester]['friends'].push(data.concordant);
             database['chat'][data.requester + '-' + data.concordant] = [];
            console.log(data.requester+'-'+data.concordant);
            
            fs.writeFile('betaDummy.json', JSON.stringify(database));
        });
        
        socket.on('ChangeState', function(data){
            database[data.username+data.userID]['state']=data.state;
            fs.writeFile('betaDummy.json', JSON.stringify(database));
        });
        
        socket.on('StateLoggedOut', function(data){
            database[data.username+data.userID]['state']= 'offline';
            database[data.username+data.userID]['lastState'] = data.state;
            
            fs.writeFile('betaDummy.json', JSON.stringify(database));
        });
        
        //play Game
        socket.on('QueuePlayGame', function(data){
            queuedFor['playGame'].push(data.username+data.userID);
            var isOpponentFound = false;
            
            socket.emit('matchFound',{isFound: isOpponentFound});
            
            fs.writeFile('queuedFor.json', JSON.stringify(queuedFor));
        });
    });
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