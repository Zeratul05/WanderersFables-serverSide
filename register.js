var variables = require('./variables');

exports.register = function(key){
    ctx.clear();
    
    ctx.point(0, 3, 'Enter an username: ' + username);
    ctx.point(0, 4, 'Enter a password: ' + password);

    if(!isUsernameSet){
        variables.enterUsername(key);
        
        if(isUsernameSet){
            var dbContent = JSON.parse(fs.readFileSync('alphaDummy.json'));
            
            var foundAt = variables.searchPattern(dbContent['username'], username);
                
            if(foundAt != -1){
                ctx.point(0, 2, 'The chosen username is taken');
                isUsernameSet = false;
                username = '';
            }
        }
    }
    
    else if(!isPasswordSet){
        variables.enterPassword(key);
        
        if(isPasswordSet){
            isUsernameSet = false;
            isPasswordSet = false;
            
            variables.postRequest();
            
            username = '';
            password = '';
            currentModeState = 'Menu';
        }
    }
}