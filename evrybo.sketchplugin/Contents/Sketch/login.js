@import 'controller/controller.js';
@import 'helper/helper.js';

var onRun = function(context) {
    helper.init(context);
    var userLogged = helper.isLoggedIn();
    if(userLogged){
        controller.showLogoutView(context);
    } else {
        controller.showLoginView(context);
    }
};
