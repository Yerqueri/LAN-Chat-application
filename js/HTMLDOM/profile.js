var userprofile = require('userprofile');
var usermanage = require('usermanage');
var Ipconfig = require('Ipconfig');
var gui = require('nw.gui');

function saveDetails(){
    var newUserName = document.getElementById('UserName').value;
    usermanage.updateUserData(newUserName,Ipconfig.myIpAddress());
    var currWindow = gui.Window.get();
    // Get the App closed!
    gui.App.quit();
    currWindow.close();
}
