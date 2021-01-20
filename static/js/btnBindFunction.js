/*  @js 按钮绑定事件
 ***************************************************************************************************************/
//  @js 分子结构显示区域Grid-list布局切换
$(".structure-display .btn-reset button").on("click", function() {
    if ($(this).hasClass('view-list')) {
        $("#strucFrame").removeClass("grid").addClass("list table-bordered");
        $("#strucFrame .frame").attr("overflow", "auto");
    } else if ($(this).hasClass('view-grid')) {
        $("#strucFrame").removeClass("list table-bordered").addClass("grid");
        $("#strucFrame .frame").attr("overflow", "hidden");
    }
});
//  @js 药物结构显示区域Grid-list布局切换
$(".drugsProf-display .btn-reset button").on("click", function() {
    if ($(this).hasClass('view-list')) {
        $("#drugsFrame").removeClass("grid").addClass("list table-bordered");
        $("#drugsFrame .frame").attr("overflow", "auto");
    } else if ($(this).hasClass('view-grid')) {
        $("#drugsFrame").removeClass("list table-bordered").addClass("grid");
        $("#drugsFrame .frame").attr("overflow", "hidden");
    }
});

/* @js  当前任务下的结构查询
 ***************************************************************************************************************/
//  marvinJS右侧相似度值样式：模拟select
$(".similarityOptions a").on("click", function() {
    var tempText = $(this).text();
    $(".similarityOptions button").html(tempText + " &nbsp;</*span*/ class='caret'></span>");
    $(".similarityOptions button").attr("data-simThreshold", tempText);
});

//  marvinJS区域显示
$("#marvinDisplay").click(function() {
    if ($(".analysis-tool").is(':hidden')) {
        $("#searchComponent").slideToggle();
    } else {
        $(".analysis-tool").slideToggle();
        $("#searchComponent").slideToggle();
    }
});

//  结构查询任务提交
$(".js-structureBtn").click(function() {
    var mol_string = null;
    //这里是核心方法
    marvinSketcherInstance.exportStructure("mol").then(function(source) {
        //mol 为结构式转化的字符串数组
        mol_string = source;
        if (marvinSketcherInstance.isEmpty() || !mol_string || null == mol_string || "" == mol_string) {
            alert("Please enter a structure!");
            return false;
        }
        var SearchType = $("#searchComponent input[checked='checked']").val();
        console.log(SearchType);
        //此处 选择 查询方式
        if (SearchType === "Exact") {
            $.ajax({
                url: "/result/StructureQuery",
                type: "post",
                data: {
                    searchType: "exact",
                    mol: mol_string,
                    jobid: JobID
                },
                dataType: "html"
            }).done(strucResultHandle);
        } else if (SearchType === "Substructure") {
            $.ajax({
                url: "/result/StructureQuery",
                type: "post",
                data: {
                    searchType: "sub",
                    mol: mol_string,
                    jobid: JobID
                },
                dataType: "html"
            }).done(strucResultHandle);
        } else if (SearchType === "Similarity") {
            var simThreshold = $(".similarityOptions button").attr("data-simThreshold");
            //console.log(simThreshold);  
            $.ajax({
                url: "/result/StructureQuery",
                type: "post",
                data: {
                    searchType: "sim",
                    threshold: simThreshold,
                    mol: mol_string,
                    jobid: JobID
                },
                dataType: "html"
            }).done(strucResultHandle);
        }
    }, function(error) {
        alert("Molecule export failed:" + error);
    });
});

//  结构查询结果处理
function strucResultHandle(msg) {
    JobStrucResult = JSON.parse(msg);
    if (JobStrucResult.State != "success") {
        alert("Task running error.")
        return false;
    }
}

$(".saveImg").on({
    click: function() {
        var imgRelation = {
            MW: "distribution-chart0",
            Alogp: "distribution-chart1",
            Hba: "distribution-chart2",
            Hbd: "distribution-chart3",
            Tpsa: "distribution-chart4",
            Rb: "distribution-chart5",
            heatMap: "heatMap"
        };
        var pic = $(this).attr("name");
        var picName = JobID + "_" + pic + ".png";
        if (pic != "heatMap") {
            imgRelation[pic] ? saveSvgAsPng(document.getElementById(imgRelation[pic]).firstChild, picName, { scale: 2 }) : alert("Error to save picture.");
        } else {
            saveSvgAsPng(document.getElementById(imgRelation[pic]).lastChild, picName, { scale: 2 });
        }

    }
});

$(".js-dloadAllMol").on({
    click: function() {
        var url = "downloadLib?jobid=" + JobID;
        window.location.href = url;
    }
});
$(".js-dloadAlignedMol").on({
    click: function() {
        var url = "downloadAlignedLib?jobid=" + JobID;
        window.location.href = url;
    }
});