//////////////////////////////////////////////////////////////////////////////////////////////
/////// Requires.

var Ipconfig = require('Ipconfig');
var querystring = require('querystring');
var net = require('net');
var listDevices = require('listDevices');
var exchangemessage = require('exchangemessage');
var usermanage = require('usermanage');
var gui = require('nw.gui');
var os = require('os');

////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Setting Variables.
var UserName = "User";
var MessageReciever = 0;
var Lister = [];
var tempLister = [];
var oldLister = [];
var ListOfAllReceivers = {};

// Main User Ip and Port Setup.
HOST = Ipconfig.myIpAddress().toString();
MESSAGINGPORT = 18160;

//////////////////////////////////////////////////////////////////////////////////////////////////

//////// DOM Manipulations and UserList Refresh.

// Add Menu on the Page.
function addMenu(){
    var appMenu = new gui.Menu({ type: 'menubar' });
    if(os.platform() != 'darwin') {
        // Main Menu Item 1.
        item = new gui.MenuItem({ label: "Options" });
        var submenu = new gui.Menu();
        // Submenu Items.
        submenu.append(new gui.MenuItem({ label: 'Preferences', click :
            function(){
                // Add preferences options.
                // Edit Userdata and Miscellaneous (Blocking to be included).
            }
        }));

        submenu.append(new gui.MenuItem({ label: 'Exit', click :
            function(){
                gui.App.quit();
            }
        }));

        item.submenu = submenu;
        appMenu.append(item);

        // Main Menu Item 2.
        item = new gui.MenuItem({ label: "Transfers"});
        var submenu = new gui.Menu();
        // Submenu 1.
        submenu.append(new gui.MenuItem({ label: 'File Transfer', click :
            function(){
                var mainWin = gui.Window.get();
                var aboutWin = gui.Window.open('./filetransfer.html',{
                    position: 'center',
                    width:901,
                    height:400,
                    focus: true
                });
                mainWin.blur();
            }
        }));
        item.submenu = submenu;
        appMenu.append(item);

        // Main Menu Item 3.
        item = new gui.MenuItem({ label: "Help" });
        var submenu = new gui.Menu();
        // Submenu 1.
        submenu.append(new gui.MenuItem({ label: 'About', click :
            function(){
                var mainWin = gui.Window.get();
                var aboutWin = gui.Window.open('./about.html', {
                    position: 'center',
                    width:901,
                    height:400,
                    focus: true
                });
                mainWin.blur();
            }
        }));
        item.submenu = submenu;
        appMenu.append(item);
        gui.Window.get().menu = appMenu;
    }
    else {
        // menu for mac.
    }

}

// Create User Data files.
function dataUpdate(UserName){
    usermanage.updateUserData(UserName,Ipconfig.myIpAddress());
}

// Setting HTML values. ------- Main Starting and Entry point.
function setValues(){
    pageload();
    dataUpdate(UserName);
    addMenu();
    document.getElementById('ipaddress').innerHTML = '<h5>'+Ipconfig.myIpAddress()+'</h5>';
    startServer();
    refreshList();
    setInterval(refreshList,5000);
}

// Getting UserName from post.
function pageload(){
        var $_GET = {};
        if(document.location.toString().indexOf('?') !== -1) {
            var query = document.location
                    .toString()
                    // get the query string
                    .replace(/^.*?\?/, '')
                    // and remove any existing hash string (thanks, @vrijdenker)
                    .replace(/#.*$/, '')
                    .split('&');

                    for(var i=0, l=query.length; i<l; i++) {
                        var aux = decodeURIComponent(query[i]).split('=');
                        $_GET[aux[0]] = aux[1];
                    }
                }
        if($_GET['username'].length > 0)
        UserName = $_GET['username'];

        // Set the page value of the UserName fields.
        document.getElementById('welcometext').innerHTML = 'Welcome '+UserName+'..!';

}

// Enter is send implementation.
document.onkeydown = function (e) {
    /// check ctrl + f key
    if ((document.getElementById('EnterIsSend').checked == true) && e.keyCode === 13/*65*/) {
        e.preventDefault();
        sendMessage();
        return false;
    }
}


// Refreshing User list.
function refreshList(){
    Lister = listDevices.getListOfDevices(UserName);

        setTimeout(function(){
        var div = "";
        if(Lister.length == 0){
            div = '\
            <div class="row" id="onlineusers" style="overflow-x: hidden;overflow-y: scroll;max-height: 450px;padding-left:25px;">\
                    <div class="preloader-wrapper big active">\
                        <div class="spinner-layer spinner-blue-only">\
                            <div class="circle-clipper left">\
                                <div class="circle"></div>\
                            </div><div class="gap-patch">\
                                <div class="circle"></div>\
                            </div><div class="circle-clipper right">\
                                <div class="circle"></div>\
                            </div>\
                        </div>\
                    </div>\
            </div>\
            ';
            document.getElementById('onlineusers').innerHTML = div;
        }
        else {

        for (var i = 0; i < Lister.length; i++) {

            var user = JSON.parse(Lister[i]);
            if((!ListOfAllReceivers[user.IpAddress]) || (ListOfAllReceivers[user.IpAddress]['UserName']!=user.Name) ) {
                ListOfAllReceivers[user.IpAddress] = {};
                ListOfAllReceivers[user.IpAddress]['UserName'] =  user.Name;
                ListOfAllReceivers[user.IpAddress]['Badge'] = 0;
            }

            tempLister.push(Lister[i]);

            // Badge Value.
            // Check if user exists in oldLister.
            // If yes, then dont run this loop.
            // Else run.
            div += '\
            <div class = "row"> \
            <a style="width:100%" onclick="setReciever(this.id)" class="waves-effect waves-teal btn-flat" id = "' +
            user.IpAddress.toString() +
            '"><span class="new badge" id="'+
            user.IpAddress.toString() + 'badge' +
            '">'+
            ListOfAllReceivers[user.IpAddress]['Badge'].toString() +
            '</span>' +
            ListOfAllReceivers[user.IpAddress]['UserName'].toString() +
            '</a>\
            </div>';

            if(oldLister.indexOf(Lister[i]) == -1){
            // Create a separate list with hidden property for the chat with each of them.
            var mbox = document.getElementById('messagechatbox');
            var list = document.createElement('ul');
            list.setAttribute('id',user.IpAddress.toString()+'messagelist');
            list.className = "potentialchat list-group";
            mbox.appendChild(list);
            }
            document.getElementById('onlineusers').innerHTML = div;
        }
        oldLister = tempLister;
        tempLister = [];
        }
    },2000);
}



////////////////////////////////////////////////////////////////////////////////////////////////////
///////// Interaction Messages and Server Setup.

// Starting Servers for main Work.
function startServer(){
    listDevices.startAttendaceServer(UserName);
    startMessageServer();
    console.log('did');
}


// Working Server Implementations.
function startMessageServer(){
    net.createServer(function(sock){
        sock.on('listening',function(data){
            console.log("Started Message listening");
        });
        sock.on('data', function(data){

            // This is where the list item should be added on the left side.
            var list = document.getElementById(sock.remoteAddress.toString()+'messagelist');
            var badge = document.getElementById(sock.remoteAddress.toString()+'badge').innerHTML;
            document.getElementById(sock.remoteAddress.toString()+'badge').innerHTML = (parseInt(badge)+1).toString();
            ListOfAllReceivers[sock.remoteAddress]['Badge'] = parseInt(badge)+1;
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(data));
            li.classList.add("list-group-item");
            li.classList.add("received");
            li.classList.add("cyan");
            li.classList.add("lighten-1");
            li.classList.add("card-panel");
            list.appendChild(li);
        });
    }).listen(MESSAGINGPORT, HOST);
}


// Setting the reciever of the message.
function setReciever(btnid){
    if(MessageReciever != 0){
    var oldlist = document.getElementById(MessageReciever.toString()+'messagelist');
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
    oldlist.className = "potentialchat list-group";
    }
    MessageReciever = btnid.toString();
    document.getElementById("RecieverName").innerHTML = ListOfAllReceivers[btnid]["UserName"] +
    '<span class="small" style="margin-left:20px">'+
    btnid.toString();
    '</span>'
    ;

    var newlist = document.getElementById(MessageReciever.toString()+'messagelist');
    newlist.className = "activechat list-group";
    document.getElementById(MessageReciever.toString()+'badge').innerHTML = '0';
    ListOfAllReceivers[btnid]['Badge'] = 0;
    console.log("Reciever Set to : " + MessageReciever);
}

// Sending a message.
function sendMessage(){
    var Message = document.getElementById('messageText').value;
    document.getElementById('messageText').value = "";
    if(Message.length > 0){
        // Send the message
        //console.log("Message Sent to " + MessageReciever + " Message : " + Message);
        exchangemessage.sendMessage(MessageReciever,Message);
        document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
        var list = document.getElementById(MessageReciever.toString()+'messagelist');
        list.className = "list-group activechat";
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(Message));
        li.classList.add("list-group-item");
        li.classList.add("sent");
        li.classList.add("cyan");
        li.classList.add("lighten-1");
        li.classList.add("card-panel");
        list.appendChild(li);
    }
}
