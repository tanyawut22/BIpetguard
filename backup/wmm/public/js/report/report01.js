function tools_reauthen(current) {
    var data = { 'location': current };
    $.post("../reauthen", data,
        function (ret, status) { if (ret.success !== 'true') { window.location = "http://52.220.162.104/"; } else { } }
    );
}

function onInitialize() {
    tools_reauthen('report');
    getData_dailyMA();
    getData_perProv().then(function (res0) {
        if (!$('body').hasClass('page-sidebar-closed'))
            $('#ttHide').click();
        return res0;
    });

    $('#btnLoadCSV').click(loadJSONData);
    $('#btnLoadMatasks').click(loadJSONData2);

    var yesterday = moment().add(-1, 'days').format('DD/MM/YYYY');
    $('#dateSt').val(yesterday);
    var today = moment().format('DD/MM/YYYY');
    $('#dateEd').val(today);
}

function getSum(total, num) {
    return total + num;
}

function setFunction() {
    getData_perProv().then(function(res0) {
        getData_dailyMA();
    });
}

function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
        var key = obj[property];
        if (!acc[key]) {
            acc[key] = { name: key, sum: 0 };
        }
        acc[key].sum += obj.count;
        return acc;
    }, {});
}

function compare(a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}

var chartData1 = [];
var chartData2 = [];
var chartData21 = [];
var chartData22 = [];
var thisMM = moment();

function getData_dailyMA() {
    $.post('../report/1.getDailyMA', { data: JSON.stringify({ level2: thisMM.format('MMYYYY') }) }, function (ret, status) {
        if (ret.success) {
            chartData1 = [];
            if (ret.data.length > 0) {
                var lastd = thisMM.endOf('month').date();
                for (let i = 0; i <= (lastd - 1); i++) {
                    if (ret.data[0].val[i] == null) {
                        chartData1.push({ "days": "วันที่ " + (i + 1), "nqm": 0, "ddv": 0, "nsn": 0, "total": 0 });
                    } else {
                        var r = ret.data[0].val[i];
                        chartData1.push({ "days": "วันที่ " + (i + 1), "nqm": r[0], "ddv": r[1], "nsn": r[2], "total": (r[0] + r[1] + r[2]) });
                    }
                }
            }

            var chart1 = AmCharts.makeChart('chartdiv', {
                "type": "serial",
                "categoryField": "days",
                "categoryAxis": {
                    "gridPosition": "start"
                },
                "valueAxes": [
                    {
                        "stackType": "regular",
                        "title": "จำนวน job",
                        "zeroGridAlpha": 1,
                        // "maximum": 64,
                    }
                ],
                "startDuration": 1,
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
                        "id": "Title-3",
                        "text": "JOB MA per day"
                    }
                ],
                "export": {
                    "enabled": true,
                    "menu": [{
                        "class": "export-main",
                        "menu": ["XLSX", "JPG"]
                    }]
                },
                "dataProvider": chartData1
            });

            var graph1 = new AmCharts.AmGraph();
            graph1.balloonText = "งาน [[title]] [[days]] : [[value]]";
            graph1.fillAlphas = 1;
            graph1.labelText = "[[value]]";
            graph1.labelPosition = "top";
            graph1.labelOffset = -6;
            graph1.title = "NQM";
            graph1.type = "column";
            graph1.valueField = "nqm";
            chart1.addGraph(graph1);

            var graph2 = new AmCharts.AmGraph();
            graph2.balloonText = "งาน [[title]] [[days]] : [[value]]";
            graph2.fillAlphas = 1;
            graph2.labelText = "[[value]]";
            graph2.labelPosition = "top";
            graph2.labelOffset = -6;
            graph2.title = "DDvision";
            graph2.type = "column";
            graph2.valueField = "ddv";
            chart1.addGraph(graph2);

            var graph3 = new AmCharts.AmGraph();
            graph3.balloonText = "งาน [[title]] [[days]] : [[value]]";
            graph3.fillAlphas = 1;
            graph3.labelText = "[[value]]";
            graph3.labelPosition = "top";
            graph3.labelOffset = -6;
            graph3.title = "Nokia";
            graph3.type = "column";
            graph3.valueField = "nsn";
            chart1.addGraph(graph3);

            var graph4 = new AmCharts.AmGraph();
            graph4.valueField = "total";
            graph4.labelText = "[[total]]";
            graph4.labelPosition = "top";
            graph4.labelOffset = 20;
            graph4.visibleInLegend = false;
            graph4.showBalloon = false;
            graph4.lineAlpha = 0;
            chart1.addGraph(graph4);
        } else { alert('error query data'); }
    });
}

function getData_perProv() {
    return new Promise(function (resolve) {
        $.post('../report/1.getDailyMAperPrv', { "data": JSON.stringify(thisMM.month() + 1) }, function (ret, status) {

            if (ret.data.length > 0) {
                var rawData21 = [], rawData22 = [];

                for (var i = 0; i < ret.data.length; i++) {
                    var elem = ret.data[i];
                    // 0 - preventive 
                    // 1 - corrective
                    if (elem._id.ctype == 0) {
                        rawData21.push(elem);
                    } else {
                        rawData22.push(elem);
                    }
                }

                chartData21 = groupBy(rawData21, 'prvcode');
                chartData22 = groupBy(rawData22, 'prvcode');

                keyprv = ['cmi', 'cri', 'kpt', 'lpg', 'lpn', 'nsn', 'plk', 'pyo', 'sti', 'utt'];
                chartData2 = [];
                for (var j = 0; j < keyprv.length; j++) {
                    var a = chartData21[keyprv[j]] != null ? chartData21[keyprv[j]].sum : 0;
                    var b = chartData22[keyprv[j]] != null ? chartData22[keyprv[j]].sum : 0;
                    chartData2.push({ name: keyprv[j], prev: a, corr: b });
                }

                chartData2.sort(compare);
            } else {
                chartData22 = [];
                chartData21 = [];
                chartData2 = [];
            }

            var chart2 = AmCharts.makeChart('chartdivprv', {
                "type": "serial",
                "categoryField": "name",
                "categoryAxis": {
                    "gridPosition": "start"
                },
                "theme": "light",
                "colorRanges": [{
                    "start": 0,
                    "end": 384,
                    "color": "#0080FF",
                    "variation": 0.6,
                    "valueProperty": "sum",
                    "colorProperty": "color"
                }],
                "categoryField": "name",
                "startDuration": 1,
                "categoryAxis": {
                    "gridPosition": "start"
                },
                "valueAxes": [
                    {
                        "title": "จำนวนงานที่ได้รับ"
                    }
                ],
                "titles": [
                    {
                        "size": 16,
                        "text": "MA job per Province"
                    }
                ],
                "legend": {
                    "enabled": true,
                    "equalWidths": false,
                    "labelWidth": 0,
                    "rollOverGraphAlpha": 0,
                    "switchable": false,
                    "useGraphSettings": true,
                    "valueAlign": "left"
                },
                "export": {
                    "enabled": true,
                    "menu": [{
                        "class": "export-main",
                        "menu": ["XLSX", "JPG"]
                    }]
                },
                "dataProvider": chartData2
            });

            var graph1 = new AmCharts.AmGraph()
            graph1.fillAlphas = 1;
            graph1.labelText = "[[value]]";
            graph1.title = "corrective";
            graph1.type = "column";
            graph1.valueField = "corr";
            graph1.colorField = "color";
            chart2.addGraph(graph1);

            var graph2 = new AmCharts.AmGraph();
            graph2.fillAlphas = 1;
            graph2.labelText = "[[value]]";
            graph2.title = "preventive";
            graph2.type = "column";
            graph2.valueField = "prev";
            graph2.colorField = "color";
            chart2.addGraph(graph2);

            resolve(1);
        });
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

var loadJSONData = function () {
    var data2send = {
        start: thisMM.set({ 'date': 1, 'h': 0, 'm': 0, 's': 0, 'ms': 000 }).toISOString(),
        end: thisMM.set({ 'date': 1, 'h': 0, 'm': 0, 's': 0, 'ms': 000 }).add('months', 1).toISOString()
    };
    let contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    let filename = 'reportMaTask.xls';
    $.post('../report/1.getJSONperMonth', { "data": JSON.stringify(data2send) }, function (ret, status) {
        console.log(ret.data[0]);
        queryHeader(ret.data[0]);

        if (!contentType) contentType = 'application/octet-stream';
        var a = document.getElementById('tgrCSV');
        var blob = new Blob([jsonToSsXml(ret.data)], { 'type': contentType });
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    });
}

var loadJSONData2 = function () {
    var data2send = {
        start: $('#dateSt').datepicker('getDate'),
        end: $('#dateEd').datepicker('getDate')
    };
    let contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    let filename = 'reportMaTask.xls';
    $.post('../report/1.getJSONperRange', { "data": JSON.stringify(data2send) }, function (ret, status) {
        console.log(ret.data[0]);
        queryHeader(ret.data[0]);

        if (!contentType) contentType = 'application/octet-stream';
        var a = document.getElementById('tgrCSV');
        var blob = new Blob([jsonToSsXml(ret.data)], { 'type': contentType });
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    });
}

var testTypes = {};

function queryHeader(inData) {
    for (var k in inData) { testTypes[k] = "String"; }
}

emitXmlHeader = function () {
    var headerRow = '<ss:Row>\n';
    for (var colName in testTypes) {
        headerRow += '  <ss:Cell>\n';
        headerRow += '    <ss:Data ss:Type="String">';
        headerRow += colName + '</ss:Data>\n';
        headerRow += '  </ss:Cell>\n';
    }
    headerRow += '</ss:Row>\n';
    return '<?xml version="1.0"?>\n' +
        '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' +
        '<ss:Worksheet ss:Name="Sheet1">\n' +
        '<ss:Table>\n\n' + headerRow;
};

emitXmlFooter = function () {
    return '\n</ss:Table>\n</ss:Worksheet>\n</ss:Workbook>\n';
};

jsonToSsXml = function (jsonObject) {
    var row, col, xml;
    var data = typeof jsonObject != "object" ? JSON.parse(jsonObject) : jsonObject;

    xml = emitXmlHeader();

    for (row = 0; row < data.length; row++) {
        xml += '<ss:Row>\n';
        for (col in data[row]) {
            xml += '  <ss:Cell>\n';
            xml += '    <ss:Data ss:Type="' + testTypes[col] + '">';
            xml += data[row][col] + '</ss:Data>\n';
            xml += '  </ss:Cell>\n';
        }
        xml += '</ss:Row>\n';
    }
    xml += emitXmlFooter();
    return xml;
};