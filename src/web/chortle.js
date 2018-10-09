const POLL_FREQUENCY_SECONDS = 5;
const TABLE_HEADERS = ["Chore", "Status", "Time Remaining"];

function clearTable() {
    var table = document.getElementById("chore-chart");
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild)
    }
}

function buildTableHeader() {
    var headerRow = document.createElement("TR");

    TABLE_HEADERS.forEach(function(header) {
        var headerElement = document.createElement("TH");
        headerElement.innerText = header;
        headerRow.appendChild(headerElement);
    });

    document.getElementById("chore-chart").appendChild(headerRow);
}

function buildTable(choreList) {
    clearTable();
    buildTableHeader();
    choreList.forEach(function(choreRow) {
        var choreName = choreRow.chore.S;
        var choreNameTd = document.createElement("TD");
        choreNameTd.innerText = choreName
    
        var choreStatus = choreRow.status_ok.BOOL;
        var choreStatusTd = document.createElement("TD");
        choreStatusTd.innerText = choreStatus

        var choreExpireTime = parseInt(choreRow.last_pressed_time.N) + parseInt(choreRow.reset_time_seconds.N);
        var now = Math.floor(new Date().getTime() / 1000);
        var timeRemaining = choreExpireTime - now;
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = Math.floor(timeRemaining % 60);
        var choreTime = minutes + ":" + seconds;
        var choreTimeTd = document.createElement("TD");
        choreTimeTd.innerText = choreTime;

        var tr = document.createElement("TR");
        tr.appendChild(choreNameTd);
        tr.appendChild(choreStatusTd);
        tr.appendChild(choreTimeTd);
        document.getElementById("chore-chart").appendChild(tr);
    });
}

function pollDynamo(dynamodb) {
    dynamodb.scan({TableName: "chortle-model"}, function (err, data) {
        if (err) console.log(err, err.stack);
        else buildTable(data.Items);
    });
}

function setupAWSConfig() {
    AWS.config.update({
        region: 'us-east-2',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-2:23c381d2-a8c3-4448-96f6-753b6cb4e374'
        })
    });
}

setupAWSConfig();
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
setInterval(pollDynamo, POLL_FREQUENCY_SECONDS*1000, dynamodb);