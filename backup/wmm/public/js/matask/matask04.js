var padday = 0;
var timeLoopId = null;
const regex = /(.*)(\d{2}\u002f\d{2}\u002f\d{4} )(\d{2}\:\d{2}.*\:\d{2})(.*)/gmi;

function autoLoadData() {
    getTeams()
    .then(function(res) {
        return getMAPlan();
    });
}

function onInitialize() {
    tools_reauthen('matask');

    getProv()
        .then(function(res1) {
            return getZone();
        })
        .then(function(res2) {
            return getTeams();
        })
        .then(function(res3) {
            return getMAPlan();
        })
        .then(function(res4) {
            $('#ttHide').click();
        });

    $('.ddTheme').select2({ width: 'resolve' });
    $('#txtDate').text('TODAY (' + moment().format('DD/MM/YY') + ' )');

    timeLoopId = window.setInterval(autoLoadData, 300000);
}

$('#ddTeam').change(function () {
    getTeams()
        .then(function(res1) {
            return getMAPlan();
        });
});

$('#ddProv').change(function () {
    getZone()
        .then(function(res2) {
            return getTeams();
        })
        .then(function(res3) {
            return getMAPlan();
        });
});

$('#ddZone').change(function () {
    getTeams().then(function() {
        return getMAPlan();
    });
});

$('#intSearch').on("keyup", function (event) {
    if (event.keyCode == 13) {
        search();
    }
});

var fnc_onChangeDDSlot = function () {
    var str = $('#noteTask').val().replace(/(?:\r\n|\r|\n)/g, '|');
    var newSlot = parseInt($(this).val());

    var m;
    var arrTmp = [];

    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
            if (groupIndex != 0)
                arrTmp.push(match);
        });
    }
    if (arrTmp.length != 0) {
        switch (newSlot) {
            case 0:
                arrTmp[2] = '09:00 - 12:00';
                break;
            case 1:
                arrTmp[2] = '12:30 - 15:30';
                break;
            // case 2:
            //     arrTmp[2] = '14:00 - 16:00';
            //     break;
            case 2:
                arrTmp[2] = '16:00 - 19:00';
                break;
            default:
                break;
        };
        var newNote = arrTmp.join('');
        $('#noteTask').val(newNote.replace(/(?:\|)/g, '\r\n'));
    }
}

$('#ddSlot').change(fnc_onChangeDDSlot);

$('#dateTask').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked' }).on('changeDate', function (e) {
    var txtNewDate = moment(e.date).format('DD/MM/YYYY ');
    var str = $('#noteTask').val().replace(/(?:\r\n|\r|\n)/g, '|');
    var m;
    var arrTmp = [];
    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
            if (groupIndex != 0)
                arrTmp.push(match);
        });
    }
    if (arrTmp.length != 0) {
        arrTmp[1] = txtNewDate;
        var newNote = arrTmp.join('');
        $('#noteTask').val(newNote.replace(/(?:\|)/g, '\r\n'));
    }
});

$(document).keyup(function (e) {
    if (e.which == 27 && $('body').hasClass('modal-open')) {
        clearModal();
    }
});

$(document).click(function (e) {
    if (e.target === $('.modal')[0] && $('body').hasClass('modal-open')) {
        clearModal();
    }
});

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

function search() {
    var d2s = { 'kw': $("#intSearch").val() };

    $.post('./4.search', { data: JSON.stringify(d2s) }, function (ret, status) {
        if (ret.success) {
            $("#intSearch").val('');
            padday = Math.round(moment(ret.data.timestamp).diff(moment(), 'days', true), 0);
            $('#txtDate').text(moment().add(padday, 'days').format('DD/MM/YY'));

            $('#ddTeam').val(ret.datateam.copid).trigger('change');
            setTimeout(() => {
                if (ret.datateam.provinceid != null) $('#ddProv').val(ret.datateam.provinceid).trigger('change');
                setTimeout(() => {
                    if (ret.datateam.zoneid != null) $('#ddZone').val(ret.datateam.zoneid).trigger('change');
                    setTimeout(() => {
                        var tgr = $("tr[name='" + ret.data.teamid + "']");
                        $('html,body').animate({ scrollTop: tgr.offset().top }, 'slow');
                        $(' > td', tgr).eq(ret.data.slot + 1).css({ 'border': '3px solid black' });
                        setTimeout(() => {
                            $(' > td', tgr).eq(ret.data.slot + 1).css({ 'border': '' });
                        }, 5000);
                    }, 500);
                }, 500);
            }, 500);
        } else { }
    });
}

function getProv() {
    return new Promise(function(resolve) {
        $.post('./2.getProv', function (ret, status) {
            if (ret.success) {
                var str = "<option value='0'>ALL</option>";
                for (var i = 0; i < ret.data.length; i++) {
                    var r = ret.data[i];
                    str += "<option value=" + r._id + ">" + r.fname + "</option>";
                }
                $('#ddProv').html(str);
                resolve(str);
            } else { resolve('fail') }
        });
    });
}

function getZone() {
    return new Promise(function(resolve) {
        var pvid = $('#ddProv').val();
        $.post('./4.getZone', { "data": JSON.stringify(pvid) }, function (ret, status) {
            if (ret.success) {
                var str = "<option value='0'>ALL</option>";
                for (var i = 0; i < ret.data.length; i++) {
                    var r = ret.data[i];
                    str += "<option value=" + r._id + ">" + r.detail + "</option>";
                }
                $('#ddZone').html(str);
                resolve(str);
            } else { resolve('fail'); }
        });
    });
}

function getTeams() {
    return new Promise(function(resolve) {
        var ch = parseInt($('#ddTeam').val());
        var pv = $('#ddProv').val();
        var zo = $('#ddZone').val();
        // var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var mm = moment().add(padday, 'days');
        var m = mm.get('M'), y = mm.get('Y');
        var firstDay = new Date(y, m, 1, 0, 0, 0);
        var lastDay = new Date(y, m + 1, 0, 23, 59, 59);
    
        var d2s = { "copid": ch, "provinceid": pv, "zoneid": zo, 'start': firstDay, 'end': lastDay };
        $.post('./4.getTeamMA', { "data": JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success) {
                var str = '';
                for (var i = 0; i < ret.data.length; i++) {
                    var row = ret.data[i];
                    if (row.type == 1) {
                        str += '<tr name="' + row._id + '"><td style="vertical-align: middle;" class="bold font-blue-steel">' + row.name;
                    } else {
                        str += '<tr name="' + row._id + '"><td style="vertical-align: middle;" class="bold font-green-jungle">' + row.name + ' (indoor)';
                    }
                    if (row.status) {
                        str += ' <span>(' + row.wlcount + ')</span><span class="btnResvAll" style="float: right;"><button type="button" data-toggle="modal" onclick="openDialogBatch(\'' + row._id + '\')" href="#basic" class="btn btn-xs grey-silver"><i class="fa fa-arrow-right"></i></button></span></td>';
        
                        str += '<td onclick="mapIcon2Slot(0, \'' + row._id + '\');" style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                        str += '<td onclick="mapIcon2Slot(1, \'' + row._id + '\');" style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                        str += '<td onclick="mapIcon2Slot(2, \'' + row._id + '\');" style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
                        str += '<td onclick="" style="text-align: center; color: black;"></td>';
                    } else {
                        str += '<td colspan="4" style="text-align:center; font-weight: bold; color: #e7505a;">restricted user</td>';
                    }
                    str += '</tr>';
                }
                $('#tarTb').html(str);
                resolve(str);
            } else { resolve('fail'); }
        });
    });
}

function getMAPlan() {
    var start = moment().set({ 'hour': 0, 'minute': 0, 'second': 00, 'milliseconds': 000 }).add(padday, 'days').toDate();
    var end = moment().set({ 'hour': 23, 'minute': 59, 'second': 59, 'milliseconds': 000 }).add(padday, 'days').toDate()
    var d2s = { "start": start, "end": end };
    return new Promise(function(resolve) {
        $.post('./4.getMAPlan', { data: JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success) {
                var str = "";
                var tmpObj = null, row = null;
                for (var i = 0; i < ret.data.length; i++) {
                    row = ret.data[i];
                    // if (row.slot != null && !row.multi) {
                    //     if (row.typeid == 0) { str = renderBBCs(row._id); }
                    //     else if (row.typeid == 1) { str = renderCC(row._id); }
                    //     $('tr[name="' + row.teamid + '"] > td > .btnResvAll').remove();
    
                    //     tmpObj = $('tr[name="' + row.teamid + '"]').children().eq(row.slot + 1);
                    //     tmpObj.attr('onclick', '').unbind('click');
                    //     tmpObj.html(str);
                    // } else {
                    //     $('tr[name="' + row.teamid + '"] > td > .btnResvAll').remove();
    
                    //     for (var j = 1; j <= 3; j++) {
                    //         tmpObj = $('tr[name="' + row.teamid + '"]').children().eq(j);
                    //         tmpObj.attr('onclick', '').unbind('click');
                    //         tmpObj.html(renderBBCs(row._id));
                    //     }
                    // }
                    
                    for (var j = 0; j < 3; j++) {
                        var subSlot = row.boolSlot[j];
                        str = (row.typeid == 0) ? renderBBCs(row._id, j) : renderCC(row._id, j);
                        if (subSlot) {
                            $('tr[name="' + row.teamid + '"] > td > .btnResvAll').remove();
    
                            tmpObj = $('tr[name="' + row.teamid + '"]').children().eq(j + 1);
                            tmpObj.attr('onclick', '').unbind('click');
                            tmpObj.html(str);
                        } else {  }
                    }
                }
                resolve('success');
            } else { resolve('fail'); }
        });
    });
}

var isContainT = function (element) {
    return element;
};

function mapIcon2Slot(slot, inID) {
    $('tr[name="' + inID + '"] > td').eq(slot + 1).attr('onclick', '');
    $('tr[name="' + inID + '"] > td').eq(slot + 1).html(renderBtnBBCs(slot, inID) + '' + renderBtnCC(slot, inID) + '' + renderBtnCancel(slot, inID));
}

const renderBBCs = function (id, inSlot) {
    return '<button type="button" data-toggle="modal" onclick="load2Modal(\'' + id + '\', this, ' + inSlot + ');" href="#basic" class="btn blue"><i class="fa fa-wrench"></i></button>';
}

const renderCC = function (id, inSlot) {
    return '<button type="button" data-toggle="modal" onclick="load2Modal(\'' + id + '\', this, ' + inSlot + ');" href="#basic" class="btn green-seagreen"><i class="fa fa-phone"></i></button>';
}

const renderBtnBBCs = function (slot, id) {
    return '<button type="button" data-toggle="modal" onclick="openDialog(\'' + id + '\', ' + slot + ', 0);" href="#basic" class="btn blue"><i class="fa fa-wrench"></i></button>';
}

const renderBtnCC = function (slot, id) {
    return '<button type="button" data-toggle="modal" onclick="openDialog(\'' + id + '\', ' + slot + ', 1);" href="#basic" class="btn green-seagreen"><i class="fa fa-phone"></i></button>';
}

const renderBtnCancel = function (slot, id) {
    return '<button type="button" onclick="delIcon(\'' + id + '\', ' + slot + ');" class="btn red-thunderbird"><i class="fa fa-close"></i></button>';
}

function addTask(inSlot, inID, inType, isBatch) {
    if (!isBatch) {
        if (inSlot != null && inID != null) {
            var d2s = {
                data: {
                    slot: inSlot,
                    boolSlot: [(inSlot == 0) ? true : false, (inSlot == 1) ? true : false, (inSlot == 2) ? true : false],
                    teamid: inID,
                    timestamp: moment().add(padday, 'days').toDate(),
                    reftext: $('#refTask').val(),
                    note: $('#noteTask').val(),
                    typeid: inType,
                    multi: false
                },
                compare: {
                    st: moment({ 'hour': 0, 'minute': 0, 'second': 0, 'milliseconds': 000 }).add(padday, 'days').toDate(),
                    ed: moment({ 'hour': 23, 'minute': 59, 'second': 59, 'milliseconds': 999 }).add(padday, 'days').toDate()
                }
            };
            $.post('./4.addTask', { data: JSON.stringify(d2s) }, function (ret, status) {
                if (ret.success) {
                    if (inType == 0) {
                        var str = renderBBCs(ret.data._id, inSlot);
                    } else if (inType == 1) {
                        var str = renderCC(ret.data._id, inSlot);
                    }
                    $('tr[name="' + inID + '"] > td').eq(inSlot + 1).html(str);
                    $('#btnClose').click();
                    $('tr[name="' + inID + '"] > td').eq(0).text(
                        updatetxt($('tr[name="' + inID + '"] > td').eq(0).text(), 1)
                    );
                } else { alert("fail to add batch slot MA !!"); }
            });
        }
    } else {
        if (inID != null) {
            var d2s = {
                data: {
                    slot: null,
                    boolSlot: [true, true, true],
                    teamid: inID,
                    timestamp: moment({ 'hour': 0, "minute": 0, "second": 0, "milliseconds": 000 }).add(padday, 'days').toDate(),
                    reftext: $('#refTask').val(),
                    note: $('#noteTask').val(),
                    typeid: inType,
                    multi: true
                },
                compare: {
                    st: moment({ 'hour': 0, 'minute': 0, 'second': 0, 'milliseconds': 000 }).add(padday, 'days').toDate(),
                    ed: moment({ 'hour': 23, 'minute': 59, 'second': 59, 'milliseconds': 999 }).add(padday, 'days').toDate()
                }
            };
            $.post('./4.addTask', { data: JSON.stringify(d2s) }, function (ret, status) {
                if (ret.success) {
                    for (let i = 1; i <= 3; i++) {
                        $('tr[name="' + inID + '"] > td').eq(i).attr('onclick', '');
                        $('tr[name="' + inID + '"] > td').eq(i).html(renderBBCs(ret.data._id, (i - 1)));
                        $('tr[name="' + inID + '"] > td').eq(0).text(
                            updatetxt($('tr[name="' + inID + '"] > td').eq(0).text(), 1)
                        );
                    }

                    $('#btnClose').click();
                } else { alert("fail to add batch slot MA !!"); }
            });
        }
    }
}

function replacerAdd(match, p1, offset, string) {
    var txt = match.substring(0, match.length - 1 - (p1.length));
    return txt + (parseInt(p1) + 1) + ')';
}

function replacerDel(match, p1, offset, string) {
    var txt = match.substring(0, match.length - 1 - (p1.length));
    return txt + (parseInt(p1) - 1) + ')';
}

function updatetxt(inTxt, meth) {
    var regexp = /.*\((\d*)\)/i;
    if (meth == 1)
        var txt = inTxt.replace(regexp, replacerAdd);
    else
        var txt = inTxt.replace(regexp, replacerDel);
    return txt;
}

var tmpObj = null;
function delTask(inID, inTgr) {
    var trParent = tmpObj.parent();
    $.post('./4.delTaskNew', { data: JSON.stringify({ "_id": inID, "indx": inTgr }) }, function (ret, status) {
        if (ret.success) {
            // console.log(ret.data);
            //     $('#btnClose').click();
            //     tmpObj = $('tr[name="' + ret.data.teamid + '"] > td');
            //     for (let i = 1; i <= 3; i++) {
            //         tmpObj.eq(0).text(updatetxt(tmpObj.eq(0).text(), -1));
            //         tmpObj.eq(i).html('<a class="btn btn-icon-only"><i class="fa fa-plus"></i></a>');
            //         tmpObj.eq(i).attr('onclick', 'mapIcon2Slot(' + (i - 1) + ', \'' + ret.data.teamid + '\');');
            //     }
            //     var str = '<span class="btnResvAll" style="float: right;"><button type="button" data-toggle="modal" onclick="openDialogBatch(\'' + ret.data.teamid + '\')" href="#basic" class="btn btn-xs grey-silver"><i class="fa fa-arrow-right"></i></button></span>';
            //     tmpObj.eq(0).append(str);

            $('#btnClose').click();
            $(tmpObj).fadeOut("fast", () => {
                tmpObj.remove();
                tmpObj = null;
                trParent.html('<a class="btn btn-icon-only"><i class="fa fa-plus"></i></a>');
                var tmpSlot = (ret.data.slot == null) ? inTgr : ret.data.slot;
                trParent.attr('onclick', 'mapIcon2Slot(' + tmpSlot + ', \'' + ret.data.teamid + '\');');

                setTimeout(() => {
                    if ($('tr[name="' + ret.data.teamid + '"] > td').eq(1).html().includes('fa-plus')) {
                        setTimeout(() => {
                            if ($('tr[name="' + ret.data.teamid + '"] > td').eq(2).html().includes('fa-plus')) {
                                setTimeout(() => {
                                    if ($('tr[name="' + ret.data.teamid + '"] > td').eq(3).html().includes('fa-plus')) {
                                        var str = '<span class="btnResvAll" style="float: right;"><button type="button" data-toggle="modal" onclick="openDialogBatch(\'' + ret.data.teamid + '\')" href="#basic" class="btn btn-xs grey-silver"><i class="fa fa-arrow-right"></i></button></span>';
                                        $('tr[name="' + ret.data.teamid + '"] > td').eq(0).append(str);
                                    } else {}
                                }, 100);
                            } else {
                                faddResv = false;
                            }
                        }, 100);
                    } else {
                        faddResv = false;
                    }
                }, 100);
            });


                
            $('tr[name="' + ret.data.teamid + '"] > td').eq(0).text(
                updatetxt($('tr[name="' + ret.data.teamid + '"] > td').eq(0).text(), -1)
            );
            
        }
    });
}

function clearModal() {
    $('#refTask').val('');
    $('#noteTask').val('');
    $('#btnAddItem').attr('onclick', 'addTask(null, null, null, null);');
    $('#btnAddItem').text('ADD');
    $('#btnDel').hide();
    $('#btnDel').attr('onclick', 'delTask(null, null)');
    $('#hidDateTask').val('');
    $('#ddSlot').select2('enable');
}

/* ==========
0 - BBCs Assign by yourself
1 - Call Center Assigned
*/
function openDialog(id, slot, typeIn) {
    $('#ddSlot').select2("enable");
    var txtteam = $('tr[name="' + id + '"]').children().eq(0).text().slice(0, -4);
    if (typeIn == 0) {
        $('#btnAddItem').attr('onclick', 'addTask(' + slot + ', "' + id + '", 0, false)');
    } else {
        $('#btnAddItem').attr('onclick', 'addTask(' + slot + ', "' + id + '", 1, false)');
    }
    $('#ddSlot').select2('val', slot + "");
    var objDate = moment().add(padday, 'days').format('DD/MM/YYYY');
    $('#dateTask').val(objDate);
    $('#dateTask').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked' });
    $('#dateTask').datepicker('update');
    var txtSlot = '';
    switch (slot) {
        case 0:
            txtSlot = '09:00 - 12:00 น.';
            break;
        case 1:
            txtSlot = '12:30 - 15:30 น.';
            break;
        // case 2:
        //     txtSlot = '14:00 - 16:00 น.';
        //     break;
        case 2:
            txtSlot = '16:00 - 19:00 น.';
            break;
        default:
            break;
    }
    $('#noteTask').val('JOB ID : \nnon : \nTel. : \nเวลานัดหมาย : ' + objDate + ' ' + txtSlot + '\nจ่ายงานให้ : ' + txtteam);
}

function openDialogBatch(inID) {
    $('#ddSlot').select2('val', '0');
    $('#ddSlot').select2("enable", false);
    $('#btnAddItem').attr('onclick', 'addTask(null, "' + inID + '", 0, true)');
    var txtteam = $('tr[name="' + inID + '"]').children().eq(0).text().slice(0, -4);
    var objDate = moment().add(padday, 'days').format('DD/MM/YYYY');
    $('#dateTask').val(objDate);
    $('#dateTask').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked' });
    $('#dateTask').datepicker('update');
    var txtSlot = '09:00 - 19:00 น.';
    $('#noteTask').val('JOB ID : \nnon :  \nTel. : \nเวลานัดหมาย : ' + objDate + ' ' + txtSlot + '\nจ่ายงานให้ : ' + txtteam);
}

function delIcon(id, slot) {
    var str = '<td onclick="mapIcon2Slot(' + slot + ', \'' + id + '\');" style="text-align: center; color: black;"><a class="btn btn-icon-only"><i class="fa fa-plus"></i></a></td>';
    $('tr[name="' + id + '"] > td').eq(slot + 1).replaceWith(str);
}

var globTmp = null;
function load2Modal(maid, inThis, indxTD) {
    tmpObj = $(inThis);
    $.post('./4.loadDetail', { data: JSON.stringify(maid) }, function (ret, status) {
        if (ret.success) {
            globTmp = ret.data;
            // if (ret.data.slot == null) {
            $('#btnDel').attr('onclick', 'delTask("' + ret.data._id + '", ' + indxTD + ');');
            // } else {
                // $('#btnDel').attr('onclick', 'delTask("' + ret.data._id + '", ' + ret.data.slot + ');');
            // }

            (globTmp.slot != null) ? $('#btnAddItem').attr('onclick', 'uptTask("' + ret.data._id + '", false);') : $('#btnAddItem').attr('onclick', 'uptTask("' + ret.data._id + '", true);');
            $('#hidDateTask').val(globTmp.timestamp);
            $('#refTask').val(globTmp.reftext);
            $('#noteTask').val(globTmp.note.replace('/r/n', '<br/>'));
            $('#btnAddItem').text('UPDATE');
            $('#btnDel').show();
            (globTmp.slot != null) ? $('#ddSlot').select2('val', globTmp.slot + "") : $('#ddSlot').select2("enable", false);

            $('#dateTask').val(moment(globTmp.timestamp).format('DD/MM/YYYY'));
            $('#dateTask').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked' });
            $('#dateTask').datepicker('update');
        }
    });
}

function uptTask(inID, isBatch) {
    var dtExist = moment($('#hidDateTask').val());
    var dtEdit = moment($('#dateTask').datepicker("getDate").toISOString()).set(
        { 'hour': dtExist.hour(), 'minute': dtExist.minute(), 'second': dtExist.second() }
    );

    var intSlot = parseInt($('#ddSlot').val());
    var ddiff = dtEdit.diff(dtExist, 'days', true);
    ddiff = Math.round(ddiff * 100) / 100;
    var tmpBool = [false, false, false];
    tmpBool[intSlot] = true;

    var d2s = {
        "maid": inID,
        "data": {
            "reftext": $('#refTask').val(),
            "note": $('#noteTask').val(),
            "slot": intSlot,
            "timestamp": dtExist.add(ddiff, 'days').toDate(),
            'boolSlot': (globTmp.multi) ? globTmp.boolSlot : tmpBool ,
        },
        "compare": {
            "st": moment($('#dateTask').datepicker("getDate").toISOString()).set({ 'hour': 0, 'minute': 0, 'second': 0, 'milliseconds': 0 }),
            "ed": moment($('#dateTask').datepicker("getDate").toISOString()).set({ 'hour': 23, 'minute': 59, 'second': 59, 'milliseconds': 999 }),
            "isPad": (ddiff >= 1 || ddiff <= -1) ? true : false,
        },
        "isBatch": isBatch
    };
    if (inID != null) {
        $.post('./4.uptTaskMA', { data: JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success && !ret.isdup) {
                $('#btnClose').click();
                getTeams();
                setTimeout(() => {
                    getMAPlan();
                }, 333);
            } else { alert(ret.msg); }
        });
    }
}

function resetOption() {
    $('#ddTeam').val(-1).trigger('change');
    setTimeout(() => {
        $('#ddProv').val(0).trigger('change');
        setTimeout(() => {
            $('#ddZone').val(0).trigger('change');
        }, 333);
    }, 333);
}

function loadDatabyDate(dpad) {
    switch (dpad) {
        case 2:
            padday += -1;
            if (padday == 0) {
                $('#txtDate').text('TODAY (' + moment().format('DD/MM/YY') + ' )');
            } else {
                $('#txtDate').text(moment().add(padday, 'days').format('DD/MM/YY'));
            }
            getTeams().then(function() {
                getMAPlan(); 
            });
            break;
        case 0:
            padday = 0;
            $('#txtDate').text('TODAY (' + moment().format('DD/MM/YY') + ' )');
            getTeams().then(function() {
                getMAPlan(); 
            });
            break;
        case 1:
            padday += 1;
            if (padday == 0) {
                $('#txtDate').text('TODAY (' + moment().format('DD/MM/YY') + ' )');;
            } else {
                $('#txtDate').text(moment().add(padday, 'days').format('DD/MM/YY'));
            }
            getTeams().then(function() {
                getMAPlan(); 
            });
            break;
        default:
            break;
    }
}
