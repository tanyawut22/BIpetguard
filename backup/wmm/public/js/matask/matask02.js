var globTypeObj = null;
var globPlanObj = null;
var selItem = null;
var padday = 0;

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

function onInitialize() {
    tools_reauthen('matask');
    getTypeCause();

    setTimeout(() => {
        getProv();
        setTimeout(() => {
            getTeams();
            setTimeout(() => {
                getMAPlan();
            }, 250);
        }, 50);
    }, 25);

    getMAPool();

    $('.ddTheme').select2({ width: 'resolve' });
    setTimeout(function () { $('#ttHide').click(); }, 150);
}

$('#ddTeam').change(function () {
    getTeams();
    getMAPlan();
});

$('#ddProv').change(function () {
    getTeams();
    getMAPlan();
});

$('#btnAddPool').click(function () {
    $('#reftxt').val('');
    $('#notePool').val('');
});

$('#intSearch').on("keyup", function (event) {
    var ints = $(this).val();
    if (event.keyCode == 13) {
        $(this).val('');
        var d2s = {
            'kw': ints
        };
        $.post('./2.search', { data: JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success) {
                console.log(ret.data);
                $('#ddTeam').select2('val', '0');
                $('#ddProv').select2('val', '0');

                padday = moment(ret.data.timestamp).diff(moment(), 'days');
                $('#txtDate').text(moment().add(padday, 'days').format('DD/MM/YY'));
                getTeams();
                setTimeout(function () { getMAPlan(); }, 250);

                var tgr = $("tr[name='" + ret.data.teamid + "']");
                $('html,body').animate({ scrollTop: tgr.offset().top }, 'slow');
            }
        });
    }
});

function randCode() {
    var mm = moment();
    var txt = '';
    $.post('./2.getCode', function (ret, status) {
        txt += 'MA' + mm.format('YYMM') + '' + ("0000" + ret.data[0].num).substr(-4, 4);
        $('#reftxt').val(txt);
    });
}

function getTeams() {
    var ch = parseInt($('#ddTeam').val());
    var pv = $('#ddProv').val();
    var d2s = { "copid": ch, "provinceid": pv };

    $.post('./2.getTeamMA', { "data": JSON.stringify(d2s) }, function (ret, status) {
        if (ret.success) {
            var str = '';
            for (var i = 0; i < ret.data.length; i++) {
                var row = ret.data[i];
                if (row.type == 1) {
                    str += '<tr name="' + row._id + '"><td class="bold font-blue-steel">' + row.name + '</td>';
                } else {
                    str += '<tr name="' + row._id + '"><td class="bold font-green-jungle">' + row.name + ' (indoor)</td>';
                }
                str += '<td onclick="mapIch2slot(0, \'' + row._id + '\', this)"; style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                str += '<td onclick="mapIch2slot(1, \'' + row._id + '\', this)"; style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                str += '<td onclick="mapIch2slot(2, \'' + row._id + '\', this)"; style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                str += '<td onclick="mapIch2slot(3, \'' + row._id + '\', this)"; style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                str += '</tr>';
            }
            $('#tarTb').html(str);
        } else {
        }
    });
}

function getMAPool() {
    $("#poolbtn").html('');
    $.post('./2.getItemPool', function (ret, status) {
        if (ret.success) {
            for (var i = 0; i < ret.data.length; i++) {
                var r = ret.data[i];
                $("#poolbtn").append(templateBtnObj(r._id, r.typeobj.color, r.typeobj.name, r.typeobj.icon, r.typeobj._id, r.reftxt));
                $('#idCh' + r._id).iCheck({
                    checkboxClass: 'icheckbox_square-green'
                });
                $('.icheckbox_square-green').css({ "margin-right": "0px" });
            }

            for (var i = 0; i < ret.data.length; i++) {
                var r = ret.data[i];
                $('#idCh' + r._id).on('ifChecked', function () {
                    console.log(r._id + ' check');
                    selItem = $(this).context.id;
                    selItem = selItem.substring(4, selItem.length);
                });
                $('#idCh' + r._id).on('ifUnchecked', function () {
                    console.log(r._id + ' uncheck');
                    selItem = null;
                });
            }
        }
    });
}

function getTypeCause() {
    $.post('./2.getTypeMA', function (ret, status) {
        globTypeObj = ret.data;
        if (ret.success) {
            var str = '';
            for (var i = 0; i < ret.data.length; i++) {
                var row = ret.data[i];
                str += '<option value="' + i + '">' + row.name + '</option>';
            }
            $('#ddSymp').html(str);
            $('#ddSymp').select2();
        }
    });
}

function getMAPlan() {
    var start = moment().set({ 'hour': 0, 'minute': 0, 'second': 00, 'milliseconds': 000 }).add(padday, 'days').toDate();
    var end = moment().set({ 'hour': 23, 'minute': 59, 'second': 59, 'milliseconds': 000 }).add(padday, 'days').toDate()
    var d2s = { "start": start, "end": end };

    $.post('./2.getPlanMA', { data: JSON.stringify(d2s) }, function (ret, status) {
        if (ret.success) {
            globPlanObj = ret.data;
            for (var i = 0; i < globPlanObj.length; i++) {
                // renderIcon(globPlanObj[i]);
                renderIcon(i);
            }
        } else {
            console.log('fail to load MA plan');
        }
    });
}

function getProv() {
    $.post('./2.getProv', function (ret, status) {
        if (ret.success) {
            var str = "<option value='0'>ALL</option>";
            for (var i = 0; i < ret.data.length; i++) {
                var r = ret.data[i];
                str += "<option value=" + r._id + ">" + r.fname + "</option>";
            }
            $('#ddProv').append(str);
            getTeams();
        } else {

        }
    });
}

function addItemInPool() {
    var refer = $('#reftxt').val();
    var obj = globTypeObj[$('#ddSymp').val()];
    var note = $('#notePool').val();
    var data2add = {
        "typeid": obj._id,
        "reftxt": refer,
        "timestp": new Date(),
        "note": note
    };
    /* ====== 
    0 -- open
    1 -- assign
    2 -- close
    */
    $.post('./2.saveItem2Pool', { data: JSON.stringify(data2add) }, function (ret, status) {
        if (ret.success) {
            $("#poolbtn").append(templateBtnObj(ret.data._id, obj.color, obj.name, obj.icon, obj._id, refer));
            $('#idCh' + ret.data._id).iCheck({
                checkboxClass: 'icheckbox_square-green',
            });
            $('.icheckbox_square-green').css({ "margin-right": "0px" });
            $('#idCh' + ret.data._id).on('ifChecked', function () {
                selItem = $(this).context.id;
                selItem = selItem.substring(4, selItem.length);
            });
            $('#basic').modal('toggle');
            getMAPool();
            getTypeCause();
        } else {
            console.log('fail');
        }
    });
}

function mapIch2slot(slotID, teamID, inThis) {
    if (selItem != null) {
        $(inThis).attr('onclick', '').unbind('click');
        var selObj = $('#content' + selItem).children().eq(1);
        var d2s = {
            data: {
                "teamid": teamID,
                "typeid": selObj.data('typeid'),
                "slot": slotID,
                "status": "ASSIGN",
                "timestamp": moment().add(padday, 'days').toDate(),
                "reftxt": selObj.data('ref'),
                "note": $('#notePool').val()
            },
            "poolid": selItem
        };
        // console.log(d2s);
        $.post('./2.saveTaskMA', { data: JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success) {
                var tmp = selObj.clone().wrap('<div/>').parent().html();
                $('#content' + selItem).fadeOut(300, function () {
                    $(this).remove();
                    $(inThis).html(tmp);
                    selItem = null;
                    getMAPlan();
                });
            }
        });
    } else {
        // console.log('else');
    }
}

function load2modal(inThis) {
    var point = $(inThis).data('pointer');
    var d2s = {
        // 'typeid': $(inThis).data('typeid'),
        'typeid': globPlanObj[point].typeid,
        // '_id': $(inThis).data('pid')
        '_id': globPlanObj[point]._id
    };

    $.post('./2.getDetailPlanMA', { data: JSON.stringify(d2s) }, function (ret, status) {
        if (ret.success) {
            // $('#txtRef').text($(inThis).data('ref'));
            $('#txtRef').text(globPlanObj[point].reftxt);
            $('#txtCau').text(ret.data.name);
            // $("#txtNote").val($(inThis).data('note'));
            $("#txtNote").val(globPlanObj[point].note);
            // $('#ddUptSlot').select2('val', ($(inThis).data('slot') + ""));
            $('#ddUptSlot').select2('val', (globPlanObj[point].slot + ""));
            $('#tgrUptPlanMA').attr({ 'onclick': 'updateTaskPlanMA(\'' + d2s._id + '\')' });
            $('#tgrUptDel').attr({ 'onclick': 'delTaskPlan(\'' + d2s._id + '\')' });
            // if ($(inThis).data('status') == "ASSIGN") {
            if (globPlanObj[point].status == "ASSIGN") {
                $('#txtSta').select2("val", "0");
                // $('#tgrUptPlanMA').attr({ 'onclick': 'updateTaskPlanMA(\'' + d2s._id + '\')' });
            } else {
                $('#txtSta').select2("val", "1");
                // $('#tgrUptPlanMA').attr({ 'onclick': 'updateTaskPlanMA(null)' });
            }
            $('#uptDate').val(moment(globPlanObj[point].timestamp).format('MM/DD/YYYY'));
            $('#uptDate').datepicker({ format: 'mm/dd/yyyy', autoclose: true });
        } else { }
    });
}

function loadDatabyDate(dpad) {
    switch (dpad) {
        case 2:
            padday += -1;
            if (padday == 0) {
                $('#txtDate').text('TODAY');
            } else {
                $('#txtDate').text(moment().add(padday, 'days').format('DD/MM/YY'));
            }
            getTeams();
            setTimeout(function () { getMAPlan(); }, 250);
            break;
        case 0:
            padday = 0;
            $('#txtDate').text('TODAY');
            getTeams();
            setTimeout(function () { getMAPlan(); }, 250);
            break;
        case 1:
            padday += 1;
            if (padday == 0) {
                $('#txtDate').text('TODAY');
            } else {
                $('#txtDate').text(moment().add(padday, 'days').format('DD/MM/YY'));
            }
            getTeams();
            setTimeout(function () { getMAPlan(); }, 250);
            break;
        default:
            break;
    }
}

function updateTaskPlanMA(inID) {
    var dtTmp = $('#uptDate').datepicker("getDate");
    var d2s = {
        "_id": inID,
        "data": {
            "note": $('#txtNote').val(),
            "status": $('#txtSta').val(),
            "slot": parseInt($('#ddUptSlot').val()),
            "objTime": {
                'd': dtTmp.getDate(),
                'm': dtTmp.getMonth(),
                'y': dtTmp.getFullYear()
            }
        }
    };
    // console.log(d2s);
    if (inID != null) {
        $.post('./2.uptDetailPlanMA', { data: JSON.stringify(d2s) }, function (ret, status) {
            console.log(ret);
            if (ret.success) {
                $('#uptDate').datepicker('update');
                $('#tgrUptClose').click();
                $('#tgrUptPlanMA').attr({ 'onclick': 'updateTaskPlanMA(null)' });
                $('#tgrUptDel').attr({ 'onclick': 'delTaskPlan(null)' });
                getTeams();
                setTimeout(() => {
                    getMAPlan();
                }, 25);
            } else { }
        });
    }
}

function delTaskPlan(inID) {
    $.post('./2.delTaskPlan', { data: JSON.stringify(inID) }, function (ret, status) {
        if (ret.success) {
            getTeams();
            setTimeout(function () { getMAPlan(); }, 500);
            $('#tgrUptClose').click();
        }
    });
}

function renderIcon(r) {
    setTimeout(function () {
        var str = '<button type="button" data-toggle="modal" onclick="load2modal(this);" href="#detail"';
        // str += 'data-status="' + r.status + '" data-pid="' + r._id + '" data-typeid="' + r.typeid + '"';
        // str += 'data-ref="' + r.reftxt + '" data-note="' + r.note + '"  data-slot="' + r.slot + '" class="btn ' + r.color + '">';
        str += 'data-pointer="' + r + '" class="btn ' + globPlanObj[r].color + '">';
        // str += '<i class="fa fa-' + r.icon + '"></i></button>';
        str += '<i class="fa fa-' + globPlanObj[r].icon + '"></i></button>';
        var tmpObj = $('tr[name="' + globPlanObj[r].teamid + '"]').children().eq(globPlanObj[r].slot + 1);
        tmpObj.html(str);
        tmpObj.attr('onclick', '').unbind('click');
        // if (r.status == "COMPLETE")
        if (globPlanObj[r].status == "COMPLETE")
            tmpObj.addClass('bg-green-jungle bg-font-green-jungle');
        else
            tmpObj.removeClass('bg-green-jungle bg-font-green-jungle');
    }, 50);
}

function templateBtnObj(poolid, color, text, icon, typeid, refer) {
    var out = '';
    if (text.length <= 10) {
        out = text;
    } else if (text.length > 10 && text.length <= 20) {
        out = text.substring(0, 9) + '<br>' + text.substring(10, text.length);
    } else {
        out = text.substring(0, 9) + '<br>' + text.substring(10, 20) + '..';
    }
    var str = '<div id="content' + poolid + '" class="btn-group btn-group-solid" style="padding: 2px;">';
    str += '<button type="button" class="btn ' + color + '" style="min-height: 36px; font-size: 8px; min-width: 76px;">' + out + '</button>';
    str += '<button type="button" class="btn ' + color + '" data-toggle="tooltip" data-placement="top" title="Tooltip on top" style="min-height: 36px;" data-typeid="' + typeid + '" data-ref="' + refer + '">';
    str += '<i class="fa fa-' + icon + '"></i></button>';
    str += '<button type="button" class="btn ' + color + '">';
    str += '<input id="idCh' + poolid + '" type="checkbox" class="myiCh">';
    str += '</button>';
    str += '</div>';
    return str;
}

var objPool = [
    // {_id: 1, type_id: ObjectID(), timestamp: '', ref: 'JB18-', note:}
];
