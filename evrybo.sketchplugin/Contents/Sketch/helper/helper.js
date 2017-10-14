var helper = new Helper();

function Helper() {
    this.loginURL = "https://app.evrybo.com/api/v1/login";
    this.allProjectForUserURL = "https://app.evrybo.com/api/v1/projects/users";
    this.uplaodArtboardsForProjectURL = "https://app.evrybo.com/api/v1/projects";
    this.scriptPath = null;
    this.scriptPathRoot = null;
    this.scriptResourcesPath = null;
}

Helper.prototype.init = function (context) {
    this.scriptPath = context.scriptPath;
    this.scriptPathRoot = this.scriptPath.stringByDeletingLastPathComponent();
    this.scriptResourcesPath = this.scriptPathRoot.stringByDeletingLastPathComponent() + "/Resources";
}

Helper.prototype.hasArtboard = function (context) {
    var document = context.document,
        page = [document currentPage],
        artboards = [page artboards];
    if (!([artboards count] > 0)) {
        return false;
    }
    return true;
};

Helper.prototype.hasArtboardSelected = function (context) {
    var document = context.document,
        page = [document currentPage],
        artboards = [page artboards];
    var selectedArtboards = [[NSMutableArray alloc] init];
    var loop = [artboards objectEnumerator];
    while(artboard = [loop nextObject]) {
        if([artboard isSelected]) {
            selectedArtboards.addObject(artboard);
        }
    }
    if (!([selectedArtboards count] > 0)) {
        return false;
    }
    return true;
};


Helper.prototype.isLoggedIn = function(){
    var token = [[NSUserDefaults standardUserDefaults] objectForKey:"authentication"];
    if (token) {
        return true;
    } else {
        return false;
    }
};

Helper.prototype.saveSelectedProjectId = function (selectedProject) {
    [[NSUserDefaults standardUserDefaults] setObject:selectedProject.projectId forKey:"selectedProjectId"];
    [[NSUserDefaults standardUserDefaults] synchronize];
};

Helper.prototype.getSelectedProjectId = function () {
    var selectedProjectId = [[NSUserDefaults standardUserDefaults] objectForKey:"selectedProjectId"];
    return selectedProjectId;
};

Helper.prototype.getUserId = function () {
    var userId = [[NSUserDefaults standardUserDefaults] objectForKey:"user"];
    return userId;
};

Helper.prototype.getSavedToken = function () {
    var token = [[NSUserDefaults standardUserDefaults] objectForKey:"authentication"];
    return token;
};

Helper.prototype.removeCredentials = function () {
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:"authentication"];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:"user"];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:"selectedProjectId"];

    [[NSUserDefaults standardUserDefaults] synchronize];
};

Helper.prototype.saveUserIdAndToken = function (userId, token) {
    [[NSUserDefaults standardUserDefaults] setObject:token forKey:"authentication"];
    [[NSUserDefaults standardUserDefaults] setObject:userId forKey:"user"];
    [[NSUserDefaults standardUserDefaults] synchronize];
};

Helper.prototype.isDocumentSaved = function (context) {
    var document = context.document;
    if (![document fileURL] || [document isDocumentEdited]) {
        return false;
    }
    return true;
};

Helper.prototype.showNotification = function (context) {
    var document = context.document;
    var notification =  [[NSUserNotification alloc] init];
    notification.title = @"Evrybo";
    notification.subtitle = document.displayName();
    notification.informativeText = @"Artboard sync completed successfully";
    notification.soundName = NSUserNotificationDefaultSoundName;
    [[NSUserNotificationCenter defaultUserNotificationCenter] deliverNotification:notification];
}