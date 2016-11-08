var variables = require('./variables'),
    friendProfile = require('./friendProfile');
// -42 is the not the answer to the universe but it is the variable for making friend of fr_index 

exports.friendsMenu = function(key){
    ctx.clear();
    
    
    if(currentModeState == 'Friends'){
        if(fr_Index != -1)
            ctx.point(0,0, 'Cursor on: ' + userFriends[fr_Index]);
        else
            ctx.point(0, 0, 'Cursor on: Send friend request');
    }
    
    else if(currentModeState == 'friendProfile'){
        friendProfile.showProfile(userFriends[fr_Index], key);
        if(currentModeState == 'friendProfile')
            return;
    }
    
    var i,
        length = userFriends.length;
    
    ctx.point(0, 4, 'Send friend request');
    for(i = 0; i < length; i+=1)
        ctx.point(0, 5 + i, userFriends[i]);
    
    if(key.name == 'up' && fr_Index >= 0)
        fr_Index-=1;
    else if(key.name == 'down' && fr_Index < userFriends.length - 1)
        fr_Index+=1;
    else if(key.name == 'return'){
            if(fr_Index != -1){
                friendProfile.showProfile(userFriends[fr_Index], key);
                currentModeState = 'showProfile';
            }
    }
}