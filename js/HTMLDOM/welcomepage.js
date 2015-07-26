var Ipconfig = require('Ipconfig');
var gui = require('nw.gui');
var appmenu = require('appmenu');
var mkdirp = require('mkdirp');
var os = require('os');
var usermanage = require('usermanage');


appMenu = new gui.Menu();

// Make file exchange directories.
function makeFileDir() {
    mkdirp('../ChatAppFiles', function (err) {
        if (err) console.error(err);
    });
    mkdirp('../ChatAppFiles/UserData',function(err) {
        if (err) console.error(err);
    });
}

// Make the Menu

function addMenu (typeOfPage){

    if(typeOfPage == 'welcome') {
        var appMenu = new gui.Menu({ type: 'menubar' });

        if(os.platform() != 'darwin') {
            // Main Menu Item 1.
            item = new gui.MenuItem({ label: "Options" });
            var submenu = new gui.Menu();
            // Submenu 1.
            submenu.append(new gui.MenuItem({ label: 'Exit', click :
                function(){
                    gui.App.quit();
                }
            }));
            item.submenu = submenu;
            appMenu.append(item);

            // Main Menu Item 2.
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
    else if(typeOfPage == 'mainpage'){

    }


}

// Function to set all the DOM Values.
function setValues(){
    addMenu('welcome');

    document.body.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
        appMenu.popup(ev.x, ev.y);
        return false;
    });
    document.getElementById('ipaddress').innerHTML = '<h2>Your IPV4 : '+Ipconfig.myIpAddress()+'</h2>';
}
