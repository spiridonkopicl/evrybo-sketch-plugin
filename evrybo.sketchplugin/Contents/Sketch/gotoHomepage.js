var onRun = function(context) {
    if(![[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:"http://evrybo.com"]]){
        log('[ERROR][evrybo] Error opening homepage')
    }else {
        log('[INFO][evrybo] Go to Evrybo homepage')
    }
};

