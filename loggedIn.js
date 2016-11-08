var variables = require('./variables'),
    playGame = require('./playGame'),
    friends = require('./friends');

exports.startingMenu = function(key){
    ctx.clear();
    
    ctx.point(42, 0, li_MenuOptions[li_MenuIndex] /*+ key.name + 
              (li_MenuIndex <li_MenuOptions.length - 1)*/);
     
    if(key.name == 'return'){
        li_MenuChosenOption = li_MenuOptions[li_MenuIndex];
        currentModeState = li_MenuChosenOption;
    }
    else if(li_MenuChosenOption =='Starting Menu' &&
            key.name == 'up' && li_MenuIndex > 0)
        li_MenuIndex-=1;
    else if(li_MenuChosenOption == 'Starting Menu' &&
            key.name == 'down' && li_MenuIndex < li_MenuOptions.length - 1)
        li_MenuIndex+=1;
    
    else if(key.name == 'escape' )
        li_MenuChosenOption = 'Starting Menu';
    
    if(li_MenuChosenOption == 'Friends')
         friends.friendsMenu(key);
    else if(li_MenuChosenOption == 'Play Game')
        playGame.initializePlayGame(key);
    
    else{
        ctx.point(0, 10, 'Friends');
        ctx.point(0, 11, 'Play Game');
    }
}