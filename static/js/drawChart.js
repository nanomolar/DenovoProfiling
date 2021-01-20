/* ==============================================================

Function: Draw Chart using D3.js
Author : RCDD Dujiewen
Version : v1.0.0
Created : 14 Jan  2017
Last update : 14 Feb  2017

============================================================== */
function generateRadar(data, dataLabel, el) {
    // 镭射图
    var radarChartData = {
        labels: ["MW", "ALogP", "HBD", "HBA", "TPSA", "RB"],
        datasets: [{
                fillColor: "rgba(255,99,132,0.2)",
                strokeColor: "rgba(255,99,132,1)",
                pointColor: "rgba(255,99,132,1)",
                pointStrokeColor: "#fff",
                data: [(500) / 1200, (5 + 3) / 15, 5 / 15, 10 / 15, 140 / 250, 10 / 20],
                dataLabel: [500, 5, 5, 10, 140, 10]
            },
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                data: data,
                dataLabel: dataLabel
            }
        ]
    }
    var ctx = document.getElementById(el).getContext("2d");
    var myNewChart = new Chart(ctx).Radar(radarChartData, {
        animation: true,
        showTooltips: true,
        scaleLineWidth: 1,
        pointDot: true,
        pointLabelFontFamily: "'Helvetica Neue'",
        pointLabelFontSize: 12,
        scaleOverride: true,
        scaleSteps: 5,
        scaleShowLabels: false,
        scaleStepWidth: 0.3
    });
}

function generateUniformHistogram(binSize, sampleData, element) {
    var cwidth = 560,
        cheight = 320;
    var margin = { top: 20, right: 10, bottom: 20, left: 40 };

    //setting up empty data array
    var data = [];

    getData(); // popuate data
    // line chart based on http://bl.ocks.org/mbostock/3883245
    var width = cwidth - 60,
        height = cheight - 40;
    //  X轴使用序数比例尺
    var xScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    //  Y轴使用线性比例尺
    var yScale = d3.scale.linear().range([height, 0]);

    // 定义x轴和y轴
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("%"));

    var svg = d3.select(element).append("svg")
        .attr("width", cwidth)
        .attr("height", cheight)
        .append("g")
        .attr("transform", "translate(60,0)");

    // p:个数，q:X轴的刻度
    xScale.domain(data.map(function(d) {
        return d.q;
    }));

    yScale.domain(d3.extent(data, function(d) {
        return d.p / sampleData.length;
    }));

    // 添加坐标轴元素
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,280)")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.q); })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return yScale(d.p / sampleData.length); })
        .attr("height", function(d) { return height - yScale(d.p / sampleData.length); });

    svg.append("g") //add label for x axis
        .attr("class", "x axis label")
        .attr("transform", "translate(40,185)")
        .append("text")
        .attr("class", "axislabel")
        .attr("text-anchor", "middle")
        .attr("x", 200)
        .attr("y", 130)
        .text("Smililarity"); 
    
    svg.append("g") //add label for y axis
        .attr("class", "y axis label")
        .attr("transform", "rotate(-90)")
        .append("text")
        .attr("class", "axislabel")
        .attr("text-anchor", "middle")
        .attr("x", -130)
        .attr("y", -45)
        .text("Distrubution"); 

    function getData() {
        var i;
        var binNum = binSize;
        var rValues = sampleData;
        var valNum = sampleData.length;
        var bins = [];
        for (i = 0; i < binNum; i++) {
            bins.push(0);
        }
        var rRange = d3.extent(rValues, function(d) {
            return d;
        });
        for (i = 0; i < valNum; i++) {
            var bin = Math.floor((rValues[i] - rRange[0]) / ((rRange[1] - rRange[0]) / (binNum - 1)));
            bins[bin] += 1;
        }
        //  p:个数，q:X轴的刻度
        var binInterval = ((rRange[1] - rRange[0]) / (binNum - 1));
        for (i = 0; i < binNum; i++) {
            data.push({ q: Math.round((binInterval * i + rRange[0]) * 10) / 10, p: bins[i] });
        }
    }
    return true;
}

function UniformHistogram2(binSize, sampleData, element) {
    var cwidth = 480,
        cheight = 250;
    var margin = { top: 20, right: 10, bottom: 20, left: 40 };

    //setting up empty data array
    var data = [];

    getData(); // popuate data
    // line chart based on http://bl.ocks.org/mbostock/3883245
    var width = cwidth - margin.left-margin.right,
        height = cheight-margin.top-margin.bottom;
    //  X轴使用序数比例尺
    var xScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    //  Y轴使用线性比例尺
    var yScale = d3.scale.linear().range([height, 0]);

    // 定义x轴和y轴
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("%"));

    var svg = d3.select(element).append("svg")
        .attr("width", cwidth)
        .attr("height", cheight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // p:个数，q:X轴的刻度
    xScale.domain(data.map(function (d) {
        return d.q;
    }));

    yScale.domain(d3.extent(data, function (d) {
        return d.p / sampleData.length;
    }));

    // 添加坐标轴元素
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xScale(d.q); })
        .attr("width", xScale.rangeBand())
        .attr("y", function (d) { return yScale(d.p / sampleData.length); })
        .attr("height", function (d) { return height - yScale(d.p / sampleData.length); });

    function getData() {
        var i;
        var binNum = binSize;
        var rValues = sampleData;
        var valNum = sampleData.length;
        var bins = [];
        for (i = 0; i < binNum; i++) {
            bins.push(0);
        }
        var rRange = d3.extent(rValues, function (d) {
            return d;
        });
        for (i = 0; i < valNum; i++) {
            var bin = Math.floor((rValues[i] - rRange[0]) / ((rRange[1] - rRange[0]) / (binNum - 1)));
            bins[bin] += 1;
        }
        //  p:个数，q:X轴的刻度
        var binInterval = ((rRange[1] - rRange[0]) / (binNum - 1));
        for (i = 0; i < binNum; i++) {
            data.push({ q: Math.round((binInterval * i + rRange[0]) * 10) / 10, p: bins[i] });
        }
    }
    return true;
}

//红色代表相似度为1，绿色为0。越红越相似。similarity为1-d.value
function generateHeatmap(element, dataUrl) {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 600 - margin.left - margin.right,
        height = 540 - margin.top - margin.bottom,
        buckets = 10,
        colors = ["#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#ECF5FF", "#FFE6D9", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd"]; // alternatively colorbrewer.YlGnBu[9]
    var a = d3.rgb(255, 64, 64); //红色
    var b = d3.rgb(0, 204, 0); //蓝色

    var gridSize;
    var legendElementWidth;
    d3.tsv(dataUrl,
        function(d) {
            return {
                row: Number(d.row),
                col: Number(d.col),
                value: Math.round(d.value * 100) / 100
            };
        },
        function(error, data) {
            if (error) {
                alert(error);
            } else {
                var molCnt = Math.sqrt(data.length);
                gridSize = (500 / molCnt).toFixed(2);
                legendElementWidth = gridSize * 10;

                var svg = d3.select(element).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(4,4)")
                    .attr("class", "matrix_main");
                var heatmapChart = function(data) {
                    var colorScale = d3.interpolate(a, b);
                    var cards = svg.selectAll(".hour")
                        .data(data, function(d) { return d.row + ':' + d.col; });
                    cards.enter().append("rect")
                        .attr("x", function(d) { return (d.col - 1) * gridSize; })
                        .attr("y", function(d) { return (d.row - 1) * gridSize; })
                        .attr("class", "hour bordered")
                        .attr("width", gridSize)
                        .attr("height", gridSize)
                        .style("stroke", "#ccc")
                        .style("stroke-width", ".5px")
                        .on("mouseover", function(d) {
                            d3.select(this).style("stroke", "yellow").style("stroke-width", "2px");
                            var mol1 = libDetail.mols[d.col - 1];
                            var mol2 = libDetail.mols[d.row - 1];
                            $(".label-col-hover").text("Col: " + mol1.MolName);
                            $(".label-row-hover").text("Row: " + mol2.MolName);
                            $(".label-sim-hover").text("Similarity: " + (1 - d.value).toFixed(2));
                            hoverMolInitial();
                            loadMolOfHeatMap(mol1.Mol, 0);
                            loadMolOfHeatMap(mol2.Mol, 1);
                        })
                        .on("mouseout", function(d, i) {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("stroke", "#ccc").style("stroke-width", ".5px");
                        })
                        .on("click", function(d) {
                            var mol3 = libDetail.mols[d.col - 1];
                            var mol4 = libDetail.mols[d.row - 1];
                            $(".label-col-select").text("Col: " + mol3.MolName);
                            $(".label-row-select").text("Row: " + mol4.MolName);
                            $(".label-sim-select").text("Similarity: " + (1 - d.value).toFixed(2));
                            selectMolInitial();
                            loadMolOfHeatMap(mol3.Mol, 2);
                            loadMolOfHeatMap(mol4.Mol, 3);
                        });
                    cards.transition().duration(1000)
                        .style("fill", function(d) { return colorScale(d.value); });

                    cards.exit().remove();

                    var legend = d3.select(element).select("svg").append("g")
                        .attr("transform", "translate(520,4)")
                        .attr("class", "legend");

                    var defs = legend.append("defs");
                    var linearGradient = defs.append("linearGradient")
                        .attr("id", "linearColor")
                        .attr("x1", "0%")
                        .attr("y1", "100%")
                        .attr("x2", "0%")
                        .attr("y2", "0%");

                    var stop1 = linearGradient.append("stop")
                        .attr("offset", "0%")
                        .style("stop-color", colorScale(0));

                    var stop2 = linearGradient.append("stop")
                        .attr("offset", "100%")
                        .style("stop-color", colorScale(1));
                    //添加一个矩形，并应用线性渐变
                    var colorRect = legend.append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", 20)
                        .attr("height", 500)
                        .style("fill", "url(#" + linearGradient.attr("id") + ")");

                    //  Y轴使用线性比例尺
                    var yScale = d3.scale.ordinal().domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]).rangePoints([0, 500]);
                    var legend_yAxis = d3.svg.axis().scale(yScale).orient("right");

                    legend.append("g")
                        .attr("class", "y axis legendyAxis")
                        .attr("transform", "translate(25,0)")
                        .call(legend_yAxis);

                    function loadMolOfHeatMap(molStr, index) {
                        var tempCanvas = canMap.get(71 + index);
                        var molecule = ChemDoodle.readMOL(molStr);
                        ChemDoodle.informatics.removeH(molecule);
                        structureStyle(tempCanvas);
                        tempCanvas.loadMolecule(molecule);
                    }
                }

                heatmapChart(data);

                // similarity部分直方统计图
                var tempArr = [];
                for (var n = 0, temp_length = data.length; n < temp_length; n++) {
                    tempArr.push((1 - data[n].value));
                }
                generateUniformHistogram(10, tempArr, "#cartogramAllData");
            }
        });
}

// 多样性分析散点图
function generateScatterplot(element, dataUrl) {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 630 - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;

    d3.tsv(dataUrl,
        function(d) {
            return {
                pca1: Number(d.PC1),
                pca2: Number(d.PC2)
            };
        },
        function(error, data) {
            if (error) {
                alert(error);
            } else {
                var svg = d3.select(element).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(60,20)")
                    .attr("class", "pcamain");
                // 创建x轴的比例尺
                var xMin = d3.min(data, function(d) {
                    return d.pca1;
                }) - 0.3;
                var xMax = d3.max(data, function(d) {
                    return d.pca1;
                }) + 0.3;
                var xScale = d3.scale.linear()
                    .domain([xMin, xMax]).range([0, width-30]);

                // 创建y轴的比例尺
                var yMin = d3.min(data, function(d) {
                    return d.pca2;
                }) - 0.3;
                var yMax = d3.max(data, function(d) {
                    return d.pca2;
                }) + 0.3;

                var yScale = d3.scale.linear()
                    .domain([yMin, yMax]).range([height-30, 0]);
                // 创建x轴
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');
                // 创建y轴
                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left');
                // 把x轴应用到对应的SVG元素上
                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(10,310)')
                    .call(xAxis);
                // 把y轴应用到对应的SVG元素上
                svg.append('g')
                    .attr('class', 'y axis')
                    .attr('transform',"translate(10,0)")
                    .call(yAxis);

                // 添加散点
                svg.selectAll('.point')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('class', 'point')
                    .attr('cx', function(d) {
                        return xScale(d.pca1);
                    })
                    .attr('cy', function(d) {
                        return yScale(d.pca2);
                    })
                    .attr('r', 4)
                    .on('mouseover', function(d, i) {
                        var molecule = ChemDoodle.readMOL(libDetail.mols[i].Mol);
                        ChemDoodle.informatics.removeH(molecule);
                        structureStyle(sketcher75);
                        sketcher75.loadMolecule(molecule);
                        $(".label-molName").text("Mol name: " + libDetail.mols[i].MolName);
                        // $(".label-pc1").text("PC1: " + d.pca1.toFixed(3));
                        // $(".label-pc2").text("PC2: " + d.pca2.toFixed(3));
                    });

                svg.append("g") //add label for x axis
                    .attr("class", "x axis label")
                    .attr("transform", "translate(0,345)")
                    .append("text")
                    .attr("class", "axislabel")
                    .attr("text-anchor", "middle")
                    .attr("x", 300)
                    .attr("y", 2)
                    .text("PC1");

                svg.append("g") //add label for y axis
                    .attr("class", "y axis label")
                    .attr("transform", "rotate(-90)")
                    .append("text")
                    .attr("class", "axislabel")
                    .attr("text-anchor", "middle")
                    .attr("x", -170)
                    .attr("y", -30)
                    .text("PC2"); 
            }
        });
}

// 骨架分析 散点图
function scaffoldScatter(element, dataUrl) {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 630 - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;

    d3.tsv(dataUrl,
        function (d) {
            return {
                COMPLEXITY: Number(d.COMPLEXITY),
                CYCLICITY: Number(d.CYCLICITY),
                CID: Number(d.CID)
            };
        },
        function (error, data) {
            if (error) {
                alert(error);
            } else {
                var svg = d3.select(element).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(60,20)")
                    .attr("class", "pcamain");
                // 创建x轴的比例尺
                var xMin = d3.min(data, function (d) {
                    return d.COMPLEXITY;
                })-3;
                var xMax = d3.max(data, function (d) {
                    return d.COMPLEXITY;
                })+3;
                var xScale = d3.scale.linear()
                    .domain([xMin, xMax]).range([0, 550]);

                // 创建y轴的比例尺
                var yMin = d3.min(data, function (d) {
                    return d.CYCLICITY;
                })-3;
                var yMax = d3.max(data, function (d) {
                    return d.CYCLICITY;
                })+3;

                var yScale = d3.scale.linear()
                    .domain([yMin, yMax]).range([320, 0]);
                // 创建x轴
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');
                // 创建y轴
                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left');
                // 把x轴应用到对应的SVG元素上
                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,320)')
                    .call(xAxis);
                // 把y轴应用到对应的SVG元素上
                svg.append('g')
                    .attr('class', 'y axis')
                    .attr('transform', "translate(0,0)")
                    .call(yAxis);

                // 添加散点
                svg.selectAll('.point')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('class', 'point')
                    .attr('cx', function (d) {
                        return xScale(d.COMPLEXITY);
                    })
                    .attr('cy', function (d) {
                        return yScale(d.CYCLICITY);
                    })
                    .attr('r', 4)
                    .on('mouseover', function (d, i) {
                        // @todo： 遍历骨架数组，得到cid相同的骨架
                        scaffold_mol = '';
                        (function IIFE() {
                            cnt = libDetail.scaffold.length;
                            for (var i = 0; i < cnt; i++) {
                                if (libDetail.scaffold[i].Cid == d.CID) {
                                    scaffold_mol = libDetail.scaffold[i].Mol
                                    break
                                }
                            }
                        })();
                        var molecule = ChemDoodle.readMOL(scaffold_mol);
                        ChemDoodle.informatics.removeH(molecule);
                        structureStyle(sketcher76);
                        sketcher76.loadMolecule(molecule);
                        $(".label-cid1").text("Scaffold CID: " + d.CID);
                    });

                svg.append("g") //add label for x axis
                    .attr("class", "x axis label")
                    .attr("transform", "translate(0,350)")
                    .append("text")
                    .attr("class", "axislabel")
                    .attr("text-anchor", "middle")
                    .attr("x", 300)
                    .attr("y", 2)
                    .text("COMPLEXITY");

                svg.append("g") //add label for y axis
                    .attr("class", "y axis label")
                    .attr("transform", "rotate(-90)")
                    .append("text")
                    .attr("class", "axislabel")
                    .attr("text-anchor", "middle")
                    .attr("x", -170)
                    .attr("y", -30)
                    .text("CYCLICITY");
            }
        });
}

// 骨架分析 棒状图
function scaffoldBarChart(dataset, element) {
    var padding = { top: 20, right: 20, bottom: 20, left: 20 };
    var cwidth = 630,
        cheight = 380;
    var width = cwidth - padding.left - padding.right -20 ,
        height = cheight - padding.top - padding.bottom -20;
    console.log("scaffoldBarChart");
    console.log(dataset);
    //x轴的比例尺
    var xScale = d3.scale.ordinal()
        .domain(d3.range(0, dataset.length))
        .rangeRoundBands([0, width],0.1);

    //y轴的比例尺
    var yScale = d3.scale.ordinal()
        .domain(d3.range(0, d3.max(dataset)+1))
        .rangeRoundPoints([height, 0]);

    // 定义x轴和y轴
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var svg = d3.select(element).append("svg")
        .attr("width", cwidth)
        .attr("height", cheight)
        .append("g")
        .attr("transform", "translate(60,20)");

    // 添加坐标轴元素
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0,320)")
    //     .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

    //矩形之间的空白
    var rectPadding = 0.1;
    svg.selectAll(".bar")
        .data(dataset)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i) { return xScale(i) + rectPadding/2;})
        .attr("y", function(d) { return yScale(d); })
        .attr("width", xScale.rangeBand()-rectPadding)
        .attr("height", function(d) { return height - yScale(d);})
        .attr('fill',"steelblue")
        .on('mouseover', function (d, i) {
            // d中的数据就是按libDetail.scaffold数组中的顺序构建的
            var molecule = ChemDoodle.readMOL(libDetail.scaffold[i].Mol);
            ChemDoodle.informatics.removeH(molecule);
            structureStyle(sketcher77);
            sketcher77.loadMolecule(molecule);
            $(".label-cid2").text("Scaffold CID: " + libDetail.scaffold[i].Cid);
        });
        // .on('mouseover', function(){
        //   d3.select(this).attr('fill','yellow');
        // })
        // .on('mouseout', function(d, i){
        //   d3.select(this).transition().duration(500).attr('fill','steelblue')
          
        // });

    svg.append("g") //add label for x axis
        .attr("class", "x axis label")
        .attr("transform", "translate(20,340)")
        .append("text")
        .attr("class", "axislabel")
        .attr("text-anchor", "middle")
        .attr("x", 250)
        .attr("y", 0)
        .text("Scaffolds");

    svg.append("g") //add label for y axis
        .attr("class", "y axis label")
        .attr("transform", "rotate(-90)")
        .append("text")
        .attr("class", "axislabel")
        .attr("text-anchor", "middle")
        .attr("x", -160)
        .attr("y", -25)
        .text("Counts"); 
    
}

//绘制力导向图

var nodes = null;
var edges = null;
var network = null;
var highlightActive = false;

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function drawNetwork(nodes, edges) {
    destroy();
    // create a network
    var container = document.getElementById('targetsNetwork');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        groups: {
            0: {
                font: {
                    /*size: 50,*/ // px
                    face: 'Arimo',
                    background: 'none',
                    strokeWidth: 0, // px
                    strokeColor: '#ffffff',
                    align: 'center'
                },
                size: 20,
                shape: 'dot',
                color: 'rgba(255,160,122,1)',
                border: 2,
            },
            1: {
                font: {
                    color: "rgba(0,0,0,1)",
                    face: 'Arimo',
                    background: 'none',
                    strokeWidth: 2, // px
                    strokeColor: '#fff',
                    align: 'center'
                },
                size: 20,
                // shape: 'square',
                shape: 'triangle',
                /*color: 'rgba(238,99,99,1)',*/
                // color: {background:'#F03967', border:'#713E7F'}
                color: 'rgba(92,172,238,1)'
            }
            // 2: {
            //     color: 'rgba(255,160,122,1)'
            // },
            // 3: {
            //     size: 40,
            //     shape: 'dot',
            //     color: 'rgba(92,172,238,1)'

            // },
            // 4: {
            //     size: 40,
            //     shape: 'diamond',
            //     color: { background: 'pink', border: 'purple' }

            // },
            // 9: {
            //     color: 'rgba(255,160,122,1)'
            // }
        },
        edges: {
            arrows: {
                middle: {
                    enabled: true,
                    scaleFactor: 2
                }
            },
            arrowStrikethrough: true,
            color: {
                color: '#3399CC',
                highlight: '#CC3366',
                hover: '#CC3366',
                opacity: 0.5
            },
            width: 2.0,
            hoverWidth: 5.0,
            smooth: {
                enabled: true,
                type: "dynamic",
                roundness: 0.5
            }
        },
        layout: {
            randomSeed: 34
        },
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -20,
                centralGravity: 0.005,
                springLength: 240,
                springConstant: 0.205,
                avoidOverlap: 0.3
            },
            maxVelocity: 148,
            solver: 'forceAtlas2Based',
            timestep: 0.22,
            stabilization: {
                enabled: true,
                iterations: 50,
                updateInterval: 25
            }
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            hover: true,
            hideEdgesOnDrag: true
        }
    }
    network = new vis.Network(container, data, options);

    function clearPopUp() {
        document.getElementById('saveButton').onclick = null;
        document.getElementById('cancelButton').onclick = null;
        document.getElementById('network-popUp').style.display = 'none';
    }

    function cancelEdit(callback) {
        clearPopUp();
        callback(null);
    }

    function saveData(data, callback) {
        data.id = document.getElementById('node-id').value;
        data.label = document.getElementById('node-label').value;
        clearPopUp();
        callback(data);
    }
}