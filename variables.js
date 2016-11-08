exports.
    // nodejs libraries
    http = require('http'),
    fs = require('fs'),
    request = require('request'),
    // third-party libries
    keypress = require('keypress'),
    ctx = require('axel'),
    // writing a field
    userProfile = [],
    userFriends = [],
    username = '',
    password = '',
    lastKey = 'return',
    publicDatabaseContent = [],
    isUsernameSet = false,
    isPasswordSet = false,
    hasRegistered = false,
    // main menu variables
    mainMenuIndex = 0,
    mainMenuOptions = ['Register', 'Login'],
    currentModeState = 'Menu',
    // loggedIn menu variables -> li - loggedIn
    li_MenuIndex = 0,
    li_MenuOptions = ['Friends', 'Play Game'],
    li_MenuChosenOption = 'Starting Menu',
    // loggedIn, friends
    fr_Index = 0;

exports.searchPattern = function(text, pattern){
    
    const R = 256;
    var right = [];
    
    for(var c = 0; c < R; c+=1)
        right.push(-1);
    
    for(var i = 0; i < pattern.length; i+=1)
        right[pattern[i]] = i;
    
    var foundAt = search(text, pattern, right);
    
    return foundAt;
}

function search(text, pattern, right){
    var textLength = text.length,
        patternLength = pattern.length,
        skip;
    
    for(var i = 0; i< textLength - patternLength; i+=1){
        skip = 0;
        
        for(var j = 0; j < patternLength; j+=1){
            if(pattern[j] != text[i+j]){
                skip = j - right[text[i+j]];
                
                if(skip < 1)
                    skip = 1;
                
                break;
            }
        }
        
        if(skip == 0)
            return i;
    }
    
    return -1;
}

exports.enterUsername = function(key){
    if(isUsernameSet || key.name == 'up' || key.name == 'down' ||
         key.name == 'right' || key.name == 'left' || key.name == 'space')
        return;

    if(key.name != 'return')
        username += key.name;
    else if(key.name == 'return' && lastKey != 'return')
        isUsernameSet = true;

    lastKey = key.name;
}

// the body is parsed
exports.getRequest = function(){
    request.get('http://localhost:1234/', function(error, response, body){
         if(!error && response.statusCode == 200){
            fs.writeFileSync('alphaDummy.json', body)
         }
         else if(error)
             console.error(error);
     });
}
               
exports.postRequest = function(){
    var options = {
        uri: 'http://localhost:1234/',
        method: 'POST',
        json: {
            "username": username,
            "password": password,
            "secretQuestion": "theShiniest"
        }
    };
        
    console.log(options.method);
    
    request(options, function (error, response, body) {
        /*if (!error && response.statusCode == 200)
            console.log(body) // Print the shortened url.*/
        if(error)
            console.log(error);
    });
}

exports.enterPassword = function(key){
    
    if(isPasswordSet || key.name == 'up' || key.name == 'down' ||
         key.name == 'right' || key.name == 'left' || key.name == 'space')
        return;

    if(key.name != 'return')
        password += key.name;

    else if(key.name == 'return' && lastKey != 'return')
        isPasswordSet = true;

    lastKey = key.name;
}