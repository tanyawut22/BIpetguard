function onInitialize() {
    return window.location = "http://52.220.162.104/matask/6";
    initChoicTable();
    setTimeout(() => {
        getProv();
        setTimeout(() => {
            getTeam();
        }, 50);
    }, 25);

    $('#ddprovid').on('change', function () {
        getTeam();
    });

    getMAType();
}

var choices = [
    { "name": "สาย Drop wire พร้อม material", "unit": "เมตร" },
    { "name": "สาย Patch Cord 1.5m", "unit": "เส้น" },
    { "name": "กล่อง Terminal Box", "unit": "set" },
    { "name": "หัว Fast Connector", "unit": "ตัว" },
    { "name": "SC-APC I-connector", "unit": "ตัว" },
    { "name": "Aluminum Name Plate", "unit": "แผ่น" }
];

function getProv() {
    $.post('../matask/2.getProv', function (ret, status) {
        var str = '<option value="0">กรุณาเลือกจังหวัด</option>';
        if (ret.success) {
            $('#ddprovid').html('');
            for (let i = 0; i < ret.data.length; i++) {
                let row = ret.data[i];
                str += '<option value="' + row._id + '">' + row.fname + '</option>';
            }
            $('#ddprovid').html(str);
        } else { }
    });
}

function getTeam() {
    var pid = $('#ddprovid').val();
    var str = '<option value="0">กรุณาเลือกทีมที่เข้าซ่อม</option>';
    $.post('../matask/1.getTeamByProv', { "data": JSON.stringify(pid) }, function (ret, status) {
        if (ret.success) {
            $('#ddteamid').html('');
            for (let i = 0; i < ret.data.length; i++) {
                let row = ret.data[i];
                str += '<option value="' + row._id + '">' + row.name + '</option>';
            }
            $('#ddteamid').html(str);
        } else { }
    });
}

function getMAType() {
    var str = '<option value="0">เลือกประเภทของงาน</option>';
    $.post('../matask/2.getTypeMA', {}, function (ret, status) {
        if (ret.success) {
            $('#ddftypeid').html('');
            for (let i = 0; i < ret.data.length; i++) {
                let row = ret.data[i];
                str += '<option value="' + row._id + '">' + row.name + '</option>';
            }
            $('#ddftypeid').html(str);
        } else { }
    });
}

function initChoicTable() {
    var tableObj = $('#choiceTable');
    var str = "";
    var i = 0;
    choices.forEach(element => {
        str += '<tr><td><input class="checkbox" id="item' + i + '" type="checkbox"></td>';
        str += '<td>' + element.name + '</td>';
        str += '<td><input  type="number" min="0"/></td>';
        str += '<td>' + element.unit + '</td>';
        str += '<td><input id="fileupload' + i + '" class="form-control" type="file" name="files" onchange="doUpload(' + i + ');">';
        str += '<span id="txtImg' + i + '"></span></tr>';
        i++;
    });
    // str += '<tr><td colspan="4"><a href="javascript:;" class="btn btn-sm green btn-block"> อื่น ๆ<i style="margin-left: 10px" class="fa fa-plus"></i></a></td></tr>';
    tableObj.html(str);
    $('.checkbox').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
}

function doUpload(i) {
    var file_data = $('#fileupload' + i).prop('files')[0];
    var form_data = new FormData();
    form_data.append('file', file_data);
    console.log(file_data);
    $.ajax({
        "url": '../uploadimg/',
        "type": 'POST',
        "data": form_data,
        "async": true,
        "success": function (ret) {
            console.log(ret);
        },
        "cache": false,
        "contentType": false,
        "processData": false
    });
}