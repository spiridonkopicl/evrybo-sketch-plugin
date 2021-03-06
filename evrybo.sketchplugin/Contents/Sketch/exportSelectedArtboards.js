@import 'controller/controller.js';
@import 'service/exporter.js';
@import 'helper/helper.js';

var onRun = function(context) {
    helper.init(context);
    var userLogged = helper.isLoggedIn();
    if(userLogged){
        if(helper.hasArtboardSelected(context)) {
            if(helper.isDocumentSaved(context)) {
                controller.showExportView(context, new ExporterSelected());
            } else {
                controller.showAlertDocumentNotSaved();
            }
        } else {
            controller.showAlertNoArtboardSelected();
        }
    } else {
        controller.showLoginView(context);
    }
};