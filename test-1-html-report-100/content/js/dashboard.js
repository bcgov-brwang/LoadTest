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

    var data = {"OkPercent": 94.24280350438048, "KoPercent": 5.7571964956195245};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6412680756395995, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.815, 500, 1500, "GetInspectionDetail"], "isController": false}, {"data": [0.97, 500, 1500, "SubmitInspection"], "isController": false}, {"data": [0.0, 500, 1500, "Create Inspection"], "isController": true}, {"data": [1.0, 500, 1500, "StartInspection"], "isController": false}, {"data": [0.98989898989899, 500, 1500, "GetAccessToken"], "isController": false}, {"data": [0.965, 500, 1500, "AssignInspector"], "isController": false}, {"data": [0.295, 500, 1500, "SaveInspectionDetails"], "isController": false}, {"data": [0.365, 500, 1500, "SaveInspectionVehicle"], "isController": false}, {"data": [0.375, 500, 1500, "SaveInspectionMeasurements"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 799, 46, 5.7571964956195245, 844.0813516896121, 114, 13839, 357.0, 1367.0, 2083.0, 10111.0, 1.3881770403509535, 1.0656191634452503, 2.4226860096425313], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetInspectionDetail", 100, 0, 0.0, 554.5199999999998, 231, 6828, 403.0, 845.7, 993.1499999999996, 6772.619999999972, 0.44547795329609136, 0.5920114874842969, 0.3641260223719028], "isController": false}, {"data": ["SubmitInspection", 100, 0, 0.0, 266.62000000000006, 174, 764, 221.0, 451.6000000000002, 590.1499999999992, 763.98, 0.3747269177586834, 0.1573560299181971, 0.3476470428425285], "isController": false}, {"data": ["Create Inspection", 100, 24, 24.0, 6749.869999999998, 3053, 16545, 4902.5, 13105.300000000001, 14258.899999999992, 16541.6, 5.716245569909684, 35.10907980950612, 79.74095582771236], "isController": true}, {"data": ["StartInspection", 100, 0, 0.0, 225.91, 166, 454, 209.0, 335.70000000000016, 365.74999999999994, 453.6199999999998, 0.8289743100861304, 0.35053308229227975, 0.8103547699181802], "isController": false}, {"data": ["GetAccessToken", 99, 0, 0.0, 179.0, 114, 3265, 142.0, 164.0, 197.0, 3265.0, 1.462485042766608, 1.24968204337967, 0.8055093399612959], "isController": false}, {"data": ["AssignInspector", 100, 0, 0.0, 286.6599999999999, 151, 766, 247.0, 461.9, 578.6499999999994, 765.0099999999995, 0.37436218043508374, 0.15720286873738867, 0.3169648539425953], "isController": false}, {"data": ["SaveInspectionDetails", 100, 11, 11.0, 2075.05, 317, 13839, 1035.0, 7391.800000000008, 9550.899999999992, 13806.509999999984, 0.5246452086776318, 0.2628759410823431, 1.1112846265837728], "isController": false}, {"data": ["SaveInspectionVehicle", 100, 11, 11.0, 2359.7599999999998, 458, 13712, 874.0, 9159.300000000003, 10098.649999999998, 13693.49999999999, 0.6050887967809276, 0.5500989887453485, 0.5702252821226516], "isController": false}, {"data": ["SaveInspectionMeasurements", 100, 24, 24.0, 798.4799999999998, 251, 1937, 750.5, 1127.9, 1254.0499999999997, 1933.6399999999983, 0.3870268596640607, 0.49759408381066644, 2.6198694751915785], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 46, 100.0, 5.7571964956195245], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 799, 46, "500/Internal Server Error", 46, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["SaveInspectionDetails", 100, 11, "500/Internal Server Error", 11, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionVehicle", 100, 11, "500/Internal Server Error", 11, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionMeasurements", 100, 24, "500/Internal Server Error", 24, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
