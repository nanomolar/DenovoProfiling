/* ==============================================================

Project name : ChemProfiling
File name : JS script of Result.html
Author : RCDD Dujiewen
Version : v1.1.0
Created : 14 Jan 2017
Last update : 15 Sep 2017

============================================================== */
/*
 **  global variable
 */

//  全局变量存储json信息
var libDetail;
var moduleName = {
    structure: "structure",
    diversity: "diversity",
    alignment: "alignment",
    scaffold: "scaffold",
    target: "target",
    drugs: "drugs",
    network: "network"
}

function Module(moduleName, viewerCnt) {
    this.name = moduleName;
    this.viewerCnt = viewerCnt;
    this.startIndex = 0;
    this.currentPage = 0;
    this.maxPages = 1;
    this.perPageMols = [];
}
Module.prototype = {
    constructor: Module,
    show: function() {
        for (var i = 0; i < this.viewerCnt; i++) {
            var ele = "#" + this.name + "-" + i;
            $(ele).show();
        }
    },
    hide: function(cnt) {
        for (var i = cnt; i < this.viewerCnt; i++) {
            var ele = "#" + this.name + "-" + i;
            $(ele).css("display", "none");
        }
    }
};
//magicNo：各个chemdoodle窗口声明时的索引偏移
//加载单个分子结构
function loadMol(index, magicNo) {
    var tempCanvas = canMap.get(index + magicNo);
    var molecule = this.name == "drugs" ? ChemDoodle.readMOL(this.perPageMols[index].DrugMol) : ChemDoodle.readMOL(this.perPageMols[index].Mol);
    ChemDoodle.informatics.removeH(molecule);
    structureStyle(tempCanvas);
    tempCanvas.loadMolecule(molecule);
}
//加载单个骨架对应的分子结构
//和loadMol函数应用的数据结构不一样
function loadMolsOfScaf(index, magicNo, startNo) {
    var tempCanvas = canMap.get(index + magicNo);
    var molecule = ChemDoodle.readMOL(this.allMols[index + startNo].Mol);
    ChemDoodle.informatics.removeH(molecule);
    structureStyle(tempCanvas);
    tempCanvas.loadMolecule(molecule);
    $(".scafD-mol-name-" + index).text(this.allMols[index + startNo].MolName);
}

function addMolInfo(molData) {
    var currentMolCnt = molData.length;
    var ele = "#" + this.name + "-";
    //  加载mol数据
    if (this.name == moduleName.structure) {
        structureInitial();
        this.show();
        this.hide(currentMolCnt);
        for (var i = 0; i < currentMolCnt; i++) {
            loadMol.call(this, i, 0);;
            $(ele + i + " .grid-molBtn .pull-left").html(libDetail.mols[this.startIndex + i].MolName);
			$(ele + i + " .grid-molBtn .pull-right").html("CID:"+"<a href=' https://pubchem.ncbi.nlm.nih.gov/compound/" + libDetail.mols[this.startIndex + i].Cid +
                "' target='_blank' rel='noopener noreferrer'>" + libDetail.mols[this.startIndex + i].Cid + "</a>");
            $(ele + i + " .js-str-molInfoPopup").attr("data-index", i);
            $(ele + i + " .tcell-ID").html(molData[i].Id);
            $(ele + i + " .tcell-Name").html(libDetail.mols[this.startIndex + i].MolName);
			//$(ele + i + " .tcell-CID").html(libDetail.mols[this.startIndex + i].Cid); 
			
			$(ele + i + " .tcell-CID").html("<a href=' https://pubchem.ncbi.nlm.nih.gov/compound/" + libDetail.mols[this.startIndex + i].Cid +
                "' target='_blank' rel='noopener noreferrer'>" + libDetail.mols[this.startIndex + i].Cid + "</a>");
			
			   
            $(ele + i + " .tcell-MW").html(libDetail.props[this.startIndex + i].MolWeight.toFixed(2));
            $(ele + i + " .tcell-ALogP").html(libDetail.props[this.startIndex + i].Alogp.toFixed(2));
            $(ele + i + " .tcell-HBD").html(libDetail.props[this.startIndex + i].Hbd);
            $(ele + i + " .tcell-HBA").html(libDetail.props[this.startIndex + i].Hba);
            $(ele + i + " .tcell-RB").html(libDetail.props[this.startIndex + i].RotBonds);
            $(ele + i + " .tcell-TPSA").html(libDetail.props[this.startIndex + i].Tpsa.toFixed(2));
			
            //绘制雷达图
            var radarChartEl = "radarChart" + i;
            var data = [libDetail.props[this.startIndex + i].MolWeight / 1200, (libDetail.props[this.startIndex + i].Alogp + 3) / 15, libDetail.props[this.startIndex + i].Hbd / 15, libDetail.props[this.startIndex + i].Hba / 15, libDetail.props[this.startIndex + i].Tpsa / 250, libDetail.props[this.startIndex + i].RotBonds / 20];
            var dataLabel = [libDetail.props[this.startIndex + i].MolWeight, libDetail.props[this.startIndex + i].Alogp, libDetail.props[this.startIndex + i].Hba, libDetail.props[this.startIndex + i].Hbd, libDetail.props[this.startIndex + i].Tpsa, libDetail.props[this.startIndex + i].RotBonds];
            generateRadar(data, dataLabel, radarChartEl);
        }
    } else if (this.name == moduleName.scaffold) {
        scaffoldInitial();
        this.show();
        this.hide(currentMolCnt);
        for (var i = 0; i < currentMolCnt; i++) {
            loadMol.call(this, i, 15);
            $(ele + i + " .js-scaf-molInfoPopup").attr("data-index", i);
            $(ele + i + " .scaf-cid").html("CID: " + molData[i].Cid);
            $(ele + i + " .scaf-count").html("Mol Count: " + molData[i].Count);
        }
    } else if (this.name == moduleName.alignment) {
        alignmentInitial();
        this.show();
        this.hide(currentMolCnt);
        for (var i = 0; i < currentMolCnt; i++) {
            loadMol.call(this, i, 65);
            $(ele + i + " .pull-right").html(molData[i].MolName);
            $(ele + i + " .image").attr("data-index", i);
        }
    } else if (this.name == moduleName.drugs) {
        refMolInitial();
        drugInitial();
        this.show();
        this.hide(currentMolCnt);
        var molsOfDrugs = new Array();
        for (var i = 0; i < currentMolCnt; i++) {
            var tempID = +molData[i].ReferenceId;
            molsOfDrugs.push(libDetail.mols[tempID]);
            var tempMolObj = {
                perPageMols: molsOfDrugs
            };
            loadMol.call(this, i, 50);
            loadMol.call(tempMolObj, i, 35);
            $(ele + i + " .grid-molBtn .pull-left").html(molData[i].DrugbankId);
            $(ele + i + " .grid-molBtn .pull-right").html("Sim: " + molData[i].Sim + "%");
            $(ele + i + " .tcell-sim").html(molData[i].Sim + "%");
            $(ele + i + " .tcell-cas").html(molData[i].CasNumber);
            $(ele + i + " .tcell-dbID").html("<a href='https://www.drugbank.ca/drugs/" + molData[i].DrugbankId +
                "' target='_blank' rel='noopener noreferrer'>" + molData[i].DrugbankId + "</a>");
            $(ele + i + " .tcell-name").html(molData[i].CommonName);
        }
    }
}

//  定义Jobid
var JobID;

//var glviewer = null;

/*  @js 辅助功能
 ***************************************************************************************/
//  @js 获取地址栏的jobid,用正则
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

Array.prototype.removeByValue = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                this.splice(i, 1);
                break;
            }
        }
    }
    /*  @js 数据加载
     ***************************************************************************************/
$(function() {
    JobID = GetQueryString("jobid");
    //  @TODO:  添加loading效果
    //  @js 请求分析结果
    $.ajax({
        url: "profiling",
        type: "POST",
        // timeout: 180000,
        data: {
            jobid: JobID
        },
        dataType: "html",
        error: function(jqXHR, textStatus, errorThrown) {
            if (textStatus == "timeout") {
                alert("Request timeout, please resubmit the task.");
            } else {
                alert(textStatus);
            }
        }
    }).done(loadData);
});
//  @js 处理返回的数据
function loadData(msg) {
    var dataMsg = JSON.parse(msg);
    if (dataMsg.State != "success") {
        alert("No data returned from the server.");
        $(".inner").hide();
        $(".errorTips").show();
        $(".returnPreview").on('click', function(event) {
            event.preventDefault();
            window.history.go(-1);
            /* Act on the event */
        });
        //  @todo: 返回上一个页面，即带有输入文件的service页面
    } else {
        libDetail = dataMsg.Data;
        var jobType = libDetail.job.JobType;
        var canvasCnt1 = 15,
            canvasCnt2 = 6;

        console.log(libDetail);
        if (jobType.indexOf(moduleName.structure) >= 0) {
            var molCount = libDetail.mols.length;
            var strucModule = new Module(moduleName.structure, canvasCnt1);
            // 向每页的mol数组中添加分子结构
            if (molCount <= strucModule.viewerCnt) {
                (function IIFE() {
                    for (var i = 0; i < molCount; i++) {
                        strucModule.perPageMols.push(libDetail.mols[i]);
                    }
                })();
            } else {
                (function IIFE() {
                    for (var i = 0; i < strucModule.viewerCnt; i++) {
                        strucModule.perPageMols.push(libDetail.mols[i]);
                    };
                })();
            }
            addMolInfo.call(strucModule, strucModule.perPageMols);
            //初始化翻页组件
            //  @js jqPagination初始化
            if (molCount % strucModule.viewerCnt === 0) {
                strucModule.maxPages = molCount / strucModule.viewerCnt
            } else {
                strucModule.maxPages = Math.ceil(molCount / strucModule.viewerCnt);
            }
            strucModule.currentPage = 1;
            $(".str_pagination").jqPagination({
                current_page: strucModule.currentPage,
                max_page: strucModule.maxPages,
                paged: function(page) {
                    //点击页码要做的操作                
                    page = parseInt(page, 10);
                    console.log(page);
                    strucModule.currentPage = page;
                    var startMol = (page - 1) * strucModule.viewerCnt;
                    var endMol = page * strucModule.viewerCnt - 1;
                    strucModule.perPageMols = [];
                    strucModule.perPageMols = endMol <= molCount ? libDetail.mols.slice(startMol, endMol + 1) : strucModule.perPageMols = libDetail.mols.slice(startMol);
                    strucModule.startIndex = startMol;
                    addMolInfo.call(strucModule, strucModule.perPageMols);
                }
            });
            $(".inner").hide();
            $(".tab-group").show();
            $("label[data-name='structure'], section[data-name='structure']").show();
            //  @js 单个分子详细信息弹框
            molInfo(strucModule);

            function molInfo(obj) {
                var molObj = obj;
                $(".js-str-molInfoPopup").on({
                    mouseenter: function() {
                        var molIndex = parseInt($(this).attr("data-index"));
                        var elMolID = $(this).parent().find(".grid-molBtn .pull-left").html();
                        var currentMol = molObj.perPageMols[molIndex];
                        if (!currentMol) {
                            return false;
                        } else {
                            structureStyle(sketcher30);
                            var molecule1 = ChemDoodle.readMOL(currentMol.Mol);
                            ChemDoodle.informatics.removeH(molecule1);
                            sketcher30.loadMolecule(molecule1);
                            var index = molObj.startIndex + molIndex;
                            $(".modal-title").text(libDetail.props[index].MolName);
                            var radarChartEl = "selectRadar";
                            var data = [libDetail.props[index].MolWeight / 1200, (libDetail.props[index].Alogp + 3) / 15, libDetail.props[index].Hba / 15, libDetail.props[index].Hbd / 15, libDetail.props[index].Tpsa / 250, libDetail.props[index].RotBonds / 20];
                            var dataLabel = [libDetail.props[index].MolWeight, libDetail.props[index].Alogp, libDetail.props[index].Hba, libDetail.props[index].Hbd, libDetail.props[index].Tpsa, libDetail.props[index].RotBonds];
                            generateRadar(data, dataLabel, radarChartEl);
                            $(".singleMolInfo .singleMol_MW").text(libDetail.props[molObj.startIndex + molIndex].MolWeight.toFixed(2));
                            $(".singleMolInfo .singleMol_RB").text(libDetail.props[molObj.startIndex + molIndex].RotBonds);
                            $(".singleMolInfo .singleMol_HBD").text(libDetail.props[molObj.startIndex + molIndex].Hbd);
                            $(".singleMolInfo .singleMol_HBA").text(libDetail.props[molObj.startIndex + molIndex].Hba);
                            $(".singleMolInfo .singleMol_Alogp").text(libDetail.props[molObj.startIndex + molIndex].Alogp.toFixed(2));
                            $(".singleMolInfo .singleMol_tpsa").text(libDetail.props[molObj.startIndex + molIndex].Tpsa.toFixed(2));
                            var el = document.getElementById(radarChartEl);
                            el.removeAttribute('style');
                            el.setAttribute("width", "300px");
                            el.setAttribute("height", "280px");
                        }
                    },
                    click: function() {
                        // 弹出分子的详细信息框
                        $('#myModal').modal('show');
                        $(".scaffold-detail").hide();
                        $(".mol-detail").show();
                    }
                });
            }
        }
        if (jobType.indexOf(moduleName.diversity) >= 0) {
            $("label[data-name='diversity']").show();
            for (var i = 0, MW_length = libDetail.des.MolWeight.length; i < MW_length; i++) {
                libDetail.des.MolWeight[i] = Math.round(libDetail.des.MolWeight[i]);
            }
            var imgRelation = {
                MolWeight: "#distribution-chart0",
                Alogp: "#distribution-chart1",
                Hba: "#distribution-chart2",
                Hbd: "#distribution-chart3",
                Tpsa: "#distribution-chart4",
                RotBonds: "#distribution-chart5"
            };
            for (var i in imgRelation) {
                UniformHistogram2(10, libDetail.des[i], imgRelation[i]);
            }
            var heatMapFileUrl = "jobs/" + JobID + "/distance.csv";
            generateHeatmap("#heatMap", heatMapFileUrl);
            var pcaFileUrl = "jobs/" + JobID + "/pca.csv";
            generateScatterplot("#pcaPlot", pcaFileUrl);
        }
        if (jobType.indexOf(moduleName.scaffold) >= 0) {
            $("label[data-name='scaffold']").show();
            var scafCount = libDetail.scaffold.length;
            var scafModule = new Module(moduleName.scaffold, canvasCnt1);
            if (scafCount) {
                if (scafCount <= scafModule.viewerCnt) {
                    (function IIFE() {
                        for (var i = 0; i < scafCount; i++) {
                            scafModule.perPageMols.push(libDetail.scaffold[i]);
                        }
                    })();
                } else {
                    (function IIFE() {
                        for (var i = 0; i < scafModule.viewerCnt; i++) {
                            scafModule.perPageMols.push(libDetail.scaffold[i]);
                        };
                    })();
                }
                addMolInfo.call(scafModule, scafModule.perPageMols);
                if (scafCount % scafModule.viewerCnt === 0) {
                    scafModule.maxPages = scafCount / scafModule.viewerCnt
                } else {
                    scafModule.maxPages = Math.ceil(scafCount / scafModule.viewerCnt);
                }
                scafModule.currentPage = 1;
                $(".scaf_pagination").jqPagination({
                    current_page: scafModule.currentPage,
                    max_page: scafModule.maxPages,
                    paged: function(page) {
                        page = parseInt(page, 10);
                        scafModule.currentPage = page;
                        var startMol = (page - 1) * scafModule.viewerCnt;
                        var endMol = page * scafModule.viewerCnt - 1;
                        scafModule.perPageMols = [];
                        scafModule.perPageMols = endMol <= scafCount ? libDetail.scaffold.slice(startMol, endMol + 1) : scafModule.perPageMols = libDetail.scaffold.slice(startMol);
                        scafModule.startIndex = startMol;
                        addMolInfo.call(scafModule, scafModule.perPageMols);
                    }
                });
                var scafDetail = {
                    startIndex: 0,
                    currentPage: 1,
                    maxPages: 1,
                    allMols: [],
                    currentScaffold: {}
                }
                scafInfo(scafModule);
                //  @js 单个骨架详细信息弹框
                function scafInfo(obj) {
                    var molObj = obj;
                    $(".js-scaf-molInfoPopup .fa").on({
                        mouseenter: function() {
                            $(".nextPage").parent().removeClass("disabled");
                            $(".previousPage").parent().removeClass("disabled");
                            scafDetail.allMols = [];
                            scafDetail.currentScaffold = null;
                            var scafIndex = parseInt($(this).parent().parent().attr("data-index"));
                            scafDetail.currentScaffold = molObj.perPageMols[scafIndex];
                            if (scafDetail.currentScaffold.Count % 4 == 0) {
                                scafDetail.maxPages = scafDetail.currentScaffold.Count / 4;
                            } else {
                                scafDetail.maxPages = Math.ceil(scafDetail.currentScaffold.Count / 4);
                            }
                            (function IIFE() {
                                for (var i = 0; i < scafDetail.currentScaffold.Count; i++) {
                                    var index = scafDetail.currentScaffold.MolList[i] - 1;
                                    scafDetail.allMols.push(libDetail.mols[index]);
                                }
                            })();
                            // 初始化4个分子窗口
                            scafDeatilShow();
                            $(".modal-title").text("CID: " + scafDetail.currentScaffold.Cid);
                            //  只有一页分子
                            if (scafDetail.currentScaffold.Count <= 4) {
                                $(".previousPage").parent().addClass("disabled");
                                $(".nextPage").parent().addClass("disabled");
                                (function IIFE() {
                                    for (var i = scafDetail.currentScaffold.Count; i < 4; i++) {
                                        $(".scafD-" + i).css("display", "none");
                                    }
                                })();
                                (function IIFE() {
                                    for (var i = 0; i < scafDetail.currentScaffold.Count; i++) {
                                        loadMolsOfScaf.call(scafDetail, i, 31, 0);
                                    }
                                })();
                            } else {
                                $(".previousPage").parent().addClass("disabled");
                                //  两页以上分子
                                (function IIFE() {
                                    for (var i = 0; i < 4; i++) {
                                        loadMolsOfScaf.call(scafDetail, i, 31, 0);
                                    }
                                })();
                            }
                        },
                        click: function() {
                            // 弹出分子的详细信息框
                            $('#myModal').modal('show');
                            $(".mol-detail").hide();
                            $(".scaffold-detail").show();
                        }
                    });
                    $(".nextPage").click(function(e) {
                        if ($(this).parent().hasClass("disabled")) {
                            //只有一页或者已经到了最后一页
                            e.preventDefault();
                        } else {
                            scafDetail.currentPage += 1;
                            scafDetail.startIndex = (scafDetail.currentPage - 1) * 4;
                            if (scafDetail.currentPage == scafDetail.maxPages) {
                                // 最后一页
                                $(".previousPage").parent().removeClass("disabled");
                                $(this).parent().addClass("disabled");
                                scafDeatilShow();
                                (function IIFE() {
                                    for (var i = (scafDetail.currentScaffold.Count - scafDetail.startIndex); i < 4; i++) {
                                        $(".scafD-" + i).css("display", "none");
                                    }
                                })();
                                (function IIFE() {
                                    for (var i = 0; i < (scafDetail.currentScaffold.Count - scafDetail.startIndex); i++) {
                                        loadMolsOfScaf.call(scafDetail, i, 31, scafDetail.startIndex);
                                    }
                                })();
                            }
                            if (scafDetail.currentPage < scafDetail.maxPages) {
                                e.preventDefault();
                                // 非最后一页
                                $(".previousPage").parent().removeClass("disabled");
                                scafDeatilShow();
                                (function IIFE() {
                                    for (var i = 0; i < 4; i++) {
                                        loadMolsOfScaf.call(scafDetail, i, 31, scafDetail.startIndex);
                                    }
                                })();
                            }
                        }
                    });
                    $(".previousPage").click(function(e) {
                        if ($(this).parent().hasClass("disabled")) {
                            //只有一页或者已经到了第一页
                            e.preventDefault();
                        } else {
                            e.preventDefault();
                            scafDetail.currentPage -= 1;
                            scafDetail.startIndex = (scafDetail.currentPage - 1) * 4;
                            if (scafDetail.currentPage == 1) {
                                $(this).parent().addClass("disabled");
                                $(".nextPage").parent().removeClass("disabled");
                            }
                            //非第一页
                            if (scafDetail.currentPage > 1) {
                                $(".nextPage").parent().removeClass("disabled");
                            }
                            //  全部加载初始化
                            scafDeatilShow();
                            (function IIFE() {
                                for (var i = 0; i < 4; i++) {
                                    loadMolsOfScaf.call(scafDetail, i, 31, scafDetail.startIndex);
                                }
                            })();
                        }
                    });
                }

                // @todo 添加图表
                var scatterFileUrl = "jobs/" + JobID + "/SUBMIT_scls.txt";
                scaffoldScatter("#scatterChart", scatterFileUrl);

                var scaffoldCnts = [];
                (function IIFE() {
                    for (var i = 0; i < libDetail.scaffold.length; i++) {
                        scaffoldCnts.push(libDetail.scaffold[i].Count);
                    };
                })();
                scaffoldBarChart(scaffoldCnts, "#barChart");

            } else {
                $(".scaffold-display .grid").hide();
                $(".scaffold-display .JQ_pagination").hide();
                $(".scaffold-display .noResultTips").show();
            }
        }
        if (jobType.indexOf(moduleName.target) >= 0) {
            $("label[data-name='target']").show();
            var columns = [
                [{
                    field: "Molchembl_id",
                    title: "Mol",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    switchable: true,
                    align: "center",
                    valign: "middle"
                }, {
                    field: "Pref_name",
                    title: "Target",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    switchable: true,
                    align: "center",
                    valign: "middle"
                }, {
                    field: "Organism",
                    title: "Organism",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    align: "center",
                    valign: "middle"
                }, {
                    field: "Target_type",
                    title: "Target type",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    visible: false,
                    align: "center",
                    valign: "middle"
                }, {
                    field: "Chembl_id",
                    title: "Target ID",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    visible: false,
                    align: "center",
                    valign: "middle"
                }, {
                    title: "Activity",
                    colspan: 4,
                    rowspan: 1,
                    align: "center"
                }, {
                    field: "Pubmed_id",
                    title: "Pubmed",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    visible: false,
                    align: "center",
                    valign: "middle"
                }, {
                    field: "Reference",
                    title: "Reference",
                    colspan: 1,
                    rowspan: 2,
                    sortable: true,
                    align: "center",
                    valign: "middle"
                }],
                [{
                    field: "Standard_type",
                    title: "Type",
                    colspan: 1,
                    rowspan: 1,
                    sortable: true,
                    align: "center"
                }, {
                    field: "Standard_relation",
                    title: "Relation",
                    colspan: 1,
                    rowspan: 1,
                    align: "center"
                }, {
                    field: "Standard_value",
                    title: "Value",
                    colspan: 1,
                    rowspan: 1,
                    sortable: true,
                    align: "center"
                }, {
                    field: "Standard_units",
                    title: "Unit",
                    colspan: 1,
                    rowspan: 1,
                    sortable: true,
                    align: "center"
                }]
            ];
            if (!libDetail.targets) {
                console.info("NO target");
                $(".tatgetTable").bootstrapTable({
                    data: "",
                    columns: columns
                });
            } else {
                $(".tatgetTable").bootstrapTable({
                    data: libDetail.targets,
                    columns: columns
                });
                drawNetwork(libDetail.network.Nodes, libDetail.network.Edges);
            }
            if (!libDetail.pathway) {
                console.info("NO Pathway");
                $(".pathwaytable").bootstrapTable({
                    data: ""
                });
            } else {
                $(".pathwaytable").bootstrapTable({
                    data: libDetail.pathway
                });
            }
        }
        if (jobType.indexOf(moduleName.drugs) >= 0) {
            $("label[data-name='drugs']").show();
            var drugsCount = libDetail.drugs.length;
            var drugsModule = new Module(moduleName.drugs, canvasCnt1);
            // 向每页的mol数组中添加结构数据
            if (drugsModule.viewerCnt <= drugsCount) {
                (function IIFE() {
                    for (var i = 0; i < drugsModule.viewerCnt; i++) {
                        drugsModule.perPageMols.push(libDetail.drugs[i]);
                    }
                })();
            } else {
                (function IIFE() {
                    for (var i = 0; i < drugsCount; i++) {
                        drugsModule.perPageMols.push(libDetail.drugs[i]);
                    }
                })();
            }
            addMolInfo.call(drugsModule, drugsModule.perPageMols);
            //初始化翻页组件
            //  @js jqPagination初始化
            if (drugsCount % drugsModule.viewerCnt === 0) {
                drugsModule.maxPages = drugsCount / drugsModule.viewerCnt
            } else {
                drugsModule.maxPages = Math.ceil(drugsCount / drugsModule.viewerCnt);
            }
            drugsModule.currentPage = 1;
            $(".drugs_pagination").jqPagination({
                current_page: drugsModule.currentPage,
                max_page: drugsModule.maxPages,
                paged: function(page) {
                    //点击页码要做的操作                
                    page = parseInt(page, 10);
                    drugsModule.currentPage = page;
                    var startMol = (page - 1) * drugsModule.viewerCnt;
                    var endMol = page * drugsModule.viewerCnt - 1;
                    drugsModule.perPageMols = [];
                    drugsModule.perPageMols = endMol <= drugsCount ? libDetail.drugs.slice(startMol, endMol + 1) : libDetail.drugs.slice(startMol);
                    drugsModule.startIndex = startMol;
                    addMolInfo.call(drugsModule, drugsModule.perPageMols);
                }
            });
            //监听所有下拉框
            var listenDropdown = function() {
                var dropdownMenu1 = $(".js-chemddDegreeCtrl .dropdown-menu");
                var options = dropdownMenu1.find("a");
                options.on('click', function(event) {
                    var target = event.target;
                    var sPlaceHoleder = target.innerHTML;
                    var sValue = parseInt(target.getAttribute("value"));
                    var dropdownMenu2 = target.parentNode.parentNode.parentNode.firstElementChild;
                    if (dropdownMenu2.nodeName === "BUTTON") {
                        dropdownMenu2.innerHTML = sPlaceHoleder + " <span class='" + "caret'></span>";
                        //@todo 修改相似度

                    }
                });
            };
            listenDropdown();
        }
        if (jobType.indexOf(moduleName.alignment) >= 0) {
            $("label[data-name='alignment']").show();
            $(".mainMol input").iCheck({
                checkboxClass: 'icheckbox_flat-orange',
                radioClass: 'iradio_flat-orange',
                increaseArea: '20%' // optional
            });
            var element1 = $(".TDMol-content");
            var css={
                width: '438px',
                height: '446px',
                padding: '0px',
                position: 'absolute',
                top: '0px',
                left: '0px',
                'z-index': '0'
            }
            $(".TDMol-content canvas").css(css);
            var config1 = { backgroundColor: 'white' };
            var glviewer = $3Dmol.createViewer(element1, config1);

            var aligCount = libDetail.alignment.length;
            var aligModule = new Module(moduleName.alignment, canvasCnt2);

            if (aligCount) {
                // 向每页的mol数组中添加结构数据
                if (6 <= aligCount) {
                    (function IIFE() {
                        for (var i = 0; i < 6; i++) {
                            aligModule.perPageMols.push(libDetail.alignment[i]);
                        }
                    })();
                } else {
                    (function IIFE() {
                        for (var i = 0; i < aligCount; i++) {
                            aligModule.perPageMols.push(libDetail.alignment[i]);
                        }
                    })();
                }
                console.log(aligModule.perPageMols);
                addMolInfo.call(aligModule, aligModule.perPageMols);
                if (window.localStorage) {
                    localStorage.setItem("selectMols", "");
                } else {
                    Cookie.write("selectMols", "");
                }
                //初始化翻页组件
                if (aligCount % 6 === 0) {
                    aligModule.maxPages = aligCount / 6;
                } else {
                    aligModule.maxPages = Math.ceil(aligCount / 6);
                }
                var selectedMols = [];
                aligModule.currentPage = 1;
                $(".alig_pagination").jqPagination({
                    current_page: aligModule.currentPage,
                    max_page: aligModule.maxPages,
                    paged: function(page) {
                        //点击页码要做的操作                
                        page = parseInt(page, 10);
                        aligModule.currentPage = page;
                        var startMol = (page - 1) * 6;
                        var endMol = page * 6 - 1;
                        aligModule.perPageMols = [];
                        aligModule.perPageMols = endMol <= aligCount ? libDetail.alignment.slice(startMol, endMol + 1) : libDetail.alignment.slice(startMol);
                        aligModule.startIndex = startMol;
                        addMolInfo.call(aligModule, aligModule.perPageMols);
                        console.log("selectedMols==" + selectedMols);
                        for (var m = 0; m < aligModule.perPageMols.length; m++) {
                            var realIndex = (aligModule.currentPage - 1) * 6 + m;
                            var checkBox = $("div[data-index='" + m + "']").find(".icheckbox_flat-orange");
                            var selector = '#alignment-' + m + ' input';
                            if ($.inArray(realIndex, selectedMols) >= 0) {
                                if (!checkBox.hasClass("checked")) {
                                    $(selector).iCheck('check');
                                }
                            } else {
                                if (checkBox.hasClass("checked")) {
                                    $(selector).iCheck('uncheck');
                                }
                            }
                        }
                    }
                });

                // checkbox选中状态
                $(".mainMol input").on('ifChecked', function(event) {
                    var molIndex = $(this).parents(".image").attr("data-index");
                    var realIndex = (aligModule.currentPage - 1) * 6 + parseInt(molIndex, 10);
                    if ($.inArray(realIndex, selectedMols) < 0) {
                        selectedMols.push(realIndex);
                        $(".js-viewSelectedMol .dropdown-menu").append("<li class='dj_" + realIndex + "'><a style='position: relative;'><span>" + libDetail.alignment[realIndex].MolName +
                            "</span></a></li>");
                    }

                    var v = glviewer.addAsOneMolecule(libDetail.alignment[realIndex].Mol + "$$$$\n", "sdf");
                    glviewer.setStyle({}, { stick: { radius: 0.1 } });
                    glviewer.zoomTo();
                    glviewer.render();
                    $(".TDMol-content canvas").css(css);
                });
                // checkbox取消选中状态
                $(".mainMol input").on('ifUnchecked', function(event) {
                    var molIndex = $(this).parents(".image").attr("data-index");
                    var realIndex = (aligModule.currentPage - 1) * 6 + parseInt(molIndex, 10);
                    selectedMols.removeByValue(realIndex);
                    var selector = $(".js-viewSelectedMol .dropdown-menu .dj_" + realIndex);
                    if (selector) {
                        selector.remove();
                    }
                    //更新glviewer
                    glviewer.removeAllModels();
                    for (var i = 0, len = selectedMols.length; i < len; i++) {
                        var v = glviewer.addAsOneMolecule(libDetail.alignment[selectedMols[i]].Mol + "$$$$\n", "sdf");
                    }
                    glviewer.setStyle({}, { stick: { radius: 0.1 } });
                    glviewer.render();
                    $(".TDMol-content canvas").css(css);
                });
                /*  @js 3DMol分子样式改变
                 **************************************************************************************************************/
                var colorSS = function(viewer) {
                    //color by secondary structure
                    var m = viewer.getModel();
                    m.setColorByFunction({}, function(atom) {
                        if (atom.ss == 'h') return "aqua";
                        else if (atom.ss == 's') return "aqua";
                        else return "aqua";
                    });
                    viewer.render();
                }
                $("button[value='Stick']").on({
                    click: function() {
                        molStyle = "stick";
                        glviewer.setStyle({}, { stick: { radius: 0.1 } });
                        glviewer.render();
                    }
                });
                $("button[value='Line']").on({
                    click: function() {
                        molStyle = "line";
                        glviewer.setStyle({}, { line: { colorscheme: "orangeCarbon", radius: 0.2 } });
                        glviewer.render();
                    }
                });
                $("button[value='Recenter']").on({
                    click: function() {
                        glviewer.zoomTo();
                    }
                });
            }
        }

    }
}

/* @js  chemdoodle窗口下载功能 
 ***************************************************************************************/
//  @js 骨架：chemdoodle窗口全部显示
function scafDeatilShow() {
    for (var m = 0; m < 4; m++) {
        scafDetailInitial();
        $(".scafD-" + m).show();
    }
}