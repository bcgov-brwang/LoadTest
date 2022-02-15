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

    var data = {"OkPercent": 74.96871088861076, "KoPercent": 25.031289111389235};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.567853170189099, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.945, 500, 1500, "GetInspectionDetail"], "isController": false}, {"data": [0.935, 500, 1500, "SubmitInspection"], "isController": false}, {"data": [0.0, 500, 1500, "Create Inspection"], "isController": true}, {"data": [0.88, 500, 1500, "StartInspection"], "isController": false}, {"data": [1.0, 500, 1500, "GetAccessToken"], "isController": false}, {"data": [0.975, 500, 1500, "AssignInspector"], "isController": false}, {"data": [0.065, 500, 1500, "SaveInspectionDetails"], "isController": false}, {"data": [0.155, 500, 1500, "SaveInspectionVehicle"], "isController": false}, {"data": [0.16, 500, 1500, "SaveInspectionMeasurements"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 799, 200, 25.031289111389235, 2116.9662077597027, 73, 54559, 218.0, 9020.0, 13862.0, 30287.0, 1.4060292081011214, 1.8031401419799142, 2.4732713946525133], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetInspectionDetail", 100, 0, 0.0, 225.35000000000005, 73, 797, 163.5, 532.7, 601.7499999999998, 796.7499999999999, 0.4354679974568669, 0.5065419880964823, 0.3631735056915667], "isController": false}, {"data": ["SubmitInspection", 100, 0, 0.0, 389.85000000000014, 302, 1028, 344.5, 567.0, 751.5999999999997, 1025.7999999999988, 0.3137353328731882, 0.13174432923385831, 0.2962715496956767], "isController": false}, {"data": ["Create Inspection", 100, 82, 82.0, 16920.140000000003, 2653, 58066, 15028.0, 33237.700000000004, 34623.549999999996, 57976.08999999995, 1.705495105229048, 17.49045189224682, 23.979760836289525], "isController": true}, {"data": ["StartInspection", 100, 0, 0.0, 847.12, 158, 16739, 210.5, 704.9, 8613.499999999907, 16688.719999999972, 0.7681376502669279, 0.32555834005453776, 0.7628867092983063], "isController": false}, {"data": ["GetAccessToken", 99, 0, 0.0, 141.07070707070704, 112, 218, 140.0, 156.0, 161.0, 218.0, 1.447347261004956, 1.2593617280814609, 0.797171733600386], "isController": false}, {"data": ["AssignInspector", 100, 0, 0.0, 248.03999999999988, 94, 3237, 186.0, 390.6, 434.1999999999998, 3212.3599999999874, 0.31399934688135844, 0.13185519449119545, 0.2710697486749228], "isController": false}, {"data": ["SaveInspectionDetails", 100, 81, 81.0, 5966.400000000002, 78, 54559, 186.5, 29779.000000000025, 30382.0, 54463.919999999955, 0.5009718854577881, 0.9087307110168727, 1.0694575601667236], "isController": false}, {"data": ["SaveInspectionVehicle", 100, 59, 59.0, 8414.95, 636, 31546, 10230.5, 16071.900000000001, 17682.649999999994, 31545.64, 0.5556605136525788, 1.6841234507490304, 0.5328697503972972], "isController": false}, {"data": ["SaveInspectionMeasurements", 100, 60, 60.0, 683.1899999999996, 77, 4111, 305.5, 1448.9000000000003, 1746.6499999999999, 4110.24, 0.37523592959073016, 0.7930853223182825, 2.544473372789391], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 200, 100.0, 25.031289111389235], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 799, 200, "500/Internal Server Error", 200, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["SaveInspectionDetails", 100, 81, "500/Internal Server Error", 81, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionVehicle", 100, 59, "500/Internal Server Error", 59, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionMeasurements", 100, 60, "500/Internal Server Error", 60, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
