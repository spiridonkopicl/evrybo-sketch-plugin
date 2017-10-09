@import 'helper/helper.js';
@import 'MochaJSDelegate.js';

var service = new Service();

function Service() {}

Service.prototype.getAllProjectsForUser = function (userId) {
    var url = [NSString stringWithFormat:@"%@/%@", helper.allProjectForUserURL, userId];
    var request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    [request setHTTPMethod:"GET"];
    [request setValue:"Sketch" forHTTPHeaderField:"User-Agent"];
    var token = helper.getSavedToken();
    [request setValue:token forHTTPHeaderField:"Authorization"];

    var response = MOPointer.alloc().init(),
        error = MOPointer.alloc().init(),
        res = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, response, error);
    if (error.value() != nil && res != nil){
        log('[ERROR] login ' + error.value())
        var strError = [NSString stringWithFormat:@"%@", [[error value] description]];
        if ([strError rangeOfString:@"Code=-1012"].location != NSNotFound) {
            log('[ERROR] 401 : Unauthorization')
            // show unauthorizid labes
            return;
        }else{
            log('[ERROR] other error ' + strError)
            return;
        }
    }
    var dataString = NSString.alloc().initWithData_encoding(res, NSUTF8StringEncoding);
    var result = JSON.parse(dataString);
    return result;
};

Service.prototype.login = function (email, password) {
    var request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(helper.loginURL));
    [request setHTTPMethod:"POST"];
    [request setValue:"Sketch" forHTTPHeaderField:"User-Agent"];

    var emailPassword = [NSString stringWithFormat:@"%@:%@", email.stringValue(), password.stringValue()];
    var authData = [emailPassword dataUsingEncoding:NSUTF8StringEncoding];
    var authValue = [NSString stringWithFormat: @"Basic %@",[authData base64EncodedStringWithOptions:0]];
    [request setValue:authValue forHTTPHeaderField:"Authorization"];
    var response = MOPointer.alloc().init(),
        error = MOPointer.alloc().init(),
        res = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, response, error);
    if (error.value() != nil && res != nil){
        log('[ERROR] login ' + error.value())
        var strError = [NSString stringWithFormat:@"%@", [[error value] description]];
        if ([strError rangeOfString:@"Code=-1012"].location != NSNotFound) {
            log('[ERROR] api: Unauthorized 401')
            return 401;
        }else{
            log('[ERROR] api: ' + strError)
            return;
        }
    }
    var dataString = NSString.alloc().initWithData_encoding(res, NSUTF8StringEncoding);
    var result = JSON.parse(dataString);
    helper.saveUserIdAndToken(result.user.id, authValue)
};

Service.prototype.uploadArtboards = function (context, artboards) {
    var document = context.document;
    var savedSelectedProjectId = helper.getSelectedProjectId();
    var url = [NSString stringWithFormat:@"%@/%@", helper.uplaodArtboardsForProjectURL ,savedSelectedProjectId];
    var request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    [request setHTTPMethod:"POST"];
    [request setValue:"Sketch" forHTTPHeaderField:"User-Agent"];
    var token = helper.getSavedToken();
    [request setValue:token forHTTPHeaderField:"Authorization"];
    var boundary = @"0123456789";

    var contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
    [request setValue:contentType forHTTPHeaderField: @"Content-Type"];
    var body = [NSMutableData data];
    appendArtboardsToHttpBody(document, body, boundary, artboards);

    [body appendData:[[NSString stringWithFormat:@"--%@--\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
    [request setHTTPBody:body];
    var postLength = [NSString stringWithFormat:@"%d", [body length]];
    [request setValue:postLength forHTTPHeaderField:@"Content-Length"];
    var response = MOPointer.alloc().init(),
        error = MOPointer.alloc().init(),
        res = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, response, error);
    if (error.value() != nil && res != nil){
        log('[ERROR] login ' + error.value())
        var strError = [NSString stringWithFormat:@"%@", [[error value] description]];
        if ([strError rangeOfString:@"Code=-1012"].location != NSNotFound) {
            log('[ERROR] 401 : Unauthorization')
            return;
        }else{
            log('[ERROR] other error ' + strError)
            return;
        }
    }
};

function appendArtboardsToHttpBody(document, body, boundary, artboards) {
    var directoryURL = [[[document fileURL] path] stringByDeletingLastPathComponent];
    var fileName = [[[[document fileURL] path] lastPathComponent] stringByDeletingPathExtension];
    for (var i=0; i< artboards.count(); i++) {
        var artboard = artboards[i]
        var filePath = directoryURL + "/" + fileName +"_tmp_evrybo_creation_" + i + ".png";
        [document saveArtboardOrSlice:artboard toFile:filePath];
        var image = [[NSImage alloc] initByReferencingFile:filePath];
        var cgRef = [image CGImageForProposedRect:nil context:nil hints:nil];
        var newRep = [[NSBitmapImageRep alloc] initWithCGImage:cgRef];
        [newRep setSize:[image size]];
        var pngData = [newRep representationUsingType:NSPNGFileType properties:nil];
        if ([[NSFileManager defaultManager] isDeletableFileAtPath:filePath]) {
            var success = [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];
            if (!success) {
                log('[ERROR] deleting file at path' + filePath);
            }
        }
        // add image data
        if (pngData) {
            [body appendData:[[NSString stringWithFormat:@"--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
            // var artboardName = [[artboard name] stringByReplacingOccurrencesOfString:@" " withString: @"_"];
            var artboardName = [artboard name];
            var filename = '"' + [NSString stringWithFormat:@"%@.png", artboardName] + '"';
            [body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=%@; filename=%@\r\n", @"file[]", filename] dataUsingEncoding:NSUTF8StringEncoding]];
            [body appendData:[@"Content-Type: image/png\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
            [body appendData:pngData];
            [body appendData:[[NSString stringWithFormat:@"\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
        }
    }
};
