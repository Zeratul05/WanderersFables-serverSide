var variables = require('./variables'),
    register = require('./register'),
    logIn = require('./logIn'),
    loggedIn = require('./loggedIn');

keypress(process.stdin);

if(process.stdin.setRawMode)
    process.stdin.setRawMode(true);

//Keyboard input
process.stdin.on('keypress', function(c, key) {
    main(key);
    if(key && key.ctrl && key.name == 'c') 
        process.stdin.pause();
});


function main(key){
    ctx.clear();
    
    ctx.point(0, 1, mainMenuOptions[mainMenuIndex]);
    if(currentModeState!='Starting Menu'&&currentModeState!='Play Game' &&
      currentModeState != 'Friends')
        ctx.point(42, 0, currentModeState);
    
    if(currentModeState == 'Menu' && key.name == 'up' && mainMenuIndex > 0)
        mainMenuIndex-=1;
    else if(currentModeState == 'Menu' &&
            key.name=='down'&& mainMenuIndex < mainMenuOptions.length - 1)
        mainMenuIndex+=1;

    else if(currentModeState == 'Menu' && key.name == 'return')
        currentModeState = mainMenuOptions[mainMenuIndex];
    
    if(currentModeState == 'Register')
        register.register(key);
    else if(currentModeState == 'Login')
        logIn.logIn(key);
    else if(currentModeState == 'Starting Menu')
        loggedIn.startingMenu(key);
    
    else{
        ctx.point(0, 10, 'Register');
        ctx.point(0, 11, 'Login');
    }
}