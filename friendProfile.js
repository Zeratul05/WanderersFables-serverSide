// import
var variables = require('./variables');

exports.showProfile = function(friendName, key){
    ctx.clear();
    
    ctx.point(0, 0, 'Profile of ' + friendName);
    
    if(key.name == 'escape')
        currentModeState = 'Friends';
}