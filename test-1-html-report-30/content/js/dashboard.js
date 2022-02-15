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

    var data = {"OkPercent": 80.3347280334728, "KoPercent": 19.665271966527197};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5353159851301115, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.75, 500, 1500, "GetInspectionDetail"], "isController": false}, {"data": [0.75, 500, 1500, "SubmitInspection"], "isController": false}, {"data": [0.0, 500, 1500, "Create Inspection"], "isController": true}, {"data": [0.7333333333333333, 500, 1500, "StartInspection"], "isController": false}, {"data": [0.7931034482758621, 500, 1500, "GetAccessToken"], "isController": false}, {"data": [0.75, 500, 1500, "AssignInspector"], "isController": false}, {"data": [0.3, 500, 1500, "SaveInspectionDetails"], "isController": false}, {"data": [0.4, 500, 1500, "SaveInspectionVehicle"], "isController": false}, {"data": [0.35, 500, 1500, "SaveInspectionMeasurements"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 239, 47, 19.665271966527197, 502.9999999999998, 0, 4898, 195.0, 1063.0, 1576.0, 3421.799999999986, 0.46888763764991165, 0.4258088158478136, 0.7944895770594271], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetInspectionDetail", 30, 6, 20.0, 187.39999999999998, 0, 726, 162.5, 530.2000000000003, 655.05, 726.0, 0.23150648989860015, 0.31018252357507753, 0.15445823622922228], "isController": false}, {"data": ["SubmitInspection", 30, 6, 20.0, 322.3999999999999, 67, 748, 337.0, 499.9000000000002, 650.0999999999999, 748.0, 0.16078721420072675, 0.07047002122391227, 0.14546218284721998], "isController": false}, {"data": ["Create Inspection", 30, 6, 20.0, 4110.3, 867, 10855, 3960.5, 5284.1, 7891.049999999996, 10855.0, 2.5564550489987217, 19.718074270345124, 34.55608223263741], "isController": true}, {"data": ["StartInspection", 30, 6, 20.0, 261.30000000000007, 120, 1795, 179.5, 588.6000000000006, 1162.499999999999, 1795.0, 0.2993205423688228, 0.13212195815498817, 0.28230837873028225], "isController": false}, {"data": ["GetAccessToken", 29, 5, 17.24137931034483, 574.103448275862, 118, 4898, 137.0, 1897.0, 4652.5, 4898.0, 0.5141023595525537, 1.6465783108635148, 0.28315794022230495], "isController": false}, {"data": ["AssignInspector", 30, 6, 20.0, 163.56666666666666, 0, 703, 135.0, 538.0000000000009, 673.8499999999999, 703.0, 0.16059269410303625, 0.09554010668707978, 0.11090932936490944], "isController": false}, {"data": ["SaveInspectionDetails", 30, 6, 20.0, 1019.8666666666667, 121, 1944, 1059.0, 1733.4000000000003, 1928.6, 1944.0, 0.2530599161528144, 0.11170222861432824, 0.5301901797990703], "isController": false}, {"data": ["SaveInspectionVehicle", 30, 6, 20.0, 606.9, 55, 1392, 668.0, 873.5000000000003, 1223.6999999999998, 1392.0, 0.28814568645907374, 0.1271893069135755, 0.26490268479743356], "isController": false}, {"data": ["SaveInspectionMeasurements", 30, 6, 20.0, 890.8333333333331, 114, 1866, 976.0, 1598.2000000000007, 1755.9999999999998, 1866.0, 0.21723074249467783, 0.09588700742929139, 1.465501382130599], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 83: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/assign?inspectionId={&quot;message&quot;:&quot;Authorization%20has%20been%20denied%20for%20this%20request.&quot;}&amp;inspectorId=35185", 6, 12.76595744680851, 2.510460251046025], "isController": false}, {"data": ["500/Internal Server Error", 5, 10.638297872340425, 2.092050209205021], "isController": false}, {"data": ["401/Unauthorized", 30, 63.829787234042556, 12.552301255230125], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 91: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/vehicleDetails?inspectionId={&quot;message&quot;:&quot;Authorization has been denied for this request.&quot;}", 6, 12.76595744680851, 2.510460251046025], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 239, 47, "401/Unauthorized", 30, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 83: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/assign?inspectionId={&quot;message&quot;:&quot;Authorization%20has%20been%20denied%20for%20this%20request.&quot;}&amp;inspectorId=35185", 6, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 91: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/vehicleDetails?inspectionId={&quot;message&quot;:&quot;Authorization has been denied for this request.&quot;}", 6, "500/Internal Server Error", 5, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetInspectionDetail", 30, 6, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 91: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/vehicleDetails?inspectionId={&quot;message&quot;:&quot;Authorization has been denied for this request.&quot;}", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SubmitInspection", 30, 6, "401/Unauthorized", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["StartInspection", 30, 6, "401/Unauthorized", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["GetAccessToken", 29, 5, "500/Internal Server Error", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["AssignInspector", 30, 6, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 83: https://dev-vip-proxied.th.gov.bc.ca/vip-api/api/v1/inspection/assign?inspectionId={&quot;message&quot;:&quot;Authorization%20has%20been%20denied%20for%20this%20request.&quot;}&amp;inspectorId=35185", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionDetails", 30, 6, "401/Unauthorized", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionVehicle", 30, 6, "401/Unauthorized", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SaveInspectionMeasurements", 30, 6, "401/Unauthorized", 6, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
