@import 'MochaJSDelegate.js';
@import 'helper/helper.js';
@import 'service/service.js';
@import 'service/exporter.js';
@import 'model/project.js';

var controller = new Controller();
var projects = [[NSMutableArray alloc] init];

function Controller() {}

Controller.prototype.showAlertNoArtboardSelected = function () {
    var alert = NSAlert.alloc().init()
    alert.setMessageText("No artboard selected")
    alert.setInformativeText("Please select artboard in order to export it.")
    alert.addButtonWithTitle("OK")
    alert.runModal()
};

Controller.prototype.showAlertDocumentNotSaved = function () {
    var alert = NSAlert.alloc().init()
    alert.setMessageText("Document not saved")
    alert.setInformativeText("Please save the document before exporting to Evrybo.")
    alert.addButtonWithTitle("OK")
    alert.runModal()
};

Controller.prototype.showExportView = function (context, exporter) {
    var app = [NSApplication sharedApplication];
    var exportWindow = [[NSWindow alloc] init];
    [exportWindow setBackgroundColor: [NSColor colorWithRed: 239.0/255.0 green:242.0/255.0 blue:247.0/255.0 alpha:1.0]];
    [exportWindow setFrame:NSMakeRect(0, 0, 300, 300) display: false];
    [exportWindow setTitle:@"Export to Evrybo"];

    var box = [[NSBox alloc] initWithFrame:NSMakeRect(0, 50, 300, 250)];
    var projectsComboBox = [[NSComboBox alloc] initWithFrame:NSMakeRect([box frame].size.width/2 - 100, 100, 200, 30)];
    [box setBoxType:NSBoxCustom];
    [box setBorderType:NSLineBorder];
    [box setFillColor:[NSColor colorWithRed: 255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]];
    [box addSubview:projectsComboBox];

    var logoImageView = [[NSImageView alloc] initWithFrame:NSMakeRect([box frame].size.width/2 - 33, 150, 53, 44)];
    var logoImage = NSImage.alloc().initByReferencingFile(helper.scriptResourcesPath + "/" + "logo.png");
    [logoImageView setImage: logoImage];
    [box addSubview:logoImageView];

    [[exportWindow contentView] addSubview:box];
    var result = service.getAllProjectsForUser(helper.getUserId());
    fillComboBoxWithProjectsAndPreselect(projectsComboBox, result);

    var exportButton = [[NSButton alloc] initWithFrame:NSMakeRect(150, 10, 100, 30)];
    [exportButton setTitle:"Sync"];
    [exportButton setBezelStyle:NSRoundedBezelStyle];
    [exportButton setKeyEquivalent:"\r"];
    [exportButton setCOSJSTargetFunction:function(sender) {
        [exportWindow orderOut:nil];
        [app stopModal];
        [exportButton setCOSJSTargetFunction:undefined];
        var artboards = exporter.export(context);
        service.uploadArtboards(context, artboards);
    }];

    var closeButton = [[NSButton alloc] initWithFrame:NSMakeRect(50, 10, 100, 30)];

    [closeButton setEnabled: true];
    [closeButton setTitle:"Cancel"];
    [closeButton setBezelStyle:NSRoundedBezelStyle];
    [closeButton setKeyEquivalent:"\r"];

    [closeButton setCOSJSTargetFunction:function(sender) {
        [exportWindow orderOut:nil];
        [app stopModal];
        [closeButton setCOSJSTargetFunction:undefined];
    }];

    [[exportWindow contentView] addSubview: closeButton];
    [[exportWindow contentView] addSubview: exportButton];

    var comboBoxDelegate = new MochaJSDelegate({
        "comboBoxSelectionDidChange:": (function() {
            selectedProject  = projects[[projectsComboBox indexOfSelectedItem]];
            helper.saveSelectedProjectId(selectedProject);
            COScript.currentCOScript().setShouldKeepAround_(true);
        })
    });
    projectsComboBox.setDelegate(comboBoxDelegate.getClassInstance());
    [app runModalForWindow:exportWindow];
};

function fillComboBoxWithProjectsAndPreselect(projectsComboBox, result) {
    var projectNames = [[NSMutableArray alloc] init];
    for (i = 0; i < result.projects.length; i++) {
        const project = new Project(result.projects[i].id, result.projects[i].name, i);
        projects.addObject(project);
        projectNames.addObject(result.projects[i].name);
    }
    projectsComboBox.addItemsWithObjectValues(projectNames);
    var selectedProjectId = helper.getSelectedProjectId();
    var projectIndex = 0
    if (selectedProjectId) {
        for(j = 0; j < projects.length; j++) {
            if (projects[j].projectId == selectedProjectId) {
                projectIndex = j;
                break;
            }
        }
    }
    [projectsComboBox selectItemAtIndex:projectIndex];
};

Controller.prototype.showLoginView = function (context) {
    var app = [NSApplication sharedApplication];
    var loginWindow = [[NSWindow alloc] init];

    [loginWindow setFrame:NSMakeRect(0, 0, 300, 300) display: false];
    [loginWindow setTitle:@"Login to Evrybo"];

    var logoImageView = [[NSImageView alloc] initWithFrame:NSMakeRect([loginWindow frame].size.width/2 - 33, 210, 53, 44)];
    var logoImage = NSImage.alloc().initByReferencingFile(helper.scriptResourcesPath + "/" + "logo.png");
    [logoImageView setImage: logoImage];
    [[loginWindow contentView] addSubview:logoImageView];

    var email = [[NSTextField alloc] initWithFrame:NSMakeRect([loginWindow frame].size.width/2 - 100, 180, 200, 20)];
    [[email cell] setPlaceholderString:"Email"];
    [[loginWindow contentView] addSubview:email];

    var password = [[NSSecureTextField alloc] initWithFrame:NSMakeRect([loginWindow frame].size.width/2 - 100, 140, 200, 20)];
    [[password cell] setPlaceholderString:"Password"];
    [[loginWindow contentView] addSubview:password];

    var errorMessage = [[NSTextField alloc] initWithFrame:NSMakeRect([loginWindow frame].size.width/2 - 100, 110, 220, 20)];
    [errorMessage setEditable:false];
    [errorMessage setTextColor:[NSColor redColor]];
    [errorMessage setBordered:false];
    [errorMessage setDrawsBackground:false];
    [errorMessage setFont:[NSFont systemFontOfSize:11]];
    [errorMessage setStringValue:"Bad credentials. Check email/password."];
    [errorMessage setHidden:true];
    [[loginWindow contentView] addSubview:errorMessage];

    var loginButton = [[NSButton alloc] initWithFrame:NSMakeRect(150, 10, 100, 30)];

    [loginButton setEnabled: false];
    [loginButton setTitle:"Login"];
    [loginButton setBezelStyle:NSRoundedBezelStyle];
    [loginButton setKeyEquivalent:"\r"];

    var closeButton = [[NSButton alloc] initWithFrame:NSMakeRect(50, 10, 100, 30)];

    [closeButton setEnabled: true];
    [closeButton setTitle:"Close"];
    [closeButton setBezelStyle:NSRoundedBezelStyle];
    [closeButton setKeyEquivalent:"\r"];


    [loginButton setCOSJSTargetFunction:function(sender) {
        let errorResponse = service.login(email, password)
        log('[ERROR] response login: ' + errorResponse)
        if (errorResponse != nil) {
            if (errorResponse == 401) {
                [errorMessage setHidden: false];
                return;
            }
            return;
        }
        [loginWindow orderOut:nil];
        [app stopModal];
        [loginButton setCOSJSTargetFunction:undefined];

    }];

    [closeButton setCOSJSTargetFunction:function(sender) {
        [loginWindow orderOut:nil];
        [app stopModal];
        [closeButton setCOSJSTargetFunction:undefined];
    }];


    [[loginWindow contentView] addSubview: loginButton];
    [[loginWindow contentView] addSubview: closeButton];

    COScript.currentCOScript().setShouldKeepAround_(true);

    var emailDelegate = new MochaJSDelegate({
        "controlTextDidChange:": (function(){
            [errorMessage setHidden:true];
            if ([[email stringValue] length] > 0 && [[password stringValue] length] > 0 ){
                [loginButton setEnabled:true];
            }else{
                [loginButton setEnabled:false];
            }
            COScript.currentCOScript().setShouldKeepAround_(false);
        })
    });

    email.setDelegate(emailDelegate.getClassInstance());

    var passwordDelegate = new MochaJSDelegate({
        "controlTextDidChange:": (function(){
            [errorMessage setHidden:true];
            if ([[email stringValue]length] > 0 && [[password stringValue]length] > 0 ){
                [loginButton setEnabled:true];
            }else{
                [loginButton setEnabled:false];
            }
            COScript.currentCOScript().setShouldKeepAround_(false);
        })
    });
    password.setDelegate(passwordDelegate.getClassInstance());

    [app runModalForWindow:loginWindow];
};

Controller.prototype.showLogoutView = function (context) {
    var app = [NSApplication sharedApplication];
    var logoutWindow = [[NSWindow alloc] init];
    [logoutWindow setFrame:NSMakeRect(0, 0, 300, 100) display: false];

    var logoutMessage = [[NSTextField alloc] initWithFrame:NSMakeRect(20, [logoutWindow frame].size.height / 2, 180, 20)];
    [logoutMessage setEditable:false];
    [logoutMessage setTextColor:[NSColor blackColor]];
    [logoutMessage setBordered:false];
    [logoutMessage setDrawsBackground:false];
    [logoutMessage setFont:[NSFont systemFontOfSize:13]];
    [logoutMessage setStringValue:"You are already logged in."];
    [[logoutWindow contentView] addSubview:logoutMessage];

    var logoutButton = [[NSButton alloc] initWithFrame:NSMakeRect(200, [logoutWindow frame].size.height / 2 - 10, 100, 30)];
    [logoutButton setEnabled: true];
    [logoutButton setTitle:"Logout"];
    [logoutButton setBezelStyle:NSRoundedBezelStyle];
    [logoutButton setKeyEquivalent:"\r"];

    [logoutButton setCOSJSTargetFunction:function(sender) {
        [logoutWindow orderOut:nil];
        [app stopModal];
        [logoutButton setCOSJSTargetFunction:undefined];
        helper.removeCredentials();
    }];
    [logoutWindow setTitle:@"Evrybo"];
    [[logoutWindow contentView] addSubview: logoutButton];

    var closeButton = [[NSButton alloc] initWithFrame:NSMakeRect(200, [logoutWindow frame].size.height / 2 - 40, 100, 30)];
    [closeButton setEnabled: true];
    [closeButton setTitle:"Close"];
    [closeButton setBezelStyle:NSRoundedBezelStyle];
    [closeButton setKeyEquivalent:"\r"];

    [closeButton setCOSJSTargetFunction:function(sender) {
        [logoutWindow orderOut:nil];
        [app stopModal];
        [closeButton setCOSJSTargetFunction:undefined];
    }];
    [[logoutWindow contentView] addSubview: closeButton];

    [app runModalForWindow:logoutWindow];
};