var padday = 0;
let ddStrProvince = '';

function onInitialize() {
    tools_reauthen('matask')
        .then(function(resauth) {
            return getTeam()
        })
        .then(function (resp) {
            return getProv();
        })
        .then(function (resp, resz) {
            return getZone(resp);
        })
        .then(function(resddz) {
            return new Promise(function(subresddz1) {
                $("#refddZone").html('<select id="ddZone" class="form-control" style="width: 100%;">' + resddz + "</select>");
                $("#ddZone").select2({ width: "resolve", dropdownParent: $("div.modal") });
                subresddz1('done subresddz1');
            });
        })
        .then(function (resddp) {
            $("#ttHide").click();

            $("#refddProv").html('<select id="ddProv" class="form-control" style="width: 100%;">' + ddStrProvince + "</select>");
            $("#ddProv").select2({ width: "resolve", dropdownParent: $("div.modal") })
                .on('select2:select', function (e) {
                    var data = e.params.data;
                    if (data.id != "0") {
                        getZone(data.id)
                            .then(function(resdd) {
                                return new Promise(function(inresdd) {
                                    $("#refddZone").html('<select id="ddZone" class="form-control" style="width: 100%;">' + resdd + '</select>');
                                    $("#ddZone").select2({ width: "resolve", dropdownParent: $("div.modal") });
                                    inresdd();
                                });
                            });
                    } else {
                        $("#refddZone").html('<select id="ddZone" class="form-control" style="width: 100%;"><option value="0">NO DATA</option></select>');
                        $("#ddZone").select2({ width: "resolve", dropdownParent: $("div.modal") });
                    }
                });
            $("#ddType").select2({ width: "resolve", dropdownParent: $("div.modal") });
            $("#ddTeam").select2({ width: "resolve", dropdownParent: $("div.modal") });

            toastr.options = {
                "closeButton": false,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-center",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "600",
                "timeOut": "2000",
                "extendedTimeOut": "0",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            }
        });
}

function tools_reauthen(current) {
    return new Promise(function(response) {
        var data = { 'location': current };
        $.post("../reauthen", data,
            function (ret, status) {
                if (ret.success !== 'true') {
                    window.location = "http://52.220.162.104";
                } else { }
                response();
            }
        );
    });
}

$(document).on('focusout', 'textarea.prv', function(){
    var name = $(this).val();
    if (name) {
        var d2s = {
            _id : $(this).data('id'),
            name: name
        }
        console.log(d2s);
        $.post('./5.updateProv', { data: JSON.stringify(d2s) }, function(ret, status) {
            toastr.info('แก้ไขชื่อจังหวัดเสร็จแล้ว');
        });
    }
});

$(document).on('focusout', 'textarea.zne', function(){
    var name = $(this).val();
    if (name) {
        var d2s = {
            _id : $(this).data('id'),
            name: name
        }
        console.log(d2s);
        $.post('./5.updateZone', { data: JSON.stringify(d2s) }, function(ret, status) {
            toastr.info('แก้ไขชื่อโซนเสร็จแล้ว');
        });
    }
});

var mTable = null;
function getTeam() {
    return new Promise(function (res) {
        $('#myTable').html('');
        var txtH = ["No.", "ชื่อช่าง", "ประเภท", "จังหวัด", "โซน", "ทีม", "จัดการ"];
        $.post('./5.getTeam', function (ret, err) {
            console.log(ret);
            var str = "<thead><tr>";
            str += "<th style='width: 1%;'>" + txtH[0] + "</th>";
            str += "<th style='width: 12%;'>" + txtH[1] + "</th>";
            str += "<th style='width: 1%;'>" + txtH[2] + "</th>";
            str += "<th style='width: 1%;'>" + txtH[3] + "</th>";
            str += "<th>" + txtH[4] + "</th>";
            str += "<th style='width: 1%;'>" + txtH[5] + "</th>";
            str += "<th style='width: 18%;'>" + txtH[6] + "</th>";
            str += "</tr></thead><tbody>";
            var c = 1;
            $.each(ret.staff, function (key, val) {
                var txtType = (val['type'] == 0) ? 'Indoor' : 'Outdoor';
                str += '<tr id="tr' + val['_id'] + '"><td>' + c + '</td><td>' + val['name'] + '</td><td>' + txtType + '</td><td data-pid="' + val['provinceid'] + '">' + val['pname'] + '</td><td data-zid="' + val['zoneid'] + '">' + val['zname'] + '</td>';
                switch (val['copid']) {
                    case 0:
                        str += '<td>NQM</td>';
                        break;
                    case 1:
                        str += '<td>DDVision</td>';
                        break;
                    case 2:
                        str += '<td>NSN</td>';
                        break;
                    case 3:
                        str += '<td>AFP</td>';
                        break;
                    default:
                        break;
                }
                str += '<td><button onclick="onEditRow(\'' + val['_id'] + '\', ' + val['status'] + ');" class="btn blue-steel"><i class="fa fa-pencil"></i></button>';
                if (val['status'] == 1) {
                    str += '<button class="btn red-thunderbird" onclick="toggleStatusTeam(\'' + val['_id'] + '\', 0)"><i class="fa fa-user-times"></i></button></td>';
                } else {
                    str += '<button class="btn green-meadow" onclick="toggleStatusTeam(\'' + val['_id'] + '\', 1)"><i class="fa fa-user"></i></button></td>';
                }
                str += "</tr>";
                c++;
            });
            str += "</tbody>";

            mTable = $('#myTable').html(str).DataTable();
            res('done');
        });
    });
}

function getZone(pid) {
    return new Promise(function (resolve) {
        $.post('./5.getAllZoneByPID', { data: JSON.stringify(pid) }, function (ret, status) {
            if (ret.success) {
                var str = "";
                for (var i = 0; i < ret.data.length; i++) {
                    var r = ret.data[i];
                    str += "<option value='" + r._id + "'>" + r.detail + "</option>";
                }
                resolve(str);
            } else { resolve('fail'); }
        });
    });
}

function getProv() {
    return new Promise(function (resolve) {
        $.post('./5.getProv', function (ret, status) {
            if (ret.success) {
                // var str = "<option value='0'>ALL</option>";
                var str = "";
                var firstid = null;
                var mngstr = '';
                if(ret.data.length == 0) {
                    str += '<option value="0">NO DATA</option>';
                } else {
                    for (var i = 0; i < ret.data.length; i++) {
                        var r = ret.data[i];
                        (firstid == null) ? firstid = r._id : null;
                        str += "<option value='" + r._id + "'>" + r.fname + "</option>";
                        mngstr += convTxtProv(r._id, r.fname);
                    }
                    ddStrProvince = str;
                }
                $('#frmProv').html(mngstr);
                resolve(firstid);
            } else { resolve('fail') }
        });
    });
}

function getZonebyID(pid) {
    return new Promise(function (done) {
        $.post('./5.getZonebyID', { data: JSON.stringify(pid) }, function (ret, status) {
            if (ret.success) {
                console.log(ret);
                var str = '';
                for (let j = 0; j < ret.result.length; j++) {
                    var row = ret.result[j];
                    str += convTxtZone(row._id, row.provid, row.detail);
                }
                $('#frmZone').html(str);
                $('#btnAddZ').attr('onclick', 'onAddZone(\'' + pid + '\')');
                $('#intZname').val('');
            } else { alert('fail'); }
            done();
        });
    });
}

function onAddZone(pid) {
    var d2s = { 
        'name' : $('#intZname').val().trim(), 
        'pid' : pid 
    };
    $.post('./5.addZone', {data: JSON.stringify(d2s)}, function(ret, status) {
        if (ret.success) {
            console.log(ret);
            toastr.success('ดำเนินการเพิ่มข้อมูลโซนเสร็จเรียบร้อย');
            $('#intZname').val('');
            getZonebyID(pid);
        } else { console.log(ret); }
    });
}

function onDelZone(id, pid) {
    var d2s = {
        _id : id
    };
    $.post('./5.deleteZone', {data: JSON.stringify(d2s)}, function(ret, status) {
        if (ret.success) {
            console.log(ret);
            toastr.success('ดำเนินการลบข้อมูลโซนเสร็จเรียบร้อย');
            getZonebyID(pid);
        } else { 
            console.log(ret); 
            toastr.error('เกิดข้อผิดพลาดในการลบข้อมูลโซน');
        }
    });
}

function onAddProv() {
    var d2s = {
        name : $('#intPname').val().trim()
    };
    $.post('./5.addProv', {data: JSON.stringify(d2s)}, function(ret, status) {
        if (ret.success) {
            console.log(ret);
            toastr.success('ดำเนินการเพิ่มข้อมูลจังหวัดเสร็จเรียบร้อย');
            getProv();
            $('#frmZone').html('');
            $('#intPname').val('');
        } else { console.log(ret); }
    });
}

function onDelProv(id) {
    var d2s = {
        _id : id
    };
    $.post('./5.deleteProv', {data: JSON.stringify(d2s)}, function(ret, status) {
        if (ret.success) {
            console.log(ret);
            toastr.success('ดำเนินการลบข้อมูลจังหวัดเสร็จเรียบร้อย');
            getProv();
        } else { 
            console.log(ret);
            toastr.error('เกิดข้อผิดพลาดในการลบข้อมูลจังหวัด');
        }
    });
}

function textAreaAdjust(o) {
    o.style.height = "34px";
    o.style.height = (o.scrollHeight) + "px";
}

function convTxtProv(id, name) {
    str = '<div class="form-group">';
    str += '<div class="col-md-9"><textarea data-id="' + id + '" onkeyup="textAreaAdjust(this);" class="form-control prv" style="height: 34px;">' + name + "</textarea></div>";
    str += '<div class="col-md-3"><button type="button" onclick="getZonebyID(\'' + id + '\')" class="btn blue-steel" style="margin-right: 4px;"><i class="fa fa-arrow-right"></i>';
    str += '</button><button type="button" class="btn red-thunderbird" onclick="onDelProv(\'' + id + '\')"><i class="fa fa-trash"></i></button></div></div>';
    return str;
}

function convTxtZone(id, pid, name) {
    str = '<div class="form-group">';
    str += '<div class="col-md-9"><textarea data-id="' + id + '" onkeyup="textAreaAdjust(this);" class="form-control zne" style="height: 34px;">' + name + "</textarea></div>";
    str += '<div class="col-md-3"><button type="button" onclick="onDelZone(\'' + id + "', '" + pid + '\')" class="btn red-thunderbird"><i class="fa fa-trash"></i></button>';
    str += "</div></div>";
    return str;
}

function clearModal() {
    $('#intName').val('');
    $('#ddProv').val(0).trigger('change');
    $('#ddZone').val(0).trigger('change');
    $('#ddType').val(-1).trigger('change');
    $('#ddTeam').val(-1).trigger('change');
}

function toggleStatusTeam(id, choice) {
    // choice  value in should be want to set
    var d2s = {
        _id: id,
        status: choice
    }
    $.post('./5.setStatus', { data: JSON.stringify(d2s) }, function (ret, status) {
        console.log(ret);
        recreateTable();
    });
}

function actUser(id) {

}

function addTeam() {
    var d2s = {
        copid: parseInt($('#ddTeam').val()),
        name: $('#intName').val(),
        pid: $('#ddProv').val(),
        type: parseInt($('#ddType').val()),
        zid: $('#ddZone').val(),
        status: 1
    }
    console.log(d2s);
    if (d2s.name.length > 0 && d2s.pid != 0 && d2s.zid != 0 && d2s.copid != -1 && d2s.type != -1) {
        $.post('./5.addTeam', { data: JSON.stringify(d2s) }, function (ret, status) {
            console.log(ret);
            $('#btnClose').click();
            recreateTable();
        });
    } else { alert("กรุณากรอกข้อมูลให้ครบถ้วน"); }
}

function onCancelRow(id) {
    var tr = $('#tr' + id);
    var indx = parseInt(tr.children().eq(0).html());
    $('td:nth-child(2) > input', tr).val(tmpObj[indx].name);
    tr.children().eq(1).html($('td:nth-child(2) > input', tr).val());

    $('#v2' + id).val(tmpObj[indx].ctype);
    var tdn2 = $('#v2' + id + ' option:selected', tr).text();
    tr.children().eq(2).html(tdn2);

    // $('#v3' + id).val(tmpObj[indx].pid);
    // var tdn3 = $('#v3' + id + ' option:selected', tr).text();
    tr.children().eq(3).html(tmpObj[indx].pname);

    // getZone(tmpObj[indx].pid)
    //     .then(function(resdd) {
    //         return new Promise(function(subresdd) {
    //             console.log(resdd);
    //             $('td:nth-child(5) > input', tr).html("<select id='v4" + id + "' style='width: " + $('thead > tr > th:nth-child(5)').css('width') + "px;'>" + resdd + "</select>");
    //             $('#v4' + id).val(tmpObj[indx].zid);
    //             // var tdn4 = $('#v4' + id + ' option:selected', tr).text();
    //             // console.log(tdn4);
    //             // tr.children().eq(4).html(tdn4);

    //             subresdd();
    //         });      
    //     });

    tr.children().eq(4).html(tmpObj[indx].zname);

    var tdn5 = '<button onclick="onEditRow(\'' + id + '\');" class="btn blue-steel"><i class="fa fa-pencil"></i></button>';
    if (tmpObj[indx].status == 1) {
        tdn5  += '<button onclick="toggleStatusTeam(\'' + id + '\', 0);" class="btn red-thunderbird"><i class="fa fa-user-times"></i></button>';
    } else {
        tdn5 += '<button onclick="toggleStatusTeam(\'' + id + '\', 1)" class="btn green-meadow"><i class="fa fa-user"></i></button></td>';
    }
    tr.children().eq(6).html(tdn5);
}

var tmpObj = [];
function onEditRow(id, status) {
    console.log('edit team id ' + id);
    var tr = $('#tr' + id);

    var name = tr.children().eq(1).html();
    var tdn1 = '<input id="v1' + id + '" class="form-control" type="text" value="' + name + '" />';
    tr.children().eq(1).html(tdn1);

    var ctype = tr.children().eq(2).html() == 'Indoor' ? 0 : 1;
    var tdn2 = '<select id="v2' + id + '" class="form-control"><option value=0>Indoor</option><option value=1>Outdoor</option></select>';
    tr.children().eq(2).html(tdn2);
    $('#v2' + id).val(ctype);

    var pid = $('td:nth-child(4)', tr).data('pid');
    $('td:nth-child(4)', tr).html("<select id='v3" + id + "' style='width: " + $('thead > tr > th:nth-child(4)').css('width') + "px;'>" + ddStrProvince + "</select>");
    $('#v3' + id).val(pid);
    $('#v3' + id).select2({ width: 'resolve' })
        .on('select2:select', function (e) {
            var data = e.params.data;
            if (data.id != "0") {
                getZone(data.id)
                    .then(function (resdd) {
                        
                        return new Promise(function (inresdd) {
                            $('td:nth-child(5)', tr).html("<select id='v4" + id + "' style='width: " + $('thead > tr > th:nth-child(5)').css('width') + "px;'>" + resdd + "</select>");
                            if (resdd.includes(zid)) {
                                $('#v4' + id).val(zid);
                           } else {
                                $('#v4' + id).val($("#v4" + id + " option:first").val());
                            }
                            $("#v4" + id).select2({ width: "resolve" });
                            inresdd();
                        });
                    });
            } else {
                $('td:nth-child(5)', tr).html("<select id='v4" + id + "' style='width: " + $('thead > tr > th:nth-child(5)').css('width') + "px;'><option value='0'>NO DATA</option></select>");
                $("#v4" + id).select2({ width: "resolve" });
            }
        });

    var zid = null;
    getZone(pid)
        .then(function (res) {
            return new Promise(function (subres) {
                zid = $('td:nth-child(5)', tr).data('zid');
                $('td:nth-child(5)', tr).html("<select id='v4" + id + "' style='width: " + $('thead > tr > th:nth-child(5)').css('width') + "px;'>" + res + "</select>");
                $('#v4' + id).val(zid);
                $("#v4" + id).select2({ width: "resolve" });
                
                var indx = parseInt(tr.children().eq(0).html());
                tmpObj[indx] = {
                    name: name,
                    ctype: ctype,
                    pid: pid,
                    pname: $('#v3' + id + ' option:selected').text(),
                    zid: zid,
                    zname: $('#v4' + id + ' option:selected').text(),
                    status: status
                };
                subres();
            });
        });

    var tdn5 = '<button onclick="onSaveRow(\'' + id + '\');" class="btn green-meadow"><i class="fa fa-save"></i></button>';
    tdn5 += '<button onclick="onCancelRow(\'' + id + '\');" class="btn grey-gallery"><i class="fa fa-times"></i></button>';
    tr.children().eq(6).html(tdn5);
}

function onSaveRow(id) {
    var d2s = {
        "_id": id,
        "name": $('#v1' + id).val(),
        "pid": $('#v3' + id).val(),
        "type": parseInt($('#v2' + id).val()),
        "zid": $('#v4' + id).val(),
    };
    // defend wrong input !
    $.post('./5.updateTeam', { data: JSON.stringify(d2s) }, function (ret, err) {
        recreateTable();
    });
}

function recreateTable() {
    mTable.clear();
    mTable.destroy();
    $('#myTable').empty();
    getTeam();
}
