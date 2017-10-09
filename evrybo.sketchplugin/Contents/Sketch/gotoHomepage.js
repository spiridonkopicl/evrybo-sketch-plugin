var onRun = function(context) {
    if(![[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:"http://evrybo.com"]]){
        log('[ERROR] Error opening homepage')
    }else {
        log('[INFO] Go to Evrybo homepage')
    }
};

