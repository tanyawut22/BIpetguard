var thisMM = moment();

function tools_reauthen(current) {
    var data = { 'location': current };
    $.post("../reauthen", data,
        function (ret, status) { if (ret.success !== 'true') { window.location = "http://52.220.162.104/"; } else { } }
    );
}

function setFunction() {
    getData_terminate();
    getData_notTerminate();
}

function onInitialize() {
    tools_reauthen('report');
    setFunction();
}

function getSum(total, num) {
    return total + num;
}

var chart2Export1 = null;
var chart2Export2 = null;

function getData_terminate() {
    $.post('./2.getDailyTerminate', { data: JSON.stringify({ 'level2': thisMM.format('MMYYYY') }) }, function (ret, status) {
        console.log(ret);
        if (ret.success) {
            var chartData = [];
            var lastd = thisMM.endOf('month').date();
            if (ret.data.length > 0) {
                for (let i = 0; i <= (lastd - 1); i++) {
                    if (ret.data[0].val[i] == null) {
                        chartData.push({ "days": "วันที่ " + (i + 1), "cmi": null, "cri": null, "plk": null, 'kpt': null, 'nsn': null, 'sum': 0 });
                    } else {
                        var r = ret.data[0].val[i];
                        var sumout = 0;
                        for (var j = 0; j < r.length; j++) {
                            sumout += r[j];
                        }
                        chartData.push({ "days": "วันที่ " + (i + 1), "cmi": r[0], "cri": r[1], "plk": r[2], 'kpt': (r[3] == null) ? 0 : r[3], 'nsn': (r[4] == null) ? 0 : r[4], 'sum': sumout });
                    }
                }
            } else {
                for (let i = 0; i <= (lastd - 1); i++) {
                    chartData.push({ "days": "วันที่ " + (i + 1), "cmi": null, "cri": null, "plk": null, 'sum': 0 });
                }
            }

            chart2Export1 = AmCharts.makeChart('chartdiv', {
                "type": "serial",
                "categoryField": "days",
                "categoryAxis": {
                    "gridPosition": "start"
                },
                "startDuration": 0.5,
                "columnSpacing": 2,
                "colors": [
                    '#2E5A86',
                    '#2E8686',
                    '#5CA4A9',
                    '#A1CABC',
                    '#E6EBE0',
                    '#FFBF00'
                ],
                "graphs": [
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Chiang mai",
                        "type": "column",
                        "valueField": "cmi",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Chiang rai",
                        "type": "column",
                        "valueField": "cri",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Phitsanulok",
                        "type": "column",
                        "valueField": "plk",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Khamphengphet",
                        "type": "column",
                        "valueField": "kpt",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "nakhon sawan",
                        "type": "column",
                        "valueField": "nsn",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "[[value]] port",
                        "bullet": "round",
                        "labelText": "[[value]]",
                        "lineThickness": 2,
                        "title": "SUMMARY",
                        "valueField": "sum",
                        "valueAxis": "ValueAxis-2",
                        "labelPosition": "top"
                    }
                ],
                "valueAxes": [
                    {
                        "id": "ValueAxis-1",
                        "title": "จำนวน port terminate"
                    },
                    {
                        "id": "ValueAxis-2",
                        "position": "right",
                        "gridAlpha": 0,
                        "title": "จำนวนผลรวม port terminate"
                    }
                ],
                "balloon": {},
                "legend": {
                    "enabled": true,
                    "equalWidths": false,
                    "labelWidth": 0,
                    "rollOverGraphAlpha": 0,
                    "switchable": false,
                    "useGraphSettings": true,
                    "valueAlign": "left"
                },
                "titles": [
                    {
                        "color": "#000000",
                        "text": "Terminate port per day"
                    }
                ],
                "export": {
                    "enabled": true,
                    "menu": [{
                        "class": "export-main",
                        "menu": ["XLSX", "JPG"]
                    }]
                },
                "dataProvider": chartData
            });
        } else { alert('error query data'); }
    });
}

function getData_notTerminate() {
    $.post('./2.getDailyNotTerminate', { data: JSON.stringify({ 'level2': thisMM.format('MMYYYY') }) }, function (ret, status) {
        // console.log(ret);
        if (ret.success) {
            var chartData = [];
            var lastd = thisMM.endOf('month').date();

            if (ret.data.length > 0) {
                for (let i = 0; i <= (lastd - 1); i++) {
                    if (ret.data[0].val[i] == null) {
                        chartData.push({ "days": "วันที่ " + (i + 1), "cmi": null, "cri": null, "plk": null, 'sum': 0 });
                    } else {
                        var r = ret.data[0].val[i];
                        var str = '';
                        for (let j = 0; j < ret.text.length; j++) {
                            var rowtxt = ret.text[j];
                            str += '{' + rowtxt.level2 + ' : ' + rowtxt.val[i] + '} ';
                        }
                        chartData.push({ "days": "วันที่ " + (i + 1), "cmi": r[0], "cri": r[1], "plk": r[2], 'sum': (r[0] + r[1] + r[2]), 'text': str });
                    }
                }
            } else {
                for (let i = 0; i <= (lastd - 1); i++) {
                    chartData.push({ "days": "วันที่ " + (i + 1), "cmi": null, "cri": null, "plk": null, 'sum': 0 });
                }
            }

            chart2Export2 = AmCharts.makeChart('chartnotter', {
                "type": "serial",
                "categoryField": "days",
                "categoryAxis": {
                    "gridPosition": "start"
                },
                "columnSpacing": 2,
                "colors": [
                    '#CC0003',
                    '#FF191C',
                    '#FF4C4F',
                    '#7F007F'
                ],
                "startDuration": 0.5,
                "graphs": [
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Chiang mai",
                        "type": "column",
                        "valueField": "cmi",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Chiang rai",
                        "type": "column",
                        "valueField": "cri",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "จำนวน port [[title]] [[days]] : [[value]]",
                        "fillAlphas": 1,
                        "labelText": "[[value]]",
                        "title": "Phitsanulok",
                        "type": "column",
                        "valueField": "plk",
                        "labelPosition": "top"
                    },
                    {
                        "balloonText": "[[value]] port",
                        "bullet": "round",
                        "labelText": "[[value]]",
                        "lineThickness": 2,
                        "title": "SUMMARY",
                        "valueField": "sum",
                        "valueAxis": "ValueAxis-2",
                        "labelPosition": "top"
                    }
                ],
                "valueAxes": [
                    {
                        "id": "ValueAxis-1",
                        "title": "จำนวน port ที่ไม่ terminate"
                    },
                    {
                        "id": "ValueAxis-2",
                        "position": "right",
                        "gridAlpha": 0,
                        "title": "จำนวนผลรวม port ที่ไม่ terminate"
                    }
                ],
                "balloon": {},
                "legend": {
                    "enabled": true,
                    "equalWidths": false,
                    "labelWidth": 0,
                    "rollOverGraphAlpha": 0,
                    "switchable": false,
                    "useGraphSettings": true,
                    "valueAlign": "left"
                },
                "titles": [
                    {
                        "color": "#000000",
                        "text": "Not terminate port per day"
                    }
                ],
                "export": {
                    "enabled": true,
                    "menu": [{
                        "class": "export-main",
                        'menu': ["XLSX", "JPG"]
                    }]
                },
                "listeners": [{
                    "event": "init",
                    "method": function (e) {
                        e.chart.chartDiv.addEventListener("click", function () {
                            // console.log('event from click chart');
                        });
                    }
                }],
                "dataProvider": chartData
            });
        } else { alert('error query data'); }
    });
}

/**
 * Overriding individual textual prompts for Export plugin is easy.
 * Just override default English language difinition
 * ----------------------------------------------------------------
 * A list of available prompts:
 * 
 * "fallback.save.text": "CTRL + C to copy the data into the clipboard."
 * "fallback.save.image": "Rightclick -> Save picture as... to save the image."
 * "capturing.delayed.menu.label": "{{duration}}"
 * "capturing.delayed.menu.title": "Click to cancel"
 * menu.label.print": "Print"
 * menu.label.undo": "Undo"
 * menu.label.redo": "Redo"
 * menu.label.cancel": "Cancel"
 * menu.label.save.image": "Download as ..."
 * menu.label.save.data": "Save as ..."
 * menu.label.draw": "Annotate ..."
 * menu.label.draw.change": "Change ..."
 * menu.label.draw.add": "Add ..."
 * menu.label.draw.shapes": "Shape ..."
 * menu.label.draw.colors": "Color ..."
 * menu.label.draw.widths": "Size ..."
 * menu.label.draw.opacities": "Opacity ..."
 * menu.label.draw.text": "Text"
 * menu.label.draw.modes": "Mode ..."
 * menu.label.draw.modes.pencil": "Pencil"
 * menu.label.draw.modes.line": "Line"
 * menu.label.draw.modes.arrow": "Arrow"
 * "label.saved.from": "Saved from: 
 */

function exportXLSX() {
    chart2Export1.export.toXLSX({}, function (data) {
        this.download(data, this.defaults.formats.XLSX.mimeType, "amCharts.xlsx");
    });
}

function loadData(inc, id) {
    $('.ttBtn').attr({ 'class': "btn btn-default ttBtn" });
    $('#ttBtn' + id).attr({ 'class': "btn dark btn-default ttBtn" });

    if (inc == 0) {
        thisMM = moment();
    } else {
        thisMM.add(inc, 'month');
    }
    setFunction();
}
