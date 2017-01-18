var fs = require('fs'),
    http = require('http'),
    crypto=require('crypto'),
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
                        spells:jsonBody.spells});
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
    var database = JSON.parse(fs.readFileSync('betaDummy.JSON'));
    var decks = JSON.parse(fs.readFileSync('decks.JSON'));
    var characters = JSON.parse(fs.readFileSync('characters.json'));
    var playGame = [];
    var inGame=[];
    
    io.on('connection', function (socket){
        console.log('connection');
        
        socket.emit('pong');
        
        var isLoggedIn;
        
        socket.on('LogIn', function(data){
            var emailIndex =findElement(database['email'],data.email),
                emailPassword = database['password'][emailIndex],
                username = database['username'][emailIndex];
            
            // the email does not exist return login has failed
            if(emailIndex == undefined){
                console.log(data.email + ' - ' + emailIndex);
                socket.emit('LogConfirm', {isLoggedIn: isLoggedIn});
                return;
            }
            
            crypto.pbkdf2(data.password,emailPassword.salt,
                               emailPassword.iterations, 512, 'sha512',
                              function(err, key){
                if(key.toString('hex') == emailPassword.hash){
                    isLoggedIn = true;
                    console.log('treeasi');
                    var userId = '#' + database['uid'][emailIndex];
                
                    database[username+userId]['state']=
                        database[username+userId]['lastState'];
            
                    socket.emit('LogConfirm', {isLogged: isLoggedIn});
                    socket.emit('userData', 
                                {state:database[username+userId]['lastState'],
                                username: username, userID: userId,
                                 profile: database[username+userId],
                                 chars: characters[username+userId],
                                 createdDecks: decks[username+userId]});
                }
                
                else{
                    socket.emit('LogConfirm', {isLogged: isLoggedIn});
                }
            });
            
            if(!isLoggedIn){       
                return;
            }
        });
                
        socket.on('Register', function(data){
            var emailIndex =findElement(database['email'],data.email); 
            
            // check if email already exists if it does register has failed
            if(emailIndex || emailIndex == 0){//because 0 is false 
               socket.emit('registerFailed', {});
                return;
            }
            // 1) generate the salt
            // 2) decide how much iterations the new hash is
            // 3) save the salt, iterations and the created hash
            var salt = crypto.randomBytes(128).toString('base64');
            var iterations = 10000;
            crypto.pbkdf2(data.password, salt,iterations,512, 'sha512', 
                          function(err, key){
                if(err)
                    throw err;
                database['password'].push({salt:salt,iterations:iterations,
                                           hash:key.toString('hex')});
            }); 
            
            database['email'].push(data.email);
            database['username'].push(data.username);
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
            database[data.username + '#' + userId] = {friends:[], requestsFrom:[], 
                                            level:0, wins:0, state:'offline',lastState:''};
            characters[data.username + '#'+ userId] = [];
            decks[data.username + '#'+ userId] = [];
            console.log(data.email + ' EM_PAS ' + data.password);
        });
        
        socket.on('updateUserData', function(data){
            socket.emit('newUserData', {profile:database[data.username+data.userID]});
        });
        
        socket.on('CreatedDeck', function(data){
            decks[data.username+data.userID]
                .push({name: data.deckName, deck: data.deck, isUsable: data.isUsable});
        });
        
        socket.on('CH01', function(from, msg){
            console.log('MSG', from, ' saying ' , msg);
        });
        
        socket.on('CreatedCharacters', function(data){
            console.log(data.username + ' ' + data.userID);    
            
            characters[data.username+data.userID]
                .push({name:data.name,level:data.level,exp:data.exp, spells:data.spells});
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
        var hasAlreadySent = findElement(database[data.reciever]['requestsFrom'],   
                                         data.username+data.userID);
            
          if(!hasAlreadySent && hasAlreadySent != 0){
              database[data.reciever]['requestsFrom'].push(data.username+data.userID);
          }
        });
        
        socket.on('AcceptFriendRequest', function(data){
            var nameAt = findElement(database[data.concordant]
                                     ['requestsFrom'], data.requester);
             database[data.concordant]['requestsFrom'].splice(nameAt, 1);
             database[data.concordant]['friends'].push(data.requester);
             database[data.requester]['friends'].push(data.concordant);
             database['chat'][data.requester + '-' + data.concordant] = [];    
        });
        
        socket.on('ChangeState', function(data){
            database[data.username+data.userID]['state']=data.state;
        });
        
        socket.on('StateLoggedOut', function(data){
            
            database[data.username+data.userID]['state']= 'offline';
            database[data.username+data.userID]['lastState'] = data.state;
        });
        
        //play Game
        socket.on('QueuePlayGame', function(data){
            //add the player to the queue and after an interval search for an opponent
            playGame.push(data.username+data.userID);
            
            setInterval(function(){    
                var isOpponentFound = false,
                    length = playGame.length,
                    user = data.username+data.userID,
                    queueIndex = findElement(playGame, 
                                             data.username+data.userID);
                                       
                console.log(queueIndex);
                    if(queueIndex == undefined){
                        for(var i = 0; i<inGame.length; i+=1){
                            if(inGame[i][0] == user || 
                               inGame[i][1] == user){
                                isOpponentFound = true;
                                console.log(user);
                            }
                        }
                    }
                
                    else if(length == 1){
                        isOpponentFound = false;
                        playGame.pop();
                    }
                    
                    else if(length > 1){
                        isOpponentFound = true;
                        var p1Data = {playerFieldsVectors:['','','','','',''],
                                         playerCardsVectors:[],
                                         characterClass:'',
                                         deck:[]
                                     },
                            p2Data = {playerFieldsVectors:['','','','','',''],
                                         playerCardsVectors:[],
                                         characterClass:'',
                                         deck:[]
                                     };
                                
                        var coinFlip = Math.round(Math.random() * 100);
                        if(coinFlip > 50){
                            inGame.push([playGame[queueIndex+1],user,
                             p1Data,p2Data,true,{defender:-1, defenderFieldName:'',
                            attacker:-1}, {cardCan:'',onField:NaN, onIndex:NaN},
                            {markedCursor:'',cursorPosition:-1,
                             character:undefined, spellIndex:-1}]);
                        }   
                        
                        // true stands for playerOne is on turn
                        else{
                             inGame.push([user,playGame[queueIndex+1], p1Data,p2Data,true,
                                          {defender:'', defenderFieldName:'',
                             attacker:''},{cardCan:'',onField:NaN, onIndex:NaN, 
                                           changingFieldIndex:NaN},
                                          {markedCursor:'',cursorPosition:-1,
                                          character:undefined, spellIndex:-1}]);
                        }
                        playGame.splice(queueIndex, 2);
                    }
                
                socket.emit('matchFound',{isFound: isOpponentFound});
                clearInterval(this);
            }, 10000);
            
            socket.on('initGame', function(data){
                var index={gameOrder:undefined,player:undefined},
                    user = data.username+data.userID;
                
                for(var i = 0; i < inGame.length; i+=1){
                    if(inGame[i][0] == user){
                        index.gameOrder = i;
                        index.player = 0;
                        break;
                    }
                    
                    else if(inGame[i][1] == user){
                        index.gameOrder = i;
                        index.player = 1;
                        break;
                    }
                }
                inGame[index.gameOrder][index.player+2]
                                                ['characterClass'] = data.characterClass;
                inGame[index.gameOrder][index.player+2]['deck'] = data.deck;
                socket.emit('placement', {gameOrder:index.gameOrder,player:index.player});
            });
        });
        
        var isChanged;
        // read the gameDatas, find playerData and add his card
        socket.on('spawnCard', function(data){
            isChanged = true;
            var currentGame = inGame[data.gameOrder][data.playerIndex+2];
                
            currentGame.playerFieldsVectors[data.fieldIndex] = data.cardName;
        });
        
        socket.on('battle', function(data){
            isChanged = true;
            var currentGame = inGame[data.gameOrder];
            currentGame[5].defender = data.defenderField;
            currentGame[5].attacker = data.attackerField;
            currentGame[5].defenderFieldName = data.defenderFieldName;
            console.log(currentGame[5]);
          });
        socket.on('spellCasted', function(data){
            var currentGame = inGame[data.gameOrder];
            currentGame[7].markedCursor=data.markedCursor;
            currentGame[7].character=data.character;
            currentGame[7].cursorPosition=data.cursorPosition;
            currentGame[7].spellIndex =data.spellIndex;
            console.log(currentGame[7]);
            isChanged = true;
        });
        socket.on('cardCan', function(data){
            isChanged = true;
            var currentGame = inGame[data.gameOrder];
            currentGame[6].cardCan = data.cardCan;
            currentGame[6].onField = data.onField;
            currentGame[6].onIndex = data.onIndex;
            currentGame[6].changingFieldIndex = data.changingFieldIndex;
            console.log(currentGame[6]);
        });
        
        socket.on('enemyFields', function(data){
            console.log(data.vector +  ' ' + inGame[data.gameOrder][data.playerIndex]);
        });
        
        //find enemyData and send his field
        socket.on('playerRequestData', function(data, fn){
            var currentGame = inGame[data.gameOrder];
            
            var enemyData;
            if(data.playerIndex == 0)
                enemyData = 3;
            else
                enemyData = 2;
           
            socket.emit('battleReport'+currentGame[data.playerIndex],{
                enemyFields:currentGame[enemyData].playerFieldsVectors, // spawnedNewCard
                cardCan:currentGame[6].cardCan,
                onField:currentGame[6].onField, // card special thing
                onIndex:currentGame[6].onIndex,
                changingFieldIndex:currentGame[6].changingFieldIndex,
                defenderField:currentGame[5].defender,  // battle
                defenderFieldName: currentGame[5].defenderFieldName, 
                attackerField:currentGame[5].attacker,
                markedCursor:currentGame[7].markedCursor, // spell casted
                cursorPosition:currentGame[7].cursorPosition,
                character:currentGame[7].character,
                spellIndex:currentGame[7].spellIndex}, function(confirmation){
                currentGame[3].playerFieldsVectors=['','','','','',''];
                currentGame[2].playerFieldsVectors=['','','','','',''];
                
                currentGame[7].markedCursor='';
                currentGame[7].character=undefined;
                currentGame[7].cursorPosition=-1;
                currentGame[7].spellIndex = -1;
                currentGame[6].cardCan = '';
                currentGame[6].onField = '';
                currentGame[6].onIndex = NaN;
                currentGame[6].changingFieldIndex = NaN;
                currentGame[5] = {defender:NaN, defenderFieldName:'',attacker:NaN};
            }); 
        });
        // add ended Player data and get game[4](isPlayer's one turn)
        socket.on('endTurn', function(data){ 
            var currentGame = inGame[data.gameOrder];
            
            if(data.playerIndex == 0)
                currentGame[4]=false;
            else
                currentGame[4]=true;
         
            currentGame[data.playerIndex+2].playerTauntsOfFiled=data.playerTauntsOfFiled;
            currentGame[data.playerIndex+2].playerCardsVectors=data.playerCardsVectors;        
        });
        // recieve ended player data
        socket.on('requestStartTurn', function(data){
            var currentGame = inGame[data.gameOrder]; 
            var enemyData;
            
            if(data.playerIndex == 0)
                enemyData = 3;
            else
                enemyData = 2;
           
            
            if((currentGame[4] && data.playerIndex == 0) ||
               (!currentGame[4] && data.playerIndex == 1))
                socket.emit('startTurn'+currentGame[data.playerIndex],
                          {attackedFromFields:currentGame[enemyData].attackedFromFields,                            playerCardsVectors:currentGame[enemyData].playerCardsVectors});
        });
        
        socket.on('disconnect', function(){
            fs.writeFileSync('betaDummy.json', JSON.stringify(database));
            fs.writeFileSync('decks.json', JSON.stringify(decks));
            fs.writeFileSync('characters.json', JSON.stringify(characters));
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