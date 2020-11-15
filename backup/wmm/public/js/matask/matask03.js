function onInitialize() {
    tools_reauthen('matask');
    getAllData();
}

function tools_reauthen(current) {
    var data = { 'location': current };
    $.post("../reauthen", data,
        function (ret, status) {
            if (ret.success !== 'true') {
                window.location = "http://52.220.162.104";
            }
        }
    );
}

function getAllData() {
    $.post('./3.getAllData', function (ret, status) {
        console.log(ret);
        var str = '';
        if (ret.success) {
            generateRow('tTypeMA', ret.data);
        }
    });
}

function refreshData() {
    var str = '<tr id="tTypeMA"><td colspan="7"><button onclick="generateAddRow()" class="btn blue">Add TYPE</button></td></tr>';
    $('#refreshData').html(str);
    getAllData();
}

function generateRow(id, data) {
    var str = '';
    for (let i = 0; i < data.length; i++) {
        var element = data[i];
        var type = (element.type == 1 ? "งานเสริม" : "งานจาก FOA");
        str += '<tr id="' + element._id + '">';
        str += '<td>' + (i + 1) + '</td>';
        str += '<td class="chgTag">' + element.name + '</td>';
        str += '<td class="chgddTag">' + type + '</td>';
        str += '<td class="chgTag">' + element.color + '</td>';
        str += '<td class="chgTag">' + element.icon + '</td>';
        str += '<td><a class="btn btn-icon-only ' + element.color + '">';
        str += '<i class="fa fa-' + element.icon + '"></i></a></td>';
        str += '<td class="tarBtn"><a onclick="btnOnEdit(\'' + element._id + '\');" class="btn green">EDIT';
        str += '<i class="fa fa-pencil" style="padding-left: 5px;"></i></a>';
        str += '<a class="btn red" onclick="btnOnDelete(\'' + element._id + '\');">DELETE<i class="fa fa-trash" style="padding-left: 5px;"></i></a></td>';
        str += '</tr>';
    }
    $('#' + id).before(str);
}

var idxrow = 1;
function generateAddRow() {
    var str = '';
    str += '<tr id="newdata' + idxrow + '">';
    str += '<td></td>';
    str += '<td><input class="form-control" type="text" /></td>';
    str += '<td><select class="ddTypeAddrow form-control"><option value="1">งานเสริม</option><option value="2">งานจาก FOA</option></select></td>';
    str += '<td><input class="form-control" type="text" /></td>';
    str += '<td><input class="form-control" type="text" /></td>';
    str += '<td></td>';
    str += '<td class="tarBtn"><a onclick="btnOnAdd(' + idxrow + ');" class="btn green">ADD';
    str += '<i class="fa fa-pencil" style="padding-left: 5px;"></i></a>';
    str += '<a class="btn red" onclick="delAddRowData(' + idxrow + ');">DELETE<i class="fa fa-trash" style="padding-left: 5px;"></i></a></td>';
    str += '</tr>';
    $('#tTypeMA').before(str);
    idxrow++;
}

function btnOnAdd(id) {
    var arr = [];
    $('#newdata' + id + ' > td').each(function () {
        var txt = $(this).find('input').val();
        if (typeof txt != 'undefined') arr.push(txt);
    });
    arr.push(parseInt($('#newdata' + id).find('.ddTypeAddrow').val()));

    $.post('./3.addData', { "data": JSON.stringify(arr) }, function (ret, status) {
        if (ret.success) {
            refreshData();
        }
    });
}

function delAddRowData(id) {
    $('#newdata' + id).remove();
}

function btnOnEdit(id) {
    $('#' + id + ' > .chgTag').each(function () {
        var txt = $(this).html();
        $(this).html('<input class="saveTag form-control" value="' + txt + '" /><span class="tmpTag" style="display:none;">' + txt + '</span>');
    });
    var tmp = $('#' + id + ' > .chgddTag');
    var str = tmp.text();
    if (str == "งานเสริม") {
        tmp.html('<select class="ddTypeRow form-control"><option selected value="1">งานเสริม</option><option value="2">งานจาก FOA</option></select>');
        tmp.append('<span class="tmpddTag" style="display:none;">' + str + '</span>');
    } else {
        tmp.html('<select class="ddTypeRow form-control"><option value="1">งานเสริม</option><option selected value="2">งานจาก FOA</option></select>');
        tmp.append('<span class="tmpddTag" style="display:none;">' + str + '</span>');
    }
    chgBtntoEditState(id);
}

function btnOnSave(id) {
    var arr = [];
    $('#' + id + ' > .chgTag').each(function () {
        var txt = $(this).find('.saveTag').val();
        if (typeof txt != 'undefined') arr.push(txt);
    });
    var dd = $('#' + id + ' > .chgddTag').find('.ddTypeRow');
    var ddtxt = dd.text();
    var data2send = {
        "_id": id,
        "data": { 'name': arr[0], 'color': arr[1], 'icon': arr[2], "type": dd.val() }
    };

    $.post('./3.updateData', { "data": JSON.stringify(data2send) }, function (ret, status) {
        if (ret.success) {
            refreshData();
        } else {
            console.log('fail to update row');
        }
    });
}

function btnOnDelete(id) {
    $.post('./3.removeData', { data: JSON.stringify(id) }, function (ret, status) {
        console.log(ret);
        if (ret.success) {
            $('#' + id).fadeOut(300, function () {
                $(this).remove();
                refreshData();
            });
        } else {
            console.log('fail to remove row');
        }
    })
}

function btnOnCancel(id) {
    $('#' + id + ' > .chgTag').each(function () {
        var oldtxt1 = $(".tmpTag", this).text();
        $(this).html(oldtxt1);
    });
    var oldtxt2 = $('#' + id + ' > .chgddTag').find('.tmpddTag').text();
    $('#' + id + ' > .chgddTag').html(oldtxt2);
    chgBtntoSaveState(id);
}

function chgBtntoEditState(id) {
    var str = '<a onclick="btnOnSave(\'' + id + '\');" class="btn green">SAVE<i class="fa fa-save" style="padding-left: 5px;"></i></a>';
    str += '<a class="btn red" onclick="btnOnCancel(\'' + id + '\');">CANCEL<i class="fa fa-refresh" style="padding-left: 5px;"></i></a>';
    $('#' + id + ' > .tarBtn').html(str);
}

function chgBtntoSaveState(id) {
    var str = '<a onclick="btnOnEdit(\'' + id + '\');" class="btn green">EDIT';
    str += '<i class="fa fa-pencil" style="padding-left: 5px;"></i></a>';
    str += '<a class="btn red" onclick="btnOnDelete(\'' + id + '\');">DELETE<i class="fa fa-trash" style="padding-left: 5px;"></i></a>';
    $('#' + id + ' > .tarBtn').html(str);
}