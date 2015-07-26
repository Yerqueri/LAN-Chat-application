var os = require('os');
var fs = require('fs');

function displayValues(){
    fs.readFile('../UserData.txt',function(err,data){
        if(err) return;
        else {
            jsonData = JSON.parse(data);
            var table = document.getElementById('mainTable');

            userArray = jsonData['users'];

            for (var i = 0; i < userArray.length; i++) {
                var row = table.insertRow(i+1);
                var userName = row.insertCell(0);
                userName.innerHTML = userArray[i]['userName'];
                var numlog = row.insertCell(1);
                numlog.innerHTML = userArray[i]['numberLogins'];
                var ip = row.insertCell(2);
                ip.innerHTML = userArray[i]['mostRecentIP'];
                var lastlog = row.insertCell(3);
                lastlog.innerHTML = userArray[i]['lastLogin'];
            }
        }
    })
}
