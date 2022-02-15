/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.11320754716981, "KoPercent": 1.8867924528301887};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6787709497206704, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GetInspectionDetail"], "isController": false}, {"data": [0.95, 500, 1500, "SubmitInspection"], "isController": false}, {"data": [0.0, 500, 1500, "Create Inspection"], "isController": true}, {"data": [0.975, 500, 1500, "StartInspection"], "isController": false}, {"data": [1.0, 500, 1500, "GetAccessToken"], "isController": false}, {"data": [0.95, 500, 1500, "AssignInspector"], "isController": false}, {"data": [0.35, 500, 1500, "SaveInspectionDetails"], "isController": false}, {"data": [0.475, 500, 1500, "SaveInspectionVehicle"], "isController": false}, {"data": [0.425, 500, 1500, "SaveInspectionMeasurements"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 159, 3, 1.8867924528301887, 628.6037735849058, 91, 6038, 329.0, 1288.0, 1950.0, 5303.000000000007, 0.31492569536187737, 0.20204327851513526, 0.5561760778777574], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetInspectionDetail", 20, 0, 0.0, 157.4, 91, 327, 155.5, 215.70000000000007, 321.5999999999999, 327.0, 0.127965602845955, 0.17203500699012106, 0.106721313310982], "isController": false}, {"data": ["SubmitInspection", 20, 0, 0.0, 388.65000000000003, 313, 784, 351.5, 581.5000000000003, 774.6499999999999, 784.0, 0.11162146927340004, 0.04687229666754104, 0.10540816483142368], "isController": false}, {"data": ["Create Inspection", 20, 1, 5.0, 5028.200000000001, 3833, 9400, 4630.5, 8306.600000000004, 9355.099999999999, 9400.0, 2.002803925495694, 10.302216071249749, 28.174796277288202], "isController": true}, {"data": ["StartInspection", 20, 0, 0.0, 230.5, 161, 820, 180.0, 471.3000000000006, 803.9499999999998, 820.0, 0.18427744812589836, 0.07810196531898426, 0.18301773900785023], "isController": false}, {"data": ["GetAccessToken", 19, 0, 0.0, 128.26315789473682, 109, 173, 121.0, 161.0, 173.0, 173.0, 0.2863041152449407, 0.24911813152660367, 0.1576909384747525], "isController": false}, {"data": ["AssignInspector", 20, 0, 0.0, 204.64999999999998, 95, 766, 158.0, 542.3000000000005, 755.9999999999999, 766.0, 0.11177430532269243, 0.046936475867927485, 0.09649266201685557], "isController": false}, {"data": ["SaveInspectionDetails", 20, 1, 5.0, 1817.75, 148, 6038, 1283.0, 4623.500000000004, 5976.749999999999, 6038.0, 0.13922244265775643, 0.06394851162507396, 0.2972072848143121], "isController": false}, {"data": ["SaveInspectionVehicle", 20, 1, 5.0, 953.2499999999999, 685, 4103, 766.0, 1146.3000000000006, 3956.799999999998, 4103.0, 0.11653042318023178, 0.0749424904153727, 0.1117508550419801], "isController": false}, {"data": ["SaveInspectionMeasurements", 20, 1, 5.0, 1123.35, 142, 1958, 1063.0, 1886.7000000000012, 1957.6, 1958.0, 0.10458500669344042, 0.058910773301539494, 0.7099626533477661], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 3, 100.0, 1.8867924528301887], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 159, 3, "500/Internal Server Error", 3, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["SaveInspectionDetails", 20, 1, "500/Internal Server Error", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionVehicle", 20, 1, "500/Internal Server Error", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionMeasurements", 20, 1, "500/Internal Server Error", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
