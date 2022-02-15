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

    var data = {"OkPercent": 71.42857142857143, "KoPercent": 28.571428571428573};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5412026726057907, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.91, 500, 1500, "GetInspectionDetail"], "isController": false}, {"data": [0.9, 500, 1500, "SubmitInspection"], "isController": false}, {"data": [0.0, 500, 1500, "Create Inspection"], "isController": true}, {"data": [0.88, 500, 1500, "StartInspection"], "isController": false}, {"data": [0.9081632653061225, 500, 1500, "GetAccessToken"], "isController": false}, {"data": [0.91, 500, 1500, "AssignInspector"], "isController": false}, {"data": [0.04, 500, 1500, "SaveInspectionDetails"], "isController": false}, {"data": [0.12, 500, 1500, "SaveInspectionVehicle"], "isController": false}, {"data": [0.21, 500, 1500, "SaveInspectionMeasurements"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 399, 114, 28.571428571428573, 1627.2681704260656, 0, 26212, 179.0, 4520.0, 11079.0, 22178.0, 0.7145773785218457, 0.9100885587923464, 1.2384251952551346], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetInspectionDetail", 50, 4, 8.0, 133.42000000000002, 0, 658, 129.0, 207.8, 280.49999999999955, 658.0, 0.26651173451167054, 0.31772675318081756, 0.20448529254993097], "isController": false}, {"data": ["SubmitInspection", 50, 4, 8.0, 349.05999999999995, 62, 1028, 347.0, 393.8, 479.1499999999994, 1028.0, 0.21425571848512637, 0.09154410346837157, 0.19893141299503783], "isController": false}, {"data": ["Create Inspection", 50, 37, 74.0, 12991.539999999999, 837, 34336, 12065.0, 26253.799999999996, 28404.899999999994, 34336.0, 1.437731834258274, 15.024803120596946, 19.899724943928458], "isController": true}, {"data": ["StartInspection", 50, 4, 8.0, 232.85999999999999, 117, 1807, 162.0, 390.49999999999994, 630.5499999999997, 1807.0, 0.4454104903078677, 0.19190928547249145, 0.4334574822281214], "isController": false}, {"data": ["GetAccessToken", 49, 3, 6.122448979591836, 451.22448979591826, 112, 4955, 139.0, 1064.0, 3422.0, 4955.0, 0.7177489050667214, 1.2205421979595423, 0.3953226391187801], "isController": false}, {"data": ["AssignInspector", 50, 4, 8.0, 176.18, 0, 519, 174.0, 277.09999999999997, 386.0499999999999, 519.0, 0.21411900734428194, 0.10490158555124938, 0.17005733036421644], "isController": false}, {"data": ["SaveInspectionDetails", 50, 37, 74.0, 5451.740000000002, 59, 26212, 181.5, 20925.0, 24613.2, 26212.0, 0.2604546496364053, 0.3885098233726793, 0.5518789849561394], "isController": false}, {"data": ["SaveInspectionVehicle", 50, 29, 58.0, 5668.339999999998, 57, 19159, 4357.5, 12164.9, 15598.849999999986, 19159.0, 0.36131605760823227, 0.9537261960464797, 0.340766206831764], "isController": false}, {"data": ["SaveInspectionMeasurements", 50, 29, 58.0, 531.8000000000001, 69, 1284, 271.5, 1039.5, 1224.1499999999996, 1284.0, 0.2702118460873325, 0.4932421706117596, 1.8280148042315176], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 83: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/assign?inspectionId={&quot;message&quot;:&quot;Authorization%20has%20been%20denied%20for%20this%20request.&quot;}&amp;inspectorId=35185", 4, 3.508771929824561, 1.0025062656641603], "isController": false}, {"data": ["500/Internal Server Error", 86, 75.43859649122807, 21.55388471177945], "isController": false}, {"data": ["401/Unauthorized", 20, 17.54385964912281, 5.012531328320802], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 91: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/vehicleDetails?inspectionId={&quot;message&quot;:&quot;Authorization has been denied for this request.&quot;}", 4, 3.508771929824561, 1.0025062656641603], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 399, 114, "500/Internal Server Error", 86, "401/Unauthorized", 20, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 83: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/assign?inspectionId={&quot;message&quot;:&quot;Authorization%20has%20been%20denied%20for%20this%20request.&quot;}&amp;inspectorId=35185", 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 91: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/vehicleDetails?inspectionId={&quot;message&quot;:&quot;Authorization has been denied for this request.&quot;}", 4, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetInspectionDetail", 50, 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 91: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/vehicleDetails?inspectionId={&quot;message&quot;:&quot;Authorization has been denied for this request.&quot;}", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SubmitInspection", 50, 4, "401/Unauthorized", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["StartInspection", 50, 4, "401/Unauthorized", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["GetAccessToken", 49, 3, "500/Internal Server Error", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["AssignInspector", 50, 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 83: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/assign?inspectionId={&quot;message&quot;:&quot;Authorization%20has%20been%20denied%20for%20this%20request.&quot;}&amp;inspectorId=35185", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionDetails", 50, 37, "500/Internal Server Error", 33, "401/Unauthorized", 4, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionVehicle", 50, 29, "500/Internal Server Error", 25, "401/Unauthorized", 4, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionMeasurements", 50, 29, "500/Internal Server Error", 25, "401/Unauthorized", 4, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
