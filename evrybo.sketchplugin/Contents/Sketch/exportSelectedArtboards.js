@import 'controller/controller.js';
@import 'service/exporter.js';
@import 'helper/helper.js';

var onRun = function(context) {
    helper.init(context);
    if(helper.isLoggedIn()){
        if(helper.hasArtboardSelected(context)) {
            controller.showExportView(context, new ExporterSelected());
        } else {
            controller.showAlertNoArtboardSelected();
        }
    } else {
        controller.showLoginView(context);
    }
};