var padday = 0;
var timeLoopId = null;

function onInitialize() {
    tools_reauthen('matask');
    reloadAllData();

    $('.ddTheme').select2({ width: 'resolve' });

    timeLoopId = window.setInterval(autoLoadData, 300000);
}

function reloadAllData() {
    document.getElementById('ch3').checked = true;
    document.getElementById('ch2').checked = true;
    document.getElementById('ch1').checked = true;
    setDatepickerToday()
        .then(function (res0) {
            return getProv()
        })
        .then(function (res1) {
            return getZone();
        })
        .then(function (res2) {
            return getTeams();
        })
        .then(function (res3) {
            return getTypeJob();
        })
        .then(function (res4) {
            if (!$('body').hasClass('page-sidebar-closed'))
                $('#ttHide').click();
            return getMAPlan();
        });
}

function setDatepickerToday() {
    return new Promise(function (resolve) {
        var objDate = moment().format('DD/MM/YYYY');
        $('#dateSearch').val(objDate);
        $('#dateSearch').datepicker('update');
        resolve(1);
    });
}

$('#ddTeam').change(function () {
    if (gosearch) {
        getTeams();
    } else {
        getTeams()
            .then(function (res1) {
                return getMAPlan();
            });
    }
});

$('#ddProv').change(function () {
    if (gosearch) {
        getZone();
    } else {
        getZone()
            .then(function (res2) {
                return getTeams();
            })
            .then(function (res3) {
                return getMAPlan();
            });
    }

});

$('#ddZone').change(function () {
    getTeams().then(function () {
        return getMAPlan();
    });
});

function autoLoadData() {
    getTeams()
        .then(function (res) {
            return getMAPlan();
        });
}

function getProv() {
    return new Promise(function (resolve) {
        $.post('./6.getProv', function (ret, status) {
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

function padDaySearch(amount) {
    var objDate = moment($('#dateSearch').datepicker('getDate')).add(amount, 'days').format('DD/MM/YYYY');
    $('#dateSearch').val(objDate);
    $('#dateSearch').datepicker('update');
}

function getSearch() {
    if (gosearch) {

    } else {
        getTeams()
            .then(function (res0) {
                return getMAPlan();
            });
    }
}

$('#dateSearch').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked', todayHighlight: true, calendarWeeks: true }).on('changeDate', function (e) {
    if (gosearch) {
        new Promise((subres0) => {
            $('#ddProv').val(tmpSearch.prvid).trigger('change');
            return subres0(1);
        }).then(function (subres1) {
            $('#ddTeam').val(tmpSearch.copid).trigger('change');
            return subres1(1);
        }).then(function (subres2) {
            return getMAPlan();
        }).then(function (subres3) {
            if (tmpSearch) {
                var selector = 'td > a[onclick="load2Modal(' + tmpSearch.slot + ', \'' + tmpSearch._id + '\')"]';
                $(selector).css({ 'border': '3px solid black' });
                return setTimeout(() => {
                    $(selector).css({ 'border': '' });
                    gosearch = false;
                    tmpSearch = null;
                    return subres3;
                }, 5000);
            } else {
                return res2(0);
            }
        });
    } else {
        getTeams()
            .then(function (res0) {
                return getMAPlan();
            });
    }
});

$('#intSearch').on("keyup", function (event) {
    if (event.keyCode == 13) {
        search();
    }
});

$('#ch3').click(function (event) {
    var bol = (this.checked) ? true : false;
    new Promise(function (res1) {
        $('.cbt').each(function () { this.checked = bol; })
        return res1(1);
    })
        .then(function (res2) {
            return getTeams()
        })
        .then(function (res3) {
            return getMAPlan();
        })
});

$('#ch1').click(function (event) {
    if (this.checked) {
        if (document.getElementById('ch2').checked)
            document.getElementById('ch3').checked = true;
    } else {
        document.getElementById('ch3').checked = false;
    }
    getTeams()
        .then(function (res2) {
            return getMAPlan();
        });
});

$('#ch2').click(function (event) {
    if (this.checked) {
        if (document.getElementById('ch1').checked)
            document.getElementById('ch3').checked = true;
    } else {
        document.getElementById('ch3').checked = false;
    }
    getTeams()
        .then(function (res2) {
            return getMAPlan();
        });
});

var gosearch = false;
var tmpSearch = null;
function search() {
    return new Promise(function (res0, rej0) {
        gosearch = false; tmpSearch = null;
        var d2s = { 'kw': $("#intSearch").val() };
        $("#intSearch").val("")
        $.post('./6.search', { data: JSON.stringify(d2s) }, function (ret, status) {
            console.log("search 1");
            console.log(ret.data);
            gosearch = true;
            tmpSearch = { slot: ret.data.slot, _id: ret.data._id, copid: ret.data.copid, prvid: ret.data.prvid };
            var objDate = moment(ret.data.timetodo).format('DD/MM/YYYY');
            $('#dateSearch').val(objDate);
            $('#dateSearch').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked', todayHighlight: true, calendarWeeks: true });
            $('#dateSearch').datepicker('update');
            res0(1);
        });
    });
}

function resetOption() {
    // setTimeout(() => {
    //     $('#ddProv').val(0).trigger('change');
    //     setTimeout(() => {
    //         $('#ddZone').val(0).trigger('change');
    //     }, 333);
    // }, 333);

    reloadAllData();
}

function getTypeJob() {
    return new Promise(function (callback) {
        $.post('./6.getTypeJob', function (ret, status) {
            if (ret.success) {
                // var str = "<option value='0'>โปรดเลือก</option>";
                var str = "";
                for (let k = 0; k < ret.data.length; k++) {
                    var row = ret.data[k];
                    str += "<option value='" + row._id + "' data-icon='" + row.icon + "' data-color='" + row.color + "'>" + row.name + "</option>";
                }
                $('#ddJobType').html(str);
                callback(str);
            } else {
                callback(false);
            }
        });
    });
}

function getTeams() {
    return new Promise(function (resolve) {
        var ch = parseInt($('#ddTeam').val());
        var pv = $('#ddProv').val();
        var zo = $('#ddZone').val();
        var mm = moment($('#dateSearch').datepicker("getDate"));
        var m = mm.get('M'), y = mm.get('Y');
        var firstDay = new Date(y, m, 1, 0, 0, 0);
        var lastDay = new Date(y, m + 1, 0, 23, 59, 59);

        var type = []
        if ($('#ch3').is(':checked')) { type = [0, 1]; } else {
            if ($('#ch1').is(':checked')) type.push(1);
            if ($('#ch2').is(':checked')) type.push(0);
        }

        var d2s = { "copid": ch, "provinceid": pv, "zoneid": zo, "type": type, 'start': firstDay, 'end': lastDay };
        $.post('./6.getTeamMA', { "data": JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success) {
                var str = '';
                for (var i = 0; i < ret.data.length; i++) {
                    var row = ret.data[i];
                    if (row.status) {
                        if (row.type == 1) {
                            str += '<tr name="' + row._id + '"><td style="vertical-align: middle;" class="bold font-blue-steel">' + row.name;
                        } else {
                            str += '<tr name="' + row._id + '"><td style="vertical-align: middle;" class="bold font-green-jungle">' + row.name + ' (indoor)';
                        }
                        str += ' <span>(' + row.wlcount + ')</span><span class="btnResvAll" style="float: right;"><button type="button" data-toggle="modal" onclick="openAddJob2Slot(0, \'' + row._id + '\', 1)" href="#basic" class="btn btn-xs grey-silver"><i class="fa fa-arrow-right"></i></button></span></td>';

                        str += '<td style="text-align: center; color: black;"><a data-toggle="modal" href="#basic" onclick="openAddJob2Slot(0, \'' + row._id + '\', 0)" class="btn btn-xs default"><i class="fa fa-plus"></i></a></td>';
                        str += '<td style="text-align: center; color: black;"><a data-toggle="modal" href="#basic" onclick="openAddJob2Slot(1, \'' + row._id + '\', 0)" class="btn btn-xs default"><i class="fa fa-plus"></i></a></td>';
                        str += '<td style="text-align: center; color: black;"><a data-toggle="modal" href="#basic" onclick="openAddJob2Slot(2, \'' + row._id + '\', 0)" class="btn btn-xs default"><i class="fa fa-plus"></i></a></td>';
                    } else {
                        // str += '<td colspan="3" style="text-align:center; font-weight: bold; color: #e7505a;">restricted user</td>';
                    }
                    str += '</tr>';
                }
                $('#tarTb').html(str);
                resolve(str);
            } else { resolve('fail'); }
        });
    });
}

function getZone() {
    return new Promise(function (resolve) {
        var pvid = $('#ddProv').val();
        $.post('./6.getZone', { "data": JSON.stringify(pvid) }, function (ret, status) {
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

function getMAPlan() {
    var start = $('#dateSearch').datepicker("getDate");
    var end = new Date($('#dateSearch').datepicker("getDate").setHours(23, 59, 59));
    var d2s = { "start": start, "end": end };
    return new Promise(function (resolve) {
        $.post('./6.getMAPlan', { data: JSON.stringify(d2s) }, function (ret, status) {
            if (ret.success) {
                var str = "";
                var tmpObj = null, row = null;
                for (var i = 0; i < ret.data.length; i++) {
                    row = ret.data[i];

                    str = rendericon(row._id, row.slot, row.color, row.icon);

                    $('tr[name="' + row.teamid + '"] > td > .btnResvAll').remove();

                    tmpObj = $('tr[name="' + row.teamid + '"]').children().eq(row.slot + 1);
                    tmpObj.html(str + tmpObj.html());
                }
                resolve(1);
            } else {
                resolve(0);
            }
        });
    });
}

function clearModal() {
    $('#refTask').val('');
    $('#refNon').val('');
    $('#refNote').val('');
    $('#btnAddItem').attr('onclick', 'addTask(null, null, null, null);');
    $('#btnAddItem').text('ADD');
    $('#btnDel').hide();
    $('#btnDel').attr('onclick', 'delTask(null)');
    $('#hidDateTask').val('');
    $('#ddSlot').val(0).trigger('change');
    $('#divSlot').show();
    getTypeJob();
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

function rendericon(id, slot, color, icon) {
    return '<a data-toggle="modal" data-rmid="' + id + '" href="#basic" onclick="load2Modal(' + slot + ', \'' + id + '\')" class="btn btn-sm ' + color + '"><i class="fa fa-' + icon + '"></i></a>';
}

var globTmp = null;
function load2Modal(slot, id) {
    $.post('./6.loadDetail', { data: JSON.stringify(id) }, function (ret, status) {
        if (ret.success) {
            globTmp = ret.data;
            $('#btnDel').attr('onclick', 'delTask("' + globTmp._id + '");');
            $('#btnDel').show();
            $('#btnAddItem').attr('onclick', 'uptTask("' + globTmp._id + '", ' + globTmp.slot + ');');
            $('#btnAddItem').text('UPDATE');

            $('#hidDateTask').val(globTmp.timestamp);
            $('#refNote').val(globTmp.refnote);
            $('#refNon').val(globTmp.refnon);
            $('#refTask').val(globTmp.reftask);
            $('#refTeam').val(globTmp.teamname);

            $('#ddSlot').val(globTmp.slot).trigger('change');
            $('#ddJobType').val(globTmp.jobtypeid).trigger('change');

            $('#dateTask').val(moment(globTmp.timetodo).format('DD/MM/YYYY'));
            $('#dateTask').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked', todayHighlight: true, calendarWeeks: true });
            $('#dateTask').datepicker('update');
        } else { }
    });
}

function uptTask(id, slot) {
    var d2s = {
        "dataupt": {
            "jobtypeid": $('#ddJobType').val(),
            "refnon": $('#refNon').val(),
            "refnote": $('#refNote').val(),
            "reftask": $('#refTask').val(),
            "slot": parseInt($('#ddSlot').val()),
            "timetodo": new Date($('#dateTask').datepicker("getDate").setHours(dfHour[slot][0], dfHour[slot][1])),
        },
        "_id": id,
        "oldData": globTmp,
    }
    $.post('./6.uptTask', { data: JSON.stringify(d2s) }, function (ret, status) {
        if (ret.success) {
            $('#btnClose').click();
            getTeams()
                .then(function (res0) {
                    return getMAPlan();
                });
        } else {

        }
    });
}

function delTask(id) {
    var tmpObj = $('a[data-rmid="' + id + '"]');
    $.post('./6.delTask', { data: JSON.stringify({ "_id": id }) }, function (ret, status) {
        if (ret.success) {
            $('#btnClose').click();
            $(tmpObj).fadeOut("fast", () => {
                tmpObj.remove();
                $('tr[name="' + ret.data.teamid + '"] > td').eq(0).text(
                    updatetxt($('tr[name="' + ret.data.teamid + '"] > td').eq(0).text(), -1)
                );

                var boolBatch = true;
                for (var pos = 0; pos < 3; pos++) {
                    var txtselect = 'tr[name="' + ret.data.teamid + '"] > td:nth-child(' + (pos + 2) + ') > a';
                    if ($(txtselect).length > 1) {
                        boolBatch = false;

                    } else {
                    }
                }

                if (boolBatch) {
                    var str = '<span class="btnResvAll" style="float: right;"><button type="button" data-toggle="modal" onclick="openAddJob2Slot(0, \'' + ret.data.teamid + '\', 1)" href="#basic" class="btn btn-xs grey-silver"><i class="fa fa-arrow-right"></i></button></span>';
                    $('tr[name="' + ret.data.teamid + '"] > td:nth-child(1)').append(str);
                }
            });

        }
    })
}

function openAddJob2Slot(slot, id, isBatch) {
    var txtteam = $('tr[name="' + id + '"]').children().eq(0).text().slice(0, -4);
    $('#refTeam').val(txtteam);
    if (!isBatch) {
        $('#btnAddItem').attr('onclick', 'addTask(' + slot + ', "' + id + '", 0)');
    } else {
        $('#btnAddItem').attr('onclick', 'addTask(' + slot + ', "' + id + '", 1)');
        $('#divSlot').hide();
    }
    $('#ddSlot').val(slot).trigger('change');
    var objDate = moment($('#dateSearch').datepicker("getDate")).format('DD/MM/YYYY');
    $('#dateTask').val(objDate);
    $('#dateTask').datepicker({ format: 'dd/mm/yyyy', autoclose: true, todayBtn: 'linked' });
    $('#dateTask').datepicker('update');

    $("#refNote").val("ไม่มี");
}

var dfHour = [[9, 0], [12, 30], [16, 0]];
function addTask(inSlot, inID, isBatch) {
    var databtn = $('#ddJobType').select2('data')[0].element.dataset;
    if (!isBatch) {
        if (inSlot != null && inID != null) {
            var d2s = {
                data: {
                    jobtypeid: $('#ddJobType').val(),
                    refnon: $('#refNon').val(),
                    refnote: $('#refNote').val(),
                    reftask: $('#refTask').val(),
                    slot: inSlot,
                    teamid: inID,
                    teamname: $('#refTeam').val(),
                    timestamp: moment().toDate(),
                    timetodo: new Date($('#dateTask').datepicker("getDate").setHours(dfHour[inSlot][0], dfHour[inSlot][1])),
                }
            };

            $.post('./6.addTask', { data: JSON.stringify(d2s) }, function (ret, status) {
                if (ret.success) {
                    var str = rendericon(ret.data._id, inSlot, databtn.color, databtn.icon);
                    var newstr = str + $('tr[name="' + inID + '"] > td:nth-child(' + (inSlot + 2) + ')').html();
                    $('tr[name="' + inID + '"] > td:nth-child(' + (inSlot + 2) + ')').html(newstr);
                    $('#btnClose').click();
                    $('tr[name="' + inID + '"] > td').eq(0).text(
                        updatetxt($('tr[name="' + inID + '"] > td').eq(0).text(), 1)
                    );
                } else { alert("fail to add batch slot MA !!"); }
            });
        }
    } else {
        for (let i = 0; i < 3; i++) {
            var d2s = {
                data: {
                    jobtypeid: $('#ddJobType').val(),
                    refnon: $('#refNon').val(),
                    refnote: $('#refNote').val(),
                    reftask: $('#refTask').val(),
                    slot: i,
                    teamid: inID,
                    teamname: $('#refTeam').val(),
                    timestamp: moment().toDate(),
                    timetodo: new Date($('#dateTask').datepicker("getDate").setHours(dfHour[i][0], dfHour[i][1])),
                }
            }

            $.post('./6.addTask', { data: JSON.stringify(d2s) }, function (ret, status) {
                if (ret.success) {
                    var str = rendericon(ret.data._id, inSlot, databtn.color, databtn.icon);
                    var newstr = str + $('tr[name="' + inID + '"] > td:nth-child(' + (i + 2) + ')').html();
                    $('tr[name="' + inID + '"] > td:nth-child(' + (i + 2) + ')').html(newstr);
                    $('#btnClose').click();
                    $('tr[name="' + inID + '"] > td').eq(0).text(
                        updatetxt($('tr[name="' + inID + '"] > td').eq(0).text(), 1)
                    );
                } else { alert("fail to add batch slot MA !!"); }
            });
        }
    }
}

function tools_reauthen(current) {
    return new Promise(function (response) {
        var data = { 'location': current };
        $.post("../reauthen", data,
            function (ret, status) {
                if (ret.success !== 'true') {
                    window.location = "http://52.220.162.104";
                    response(false);
                } else { response(true); }
            }
        );
    });
}