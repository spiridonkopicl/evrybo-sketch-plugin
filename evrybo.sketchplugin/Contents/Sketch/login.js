@import 'controller/controller.js';
@import 'helper/helper.js';

var onRun = function(context) {
    helper.init(context);
    if(helper.isLoggedIn()){
        controller.showLogoutView(context);
    } else {
        controller.showLoginView(context);
    }
};
