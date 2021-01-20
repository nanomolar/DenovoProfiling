/*
**  2017-01-10
**  作者：RCDD杜杰文
**  功能：文件上传,分析功能选择
**
*/
//  @bug:拖拽上传文件
//  @js section1:文件上传插件初始化
$("#molsFile").fileinput({
    uploadUrl: '/',
    maxFileCount: 1,
    showUpload:false,
    overwriteInitial: false,
    maxFileSize: 5000,
    fileType: "any",
    initialPreviewAsData: false, // allows you to set a raw markup
    dropZoneTitle:"Drag your chemical library file here",
    previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
    //allowedFileTypes: ['image', 'video', 'flash'],
    slugCallback: function(filename) {
        return filename.replace('(', '_').replace(']', '_');
    }
});

//  @js document ready function
$(function(){
    //  @js switch初始化
    $(".analysis-tool input").iCheck({
        checkboxClass: 'icheckbox_flat-orange',
        radioClass: 'iradio_flat-orange',
        increaseArea: '20%' // optional
    });
    $(".file-type input").iCheck({
        checkboxClass: 'icheckbox_flat-orange',
        radioClass: 'iradio_flat-orange',
        increaseArea: '20%' // optional
    });

    var el_file = document.getElementsByClassName("file-drop-zone")[0];
    //  文件拖拽监听
    var dropFlag = false;
    el_file.addEventListener("dragenter", function (e) {
        e.stopPropagation();
        e.preventDefault();
    });

    el_file.addEventListener("dragover", function (e) {
        e.dataTransfer.dropEffect = "copy";
        e.stopPropagation();
        e.preventDefault();
    });

    el_file.addEventListener("drop", function (e) {
        dropFileObj = e.dataTransfer.files[0];
        dropFlag = true;
    });
    /******************************任务提交 条件判断********************************/
    $(".jsSubmit").on({
        click: function(){
            // 获取上传文件对象
            // @bug 拖拽的文件会报错document.getElementById("molsFile").files[0] = undefined
            var fileObj;
            if (dropFlag) {
                //  拖拽文件上传
                fileObj = dropFileObj;
            } else {
                //  浏览文件上传
                var el_file1 = document.getElementById("molsFile");
                fileObj = el_file1.files[0];
            }
            var formData = new FormData();
            var fileTypeIsChecked = $(".file-type input").is(':checked');
            var toolIsChecked = $(".analysis-tool input").is(':checked');
            var textareaVal = $(".paste-textarea textarea").val();

            if ( fileObj ){
                //  判断文件后缀是否含有"SD/SDF/TXT" 
                (function(){
                    var fileNameSplit = fileObj.name.toUpperCase().split(".");
                    var lastIndex = fileNameSplit.length - 1;
                    var suffix = ["SD","SDF","TXT","CDX","SMI","INCHI"];
                    if (suffix.indexOf(fileNameSplit[lastIndex])==-1){
                        alert("The file format is wrong, please re-upload a SDF file or TXT File!");
                        return false;
                    }
                })();
                if (fileTypeIsChecked && toolIsChecked){                              
                    $(".file-type").removeClass("panel-danger panel-success");
                    $(".file-type").addClass("panel-success");                    
                    $(".tools-option").removeClass("panel-danger panel-success");
                    $(".tools-option").addClass("panel-success");
                    //  获取参数，提交任务
                    var fileTypeChecked = $(".file-type input[name='iCheck']:checked").attr("id").toUpperCase().split("_",1).join();
                    var toolsCheckedObj = $(".analysis-tool input[type='checkbox']:checked");
                    var toolsChecked = [];
                    toolsCheckedObj.each(function(){
                        toolsChecked.push($(this).attr("name"));
                    });
                    //  向formdata添加数据
                    formData.append("isFile",true);
                    formData.append("molFile", fileObj);                    
                    formData.append("analysisMethod", toolsChecked);
                    formData.append("fileType", fileTypeChecked);                   
                    $(".loading").show();
                    $.ajax({
                        url: "job",
                        type: "POST",
                        data: formData,
                        dataType: "html",
                        processData: false,  // 告诉jQuery不要去处理发送的数据
                        contentType: false   // 告诉jQuery不要去设置Content-Type请求头
                    }).done(HandleJob);                           
                } else {
                    if (!fileTypeIsChecked) {
                        $(".file-type").removeClass("panel-danger panel-success");
                        $(".file-type").addClass("panel-danger");
                    } 
                    if (!toolIsChecked) {
                        $(".tools-option").removeClass("panel-danger panel-success");
                        $(".tools-option").addClass("panel-danger");
                    }
                    alert("Please choose option!");
                    return false;
                }
                return;
            } else if ( textareaVal ){
                if (fileTypeIsChecked && toolIsChecked){                              
                    $(".file-type").removeClass("panel-danger panel-success");
                    $(".file-type").addClass("panel-success");                    
                    $(".tools-option").removeClass("panel-danger panel-success");
                    $(".tools-option").addClass("panel-success");
                    //  获取参数，提交任务
                    var fileTypeChecked = $(".file-type input[name='iCheck']:checked").attr("id").toUpperCase().split("_",1).join();
                    var toolsCheckedObj = $(".analysis-tool input[type='checkbox']:checked");
                    var toolsChecked = [];
                    toolsCheckedObj.each(function(){
                        toolsChecked.push($(this).attr("name"));
                    });
                    //  向formdata添加数据
                    formData.append("isFile",false);
                    formData.append("molText", textareaVal);                   
                    formData.append("analysisMethod", toolsChecked);
                    formData.append("fileType", fileTypeChecked);                
                    $(".loading").show();
                    $.ajax({
                        url: "job",
                        type: "POST",
                        data: formData,
                        dataType: "html",
                        processData: false,  // 告诉jQuery不要去处理发送的数据
                        contentType: false   // 告诉jQuery不要去设置Content-Type请求头
                    }).done(HandleJob);                           
                } else {
                    if (!fileTypeIsChecked) {
                        $(".file-type").removeClass("panel-danger panel-success");  
                        $(".file-type").addClass("panel-danger");
                    }
                    if (!toolIsChecked) {
                        $(".tools-option").removeClass("panel-danger panel-success");
                        $(".tools-option").addClass("panel-danger");
                    }
                    alert("Please choose file type option!");
                    return false;
                }
            } else {
                alert("Please upload a text file containing the mol structures!");
                return false;
            }
        }
    });    
});

function HandleJob(msg){
    var jobState = JSON.parse(msg);
    console.log(jobState);
    if (jobState.State != "success"){
        $(".loading").hide();
        alert("Failed to submit the job. Please resubmit mols File.");
        return false;
    } else {
        if (window.localStorage) {
            localStorage.setItem("jobID", jobState.Data.JobId);
        } else {
            Cookie.write("jobID", jobState.Data.JobId);
        } 
        window.location.href = "result?jobid=" + jobState.Data.JobId;
    }
}


demo1_str = "c1nn2c(cc(nc2n1)C)N(CC)CC	15421-84-8\n[C@]1([C@@]2([C@H]([C@H]3[C@]([C@@]4(C(=CC(=O)C=C4)CC3)C)(Cl)[C@H](C2)O)C[C@H]1C)C)(OC(=O)c1ccco1)C(=O)CCl	T1531\nc1c2n(c(nc2ccc1)NC1CCN(CCc2ccc(OC)cc2)CC1)Cc1ccc(cc1)F	68844-77-9\nc1c(Oc2ccc(NC(=O)Nc3cc(c(cc3)Cl)C(F)(F)F)cc2)ccnc1C(=O)NC	T0093L\nC1Cn2c(nnc2C(F)(F)F)CN1C(=O)CC(Cc1cc(c(cc1F)F)F)N	T0242\nc1c(ccc(c1)CN)C(=O)O	56-91-7\n[C@H]12[C@H]3C([C@@]4([C@H](NC(=O)C=C4)CC3)C)CC[C@@]1([C@H](CC2)C(=O)Nc1cc(ccc1C(F)(F)F)C(F)(F)F)C	164656-23-9\n[C@H]12[C@H]([C@H]3[C@]([C@@H](C(=O)C)CC3)(C)CC1)C=CC1=CC(=O)CC[C@@]21C	T3036\nc1c2c(c(c(c1F)N1CC(NCC1)C)OC)n(C1CC1)cc(C(=O)O)c2=O	T1293\nc1c(OC(=S)N(c2cccc(n2)OC)C)ccc2c1CCCC2	88678-31-3\nc1cccc2c1n(nc2C(=O)O)Cc1ccc(cc1Cl)Cl	T0239\n[C@]1([C@@]2([C@H]([C@H]3[C@@H]([C@@]4(C(=CC(=O)CC4)C(=C3)C)C)CC2)CC1)C)(OC(=O)C)C(=O)C	T1284\nc1c2c(cc(c1OC)OCC1CCN(CC1)C)ncnc2Nc1ccc(Br)cc1F	T1656\nc1c2N(c3c(cccc3)CCc2ccc1)C(=O)N	3564-73-6\nc1c(CC(C(=O)O)N)cc(c(c1I)Oc1ccc(c(c1)I)O)I	6893-02-3\nCOc1c(c(nc(n1)C)Cl)NC1=NCCN1	T1028\nc1c2c(noc2cc(c1)F)C1CCN(CCc2c(nc3n(c2=O)CCCC3O)C)CC1	144598-75-4\nc1c(c(ncc1Cl)c1cnc(cc1)C)c1ccc(S(=O)(=O)C)cc1	202409-33-4\nCS(=O)(=O)c1cc(c(cc1)C(=O)Nc1cc(c(cc1)Cl)c1ccccn1)Cl	T2590\nc1ccc(c(c1C(=O)c1ccccc1)N)CC(=O)N	78281-72-8\nC1CCC(C1)C(CC#N)n1cc(cn1)c1c2cc[nH]c2ncn1	T3066\n[C@]12([C@H]([C@H]3[C@@H]([C@@]4(C(=CC(=O)CC4)CC3)C)[C@H](C1)O)CC[C@@]2(C(=O)COC(=O)C)O)C	T1243\nc1nc(c2n1c1c(C(=O)N(C2)C)cc(F)cc1)C(=O)OCC	78755-81-4\n[C@H]1(c2cc(=O)c(ccc2c2c(c(c(OC)cc2CC1)OC)OC)OC)NC(=O)C	T0320\nC1CCC(C1)C(CC#N)n1cc(cn1)c1c2cc[nH]c2ncn1	T1829\nc1cnccc1c1c[nH]c(=O)c(c1)N	T1265\n[C@H]12[C@@]([C@@]3(C(=CC(=O)C=C3)[C@H](C1)F)C)([C@H](C[C@]1([C@H]2C[C@@H](C)[C@@]1(C(=O)CO)O)C)O)F	T1124\n[C@@H](NC(=O)[C@@H](O)[C@H](N)Cc1ccccc1)(CC(C)C)C(=O)O	58970-76-6\nCN(c1nc(nc(n1)N(C)C)N(C)C)C	T1241\nc1cccc2c1C(c1c(C=C2)cccc1)CCCNC.[Cl-].[H+]	1225-55-4\n[C@H]12[C@@]([C@@](C#C)(O)CC1)(CC[C@H]1[C@H]2CCc2c1ccc(c2)OC1CCCC1)C	152-43-2\nc1cc(cc2c1n(C1CCN(CCCn3c4c(cccc4)[nH]c3=O)CC1)c(=O)[nH]2)Cl	57808-66-9\n[C@]1([C@@]2([C@H]([C@H]3[C@@H]([C@@]4(C(=CC(=O)CC4)[C@H](C3)C)C)CC2)CC1)C)(OC(=O)C)C(=O)C	71-58-9\n[C@]12([C@H]([C@H]3[C@@H]([C@@H]4C(=CC(=O)CC4)CC3)CC1)CC[C@]2(C#C)O)CC	797-63-7\nc1c(C2CCC(CC2)C2=C(O)c3ccccc3C(=O)C2=O)ccc(c1)Cl	95233-18-4\nc1cccc2c1n(c(n2)N1CCC(N(c2nccc(=O)[nH]2)C)CC1)Cc1ccc(cc1)F	108612-45-9\nCN(C)CC=CC(=O)Nc1c(cc2c(c1)c(ncn2)Nc1cc(c(cc1)F)Cl)OC1CCOC1	T2303\nCc1c(nc(cc1)NC(=O)C1(CC1)c1cc2c(cc1)OC(O2)(F)F)c1cc(ccc1)C(=O)O	936727-05-8\nCCOc1ccccc1OC(C1C[NH2+]CCO1)c1ccccc1	71620-89-8\nCC1(CCCN1)c1nc2c(cccc2[nH]1)C(=O)N	T2591\nCC1CN(CC(O1)C)c1ncc(cc1)NC(=O)c1cccc(c1C)c1ccc(cc1)OC(F)(F)F	T1926\nc1cccc2c1n(C1=CCN(CC1)CCCC(=O)c1ccc(cc1)F)c(=O)[nH]2	548-73-2\nc1cccc2c1N(C(C)C2)NC(=O)c1ccc(c(c1)S(=O)(=O)N)Cl	26807-65-8\nc1c(C(=O)NCCN2CCOCC2)ccc(c1)Cl	71320-77-9\nc1c(OC)ccc2c1c(c[nH]2)CCNC(=O)C	73-31-4\nc1c(n2c(n1)C(=C1CCN(CC1)C)c1c(CC2)cccc1)C=O	147084-10-4\n[C@H]12[C@@]([C@](OC(=O)C)(CC1)C(=O)C)(C[C@@H](C1=C3C(=CC(=O)CC3)CC[C@@H]21)c1ccc(N(C)C)cc1)C	126784-99-4\n[C@]12([C@H]([C@H]3C(=C4C(=CC(=O)CC4)CC3)CC1)CC[C@]2(CC#N)O)C	65928-58-7\nc1cc(cc(c1NC(=O)OCC)N)NCc1ccc(cc1)F	150812-12-7\nc1c(cccc1C1C(=C(NC(=C1C(=O)OCCOC)C)C)C(=O)OC/C=C/c1ccccc1)[N+](=O)[O-]	132203-70-4\nc1c(C2C(=C(NC(=C2C(=O)OC)C)C)C(=O)OCOC(=O)CCC)c(c(cc1)Cl)Cl	167221-71-8\nc1c(S(=O)(=O)N)ccc(c1C(=O)NCC1N(CC)CCC1)OC	23672-07-3\n[C@H]1(c2c(c(c3C(=O)c4cccc(c4C(=O)c3c2O)OC)O)C[C@](C(=O)CO)(O)C1)O[C@H]1C[C@@H]([C@H](O)[C@@H](O1)C)N	T1456\nC(C1OC(n2c(=O)[nH]c(=O)c(c2)I)CC1O)O	T0863\nc1cccc2c1c(c(o2)CC)C(=O)c1cc(c(O)c(c1)Br)Br	3562-84-3\n[C@@H]12N(CCc3cc(c(OC)c(c13)Oc1c(OC)cc3c(c1)[C@@H](N(CC3)C)Cc1ccc(Oc3c(OC)ccc(c3)C2)cc1)OC)C	518-34-3\nc1c2c(cc3c1OCO3)c(=O)c(nn2CC)C(=O)O	T0274\n[C@H]1([C@@H](CC2CC(=O)NC(=O)C2)O)C(=O)[C@H](C[C@@H](C1)C)C	T1225\n[C@@H]12N(C(=C(C[n+]3ccc(C(=O)N)cc3)CS1)C(=O)[O-])C(=O)[C@H]2NC(=O)Cc1cccs1	T0141\nCc1c(c2ccccc2[nH]1)CCNCc1ccc(cc1)C=CC(=O)NO	T2383"
demo2_str = "NC(=O)NCCC1CCN(C(=O)CN2CC=C(c3ccc(Cl)cc3)CN(S(=O)(=O)c3cccc4ccccc34)CC2)CC1	S000001\nCC(=NNC(=S)Nc1nc(CNC(=O)C)sc1c1c(C)nn(C)c1C)c1ccccc1	S000002\nCCOC(=O)C(CCc1ccccc1)NC(C)C(=O)N1CC(C)C(C)C1	S000003\nCCN(CC)C(=O)Oc1ccc(C(=O)O)cc1	S000004\nCOC(=O)Cc1ccc(CNC(=O)c2ccc3ccccc3n2)cc1	S000005\nCCOc1ccc(CNc2ccc(C(F)(F)F)cn2)cc1	S000006\nCC(C)(C)NC(=O)C1CC(=O)N(c2cccc(C#N)c2)C1	S000007\nCc1cccc(c2nc(CN(CCO)CCO)no2)c1	S000008\nCC(=O)c1cn(c2ccc(C)c(C)c2)cc1C1CC(O)C(C)NC1C	S000009\nCc1nc[nH]c1c1nc2c(n1C(C)C)C(c1cccc(Cl)c1)N1CN(C(C)C)CC1(C)CN2C	S000010\nNc1nc(O)c2ncn(C3CC(O)C(CO)O3)c2n1	S000011\nCc1[nH]n(c2ccccc2)c(=O)c1C(=O)N	S000012\nCCOc1cc2ncc(Cl)c(C(=O)NCCN(C(=O)C(=O)Nc3cccc(C)c3)C3CC3)c2cc1CC	S000013\nO=C(Nc1ccccc1)N1CCN(C(=O)c2ccccc2)CC1	S000014\nCc1cc(Cl)c(Nc2nc(C)nc(N(C)c3ccncc3)n2)nc1C	S000015\nCOc1ccc(C(O)C2=C(C)C(=O)OC2OC(=O)C)c(OC2OCC(O)C(O)C2O)c1	S000016\nCOc1ccc(c2c[nH]c3ncc(c4ccccc4OCCc4ccccn4)cc23)cc1	S000017\nCC(=NN=C1SCC(=O)N1C)c1cccs1	S000018\nCOCCN(C)Cc1ccccc1C	S000019\nCC(=O)OC1(OC(=O)C(C)C)C(C(C)C)C1C(O)C(O)CN	S000020\nO=S(=O)(Nc1ccc(Cl)cc1)c1c(C(F)(F)F)cc(C(F)(F)F)cc1[N+](=O)[O-]	S000021\nCc1ccc(S(=O)(=O)NC(CC(C)C)C(=O)Nc2cc(C(F)(F)F)cc(C(F)(F)F)c2)cc1	S000022\nNc1ccccc1c1cc(c2cnco2)cc(C(=O)NCc2cccc(Br)c2)n1	S000023\nNCC1CCC(Nc2c(O)ccc3ccccc23)CC1	S000024\nCCCn1c(=O)c(=O)n(C)c2cnc(n3c(C)nnc13)NCC2	S000025\nCc1cc(C(=O)O)ccc1n1nc(C)nc1c1ccccc1	S000026\nCOc1ccc2c(c1)oc1c(C)csc21	S000027\nCc1nc2cnccc2n1CC1CCCN(C(=O)CCn2cncn2)C1	S000028\nCOc1ccc(C=CC(=O)C=CN(CC(C)C)C(=O)C)cc1	S000029\nCCC(=O)NC(=S)Nc1cc(C(F)(F)F)ccc1N1CCOCC1	S000030\nCCN(C(=O)OC)c1ccccc1C(C)(C)C(F)(F)F	S000031\nCOC(=O)C(NC(=O)c1c([S+](C)[O-])c(c2ccc(C)cc2)nc2ccccc12)C(F)(F)F	S000032\nOc1nc2ncc(Cl)cn2c1c1cc(Cl)c(N)cc1F	S000033\nN#CCc1c(c2ccc(O)cc2)[nH]c2ccccc12	S000034\nCOC(=O)C12CC=C(C)C(C)C1C1=CCC3C4(C)CCC(O)C(C)(C)C4CCC3(C)C1(C)CC2	S000035\nO=C(c1ccccc1n1nccn1)N1CC2CN(Cc3ccc(Cl)cc3)C(=O)C2C1	S000036\nNc1nc(O)c2c([nH]c3ccccc23)n1	S000037\nCOc1ccc(OC)c(c2nccnc2C2CN(CCSc3ccccc3)CCO2)c1	S000038\nCOc1cc(CN2CC(=C(C(=O)O)N3C(=O)C(Cc4cccc(C)c4)(S(=O)(=O)C)CC3)C=C2C)cc(OC)c1	S000039\nCC(C)c1n[nH]c(n2cccc2)n1	S000040\nCS(=O)(=O)c1ccc(CC=C(NCc2ccncc2)C(=O)CCl)s1	S000041\nCN(C)Cc1ccc(C#Cc2ccc(C(C)(C)C)cc2)cc1	S000042\nCC1=C(C(=O)OCC(C)C)C(c2ccccc2Cl)n2nc(SCC(=O)Nc3nccs3)nc2N1	S000043\nCCCNc1ncc(c2ccc3oc(c4ccccc4)nc3c2)cc1S(=O)(=O)N	S000044\nO=C1C(C=Cc2ccc(O)c(O)c2)Nc2ccc(Br)cc12	S000045\nCc1cccc(C(=O)NCCSSS(=O)(=O)C)c1C	S000046\nO=C1Cc2scnc2n2c1nc1ccccc1c2=O	S000047\nCOc1ccc(c2noc3ccc(C#N)cc23)cc1N	S000048\nCc1sc2ncnc(NC3CCN(Cc4ccccc4)CC3)c2c1C	S000049\nCOCCN(CCOC)C(=O)Oc1cccc2ccc(OC)cc12	S000050\nCOc1ccc(N(C)c2nc(C)nc3c2ncn3C(C)C)cc1	S000051\nCc1cc(N(C)c2nc(N3CCOCC3)[nH]c2c2ccc3cccnc3c2)ccc1O	S000052\nCC1(C(=O)O)CC2C(=O)NC(=O)C2C1	S000053\nCNc1nc2ccc(c3ccnc(S(=O)(=O)c4ccc(OC)cc4)n3)cc2[nH]1	S000054\nOCCC1CCC2C(CO1)n1nnc3ccc([nH]c(=O)c4cnccc4[nH]3)cc21	S000055\nCC(NC(=O)COc1ccc(C2CC2c2ccccc2)cc1)C(C)C	S000056\nCC(=O)Oc1ccc(C=Cc2ccc(OCC(O)CO)cc2)cc1	S000057\nCN(C(=O)CSc1nc2ccccc2s1)c1c(N)n(Cc2ccccc2)c(=O)[nH]c1=O	S000058\nO=S(=O)([O-])CN1c2cccc(Br)c2C(=NC21CCCN2Cc1ccc(C(F)(F)F)cc1)c1ccccc1	S000059\nCC(C)(C)OC(=O)N1CCN(c2nc(c3ccc4[nH]ccc4c3)nc3ccccc23)CC1	S000060\nCC(CO)N1CCN(c2cc(c3ccccc3)nc3ccccc23)CC1	S000061\nCCC(CC)c1cc2c(cc1C(=O)N(C)C)S(=O)(=O)N=C2c1ccc(Cl)cc1	S000062\nCc1nc2ccccc2c(=O)n1N=Cc1ccc(O)cc1	S000063\nCc1ccc(OCC(=O)NNC(=O)COc2ccccc2C#N)cc1	S000064\nCN1CCC(N(Cc2ccccc2)C(=O)c2ccc3c(c2)OCO3)CC1	S000065\nC=CCN(CC(=O)c1ccc2c(c1)OCO2)C(=O)CCC(=O)NN=Cc1ccccc1[N+](=O)[O-]	S000066\nO=[N+]([O-])c1ccc(N=NN(Cc2cccs2)c2nnc(c3ccccc3)o2)cc1	S000067\nCC(C)C(NS(=O)(=O)c1ccccc1c1ccccc1)C(=O)NC(CCSC)C(=O)O	S000068\nOCCc1nnc(c2sc3ccccc3c2c2ccc(Cl)cc2)o1	S000069\nCOC(CNC(=O)c1ccccc1Br)c1ccccc1C	S000070\nNC(=O)CCC(O)C(CC(=O)O)c1ccc(Cl)cc1	S000071\nCc1ccc(S(=O)(=O)OC2CC(C(=O)NNc3ccccn3)C(C)(C)C2)nc1	S000072\nCCN(CC)C(=S)SS(=O)(=O)c1cn2c(oc(=O)c3ccccc23)c1N	S000073\nCCN(CC)CCCNc1cc(N)cc2nc3c(C(=O)O)cc(OC)nc3n12	S000074\nCCc1ccc(NC(=NCCCn2ccnc2)S)cc1	S000075\nCCOc1ccc(CN2C(=O)CSc3c2c(C)nn3c2c(C)cc(C)cc2C)cc1	S000076\nN#CCc1c(Sc2ccc(Cl)cc2)n(c2ccccc2)c2n[nH]c(c3cccs3)c12	S000077\nCC(C)C(=O)Nc1cc(CO)cn1Cc1cccc(Br)c1	S000078\nCC1CN(C(C)CO)Sc2ncc3ncccc3c12	S000079\nO=C1c2ccccc2NC(c2ccc(O)c(O)c2)N1CC1CC1	S000080\nCCOC(=O)c1ccc(NC(=O)CN(C(=O)N)S(=O)(=O)c2cccs2)o1	S000081\nCCOC(=O)CCN(CC)CCNS(=O)(=O)c1ccc(Cl)cc1Cl	S000082\nO=C(CO)NC1CN(Cc2ccccc2)C2CC(CO)C(O)C2C1	S000083\nOc1nc2ccccc2n1C1CCN(S(=O)(=O)c2ccc(Cl)cc2)CC1	S000084\nNC(C(=O)N1CCC(F)(F)C1)C1CCN(c2ncccn2)CC1	S000085\nC=CC(=O)NC(CCSCc1cc(c2ccc(F)cc2)sc1C)C(=O)O	S000086\nCCSc1ccc(C2=C(c3ccc(OCCOC)cc3)C(=O)OC2=Cc2ccc(OC)cc2)cc1	S000087\nCc1ccnc(SCc2nc3ccccc3nc2N2CCN(c3ccccn3)CC2)c1	S000088\nCc1ccc(C(C)(O)c2nc(c3ccc(Cl)cc3)cs2)c(c2ccncc2)c1	S000089\nO=C(Cc1ccc(Cl)cn1)N1CCNCC1	S000090\nCC(Nc1ncccn1)C(=O)O	S000091\nCOc1ccc(C(CN(C)C)NS(=O)(=O)C)cc1	S000092\nCCC(C)c1ccc(CNc2nnsc2N)cc1	S000093\nCOc1ccc(C2=NN(C(=S)N)C2=S)cc1C(=O)N	S000094\nCOc1ccc(C(=O)Nc2nc(c3ccccc3OC)cs2)cc1OC	S000095\nCOc1ccc(c2nnc(c3cccc(O)c3)s2)cc1OC	S000096\nCCN1CCC(N(Cc2ccc(c3ccccc3N)nn2)C2CCN(CCc3ccccc3)CC2)C(C(C)C)C1	S000097\nCc1nc(C(C)Nc2ncnc(Oc3ccc(OC(F)F)cc3)n2)sc1C(=O)O	S000098\nNc1ccc(Oc2ccc(S(=O)(=O)O)cc2)cc1Nc1ncnc2cnc(N)nc12	S000099\nCOC(=O)c1ccc(OC2CCN(C(=O)C)CC2)c2ccccc12	S000100\nCc1cc(C)c(S(=O)(=O)NC(CCC(=O)O)C(=O)O)c(C)c1	S000101\nCc1ccc(OCC(=O)NN(Cc2ccco2)C(=O)COc2ccccc2Br)cc1	S000102\nN#Cc1ccc(Nc2nc(NN=Cc3ccc(F)cc3)nc(N3CCN(c4ccc(Cl)cc4)CC3)n2)cc1	S000103\nCc1cc(C)nc(NC(=S)N2CCN(c3cccc(Cl)c3F)CC2)c1O	S000104\nCC1NCCN(C(=O)C(N)Cc2ccc(F)cc2)C1=O	S000105\nCC1(C)N=C(N)N=C(N)C1c1cc(Br)c(c2c(Cl)cc(Cl)cc2Cl)o1	S000106\nCOc1cccc(Cc2nnc(SC)nc2O)c1OC	S000107\nCS(=O)(=O)Nc1cccc(c2ccc3nnc(c4cccc(F)c4)n3n2)c1	S000108\nC=C(CCC)C(=O)c1ccc(c2cc3cc(Cl)ccc3oc2=O)cc1	S000109\nOCC1COC(=N1)c1cccc(Oc2ccccc2)c1	S000110\nC=C1C(O)C(OC(=O)C)C2(C)C(C)CCC3=C4CCC(C)C4C3OC12C	S000111\nCCOC(=O)c1ccc(COc2ccc(CC(C(=O)N)C(C)C)cc2)c(Nc2ncnc3c2ncn3C(C)(C)C2CC2)c1	S000112\nCCOC(=O)C1CC2C3CCc4cc(OC5CCN(C)CC5)cc(c34)C2CC1OC	S000113\nCOc1cccc(c2nc(CN3CCN(c4cc(C)nc(C)n4)CC3)cc3cc[nH]c23)c1	S000114\nCCc1ccc(C)c(NC(=O)Cc2ccccc2)c1	S000115\nCCS(=O)(=O)N(CCCOc1ccc2c(c1)c(CCC(=O)O)c(C)n2Cc1cccc(C)c1)C(C)C	S000116\nCN(C)CC(O)COCC#Cc1ccccc1	S000117\nCc1cc(O)c2c(c1O)C(=O)CC(c1cccs1)O2	S000118\nCc1cccc(N2CC(C3CCc4nnc(C)n4C3)CC2=O)c1C	S000119\nCC(=O)NC(C)Cc1ccc(C#Cc2ccc(OC(C)C)nc2)cc1	S000120\nO=C(OCCCOc1cccc(Cl)c1)NN=Cc1ccccc1Cl	S000121\nCCOC(=O)C1C2COc3ccc(Cl)cc3C2N2C(=O)N(c3ccccc3)C(=O)C12C	S000122\nCOc1ccc(CN2CC(=O)N(CCc3ccc(O)c(Br)c3)CCC2=O)cc1	S000123\nO=c1ccsn1c1ccccc1[N+](=O)[O-]	S000124\nCCCNC(=O)C(c1ccncc1)N(COC)C(=O)c1c(C)cccc1C	S000125\nCOc1ccc(c2nn3c(SCC(=O)Nc4cccc(S(=O)(=O)N)c4)nc4sccc4c3n2)cc1	S000126\nCc1cn(C2CC(N=[N+]=[N-])C(CNS(=O)(=O)c3ccc(C(C)(C)O)nc3)O2)c(=O)[nH]c1=O	S000127\nCC1OCc2c(ccc(Cl)c2O)C1c1cn(c2ccc(C(O)(C(F)(F)F)F)cc2)nn1	S000128\nCCC1Oc2c(N3CCN(C)CC3)cc(Cl)cc2NC(c2ccccc2)C1	S000129\nCCCN1CCC2(C)CC1c1cc(OC)ccc21	S000130\nCc1cc(NCCN2CCC(NC(=O)C(=O)Nc3ccc(C(=N)N)cc3)CC2)[nH]c(=O)c1C	S000131\nCOc1ccc(C=CC(=O)N)cc1	S000132\nO=C(C=Cc1cccc([N+](=O)[O-])c1)C(=Cc1ccc2c(c1)OCO2)C(=O)O	S000133\nNCC1CCC1c1cc(c2ccc(C(F)(F)F)nc2)cnc1OC1CC1	S000134\nCOc1c(NC(=O)c2ccccc2OC)cccc1c1cccnc1	S000135\nCc1ccc(c2nc3ccccc3n2CCCN(C)C)cc1	S000136\nCC(C)CCN1CC=C(c2nnnn2c2ccccc2)CC1	S000137\nC=CCOc1cc(C(=O)NC(C(=O)NC(Cc2ccccc2)C(O)CN(CC(C)C)C(C)C)C(C)C)ccc1OC(=O)C	S000138\nO=C1Nc2ccccc2C1=Cc1c[n+]([O-])ccc1Cl	S000139\nCc1cc(C)nc(OC(Cn2cc(C(F)(F)F)cc2C2CC2)C(F)(F)F)n1	S000140\nCCN1CCN(CCCN(C(=O)Nc2ccc(F)c(C)c2)C2CCC3CC2C3(C)C)CC1	S000141\nCOc1c(c2ccc3c(c2)OCO3)c(c2ccccc2)c(c2ccc(OCCBr)c(Cl)c2)nc1c1ccc(OC)cc1	S000142\nCCOCC1CN(C(=O)Cc2ccc(c3ccccn3)n2C)CCC1(C)C	S000143\nCC(=NOCCCO)c1cc2c(c([N+](=O)[O-])c1)C(C)(C)CCC2(C)C	S000144\nCNC(=S)NN=CC(=O)c1ccc(C)c(C)c1	S000145\nO=C(O)COc1cccc(Nc2nc(c3ccccc3)cs2)c1	S000146\nCOc1ccc(c2nc(c3ccsc3Br)[nH]c2c2cc(OC)c(O)c(OC)c2)cc1	S000147\nCC(C)CC(NC(=O)OC(C)(C)C)C(=O)O	S000148\nCOC(=O)c1sc2c(c1C)C(=O)CC1C2COC2(CN(C)C)C(O)CC12	S000149\nCOC(=O)C1=C(c2cc3ccncc3o2)CC1	S000150\nCC(C)Oc1cc(Nc2ncnc3ccsc23)c(c2ccnc(NC(=O)CCl)n2)cc1Cl	S000151\nO=c1[nH]c(=O)n(C(=O)Cc2ccccc2)c2ccccc12	S000152\nCC(c1nc(c2ccc(F)cc2)oc1C)C1CCCO1	S000153\nCc1ccc(NC(=O)C(=O)NC2CCC(C)CC2)cc1	S000154\nC#CCNC(=O)c1cc(CN2CCOCC2)nc2cccc(C#N)c12	S000155\nCN(C)c1nc(=O)c2cc(Oc3ccccc3)ccc2n1CCC(=O)O	S000156\nCCC(C)Oc1c(C)c(C)cc2c1C(=O)C=C(c1ccc(C)cc1)C2=O	S000157\nO=C1CCc2ccc(NC(=O)NC3CC4CCC3C4)cc2O1	S000158\nNC(CCN1CCC(F)(F)CC1)Cc1ccccc1	S000159\nCOc1cc(c2nc3c(C)cccc3s2)cc(OC)c1OC	S000160\nCCN1C(=O)C(=Cc2ccc(C)cc2)C(=O)N(N)C1=S	S000161\nCc1cccc(c2cc(Cl)ccc2Oc2ccc(S(=O)(=O)Nc3nccs3)cc2C#N)c1	S000162\nCOCCN(C)c1cc(c2c(c3ccccc3)oc3cccc(OC)c23)no1	S000163\nCOc1cc(CCNCCO)cc(OC)c1	S000164\nFC(F)(F)c1cc(C(F)(F)F)ccc1c1ccc(c2ccc(Cl)cc2)s1	S000165\nCc1cccc(C(CNCCNCCO)c2cccc(C3(C)CCOCC3)c2)c1	S000166\nCc1cc(C)cc(NC(=O)c2nc(S(=O)(=O)Cc3ccccc3)ncc2F)c1	S000167\nCOc1ccc(C=CC(=O)C=Cc2ccc(OC)c(S(=O)(=O)N(C)C)c2)cc1	S000168\nCOc1ccc(N=C2NC(=O)CN2)cc1	S000169\nCn1c(=O)ccc2c(NC(=O)NC3CC(C)(C)CC3C(=O)NO)ncnc12	S000170\nCc1ccccc1OCc1nnc(Sc2ncnc3[nH]ccc23)s1	S000171\nO=C(CSc1nccn1c1ccc(Cl)c(Cl)c1)N1CCc2ccccc12	S000172\nO=C1CC(=NNc2nc(c3cn(CCCN4CCOCC4)nn3)nc(c3ccncc3)n2)C(=O)N1	S000173\nO=C(c1ccc([N+](=O)[O-])cc1)N1CCc2c(CCN3CCC(NCc4ccc(Cl)c(Cl)c4)CC3)cnn12	S000174\nCC1(C)Cc2nc(C(=O)N(CC(C)(O)C(F)(F)F)C(C)C)nn2C1(C)C	S000175\nCN(C)c1ccccc1C(=O)Nc1cccc(c2nnn(c3ccccc3)n2)c1	S000176\nO=C(O)C1CN(Cc2ccc(c3noc(C4CC4)n3)c(Cl)c2)CC1c1cccc(C(F)(F)F)c1	S000177\nCN1CCC(=O)c2cccnc12	S000178\nCc1onc(c2c(Cl)cccc2Cl)c1COc1ccc(c2ccc(NC(=O)c3ccc(c4nccs4)cc3)cc2)nc1	S000179\nCC(C)(C)c1ccc(CNCc2cccnc2)cc1C(=O)O	S000180\nO=C(Nc1cc(C(F)(F)F)ccc1n1cnc(C(F)(F)F)c1)c1cccs1	S000181\nNc1ncc(Cc2cccc(c3ccc(Cn4ccnc4)cc3)c2)cc1N	S000182\nO=C(NC1C=CC(c2ccccc2)C1)c1ccc(O)cc1	S000183\nS=C(Nc1ccc2c(c1)OCO2)N1CCN(S(=O)(=O)c2ccc(Cl)cc2)CC1	S000184\nCCC(Nc1nc(N)nc(Nc2ccc(C#N)cc2)n1)c1ccccc1	S000185\nCC1CCCN(C(=O)c2cc3cc([N+](=O)[O-])ccc3n2C)C1	S000186\nCc1nn(CCC(F)(F)F)c(C(=O)NCc2ccc(Cl)cc2)c1N	S000187\nCc1ccnc(CC(=O)NC(c2cccs2)C(C)C)c1	S000188\nCN(C)C1CCC(c2c[nH]c3ncccc23)C1	S000189\nCOc1ccc(c2c3c(oc4c(C)cc(SC)nc34)c(C(C)C)n2C)cc1	S000190\nCN(CCN=C(S)Nc1cc(c2ccccc2)nc2ccccc12)C1CNC(=O)C1	S000191\nCn1ccnc1CN1CCC2(CCN(c3cccc(c4ccccc4)c3)CC2)OC1=O	S000192\nCN1CCN(c2nc(n3ccnc3)cc(c3ccccc3[N+](=O)[O-])n2)CC1	S000193\nO=C(C1CC(=O)N(CCc2ccc(O)cc2)C1)N1CCN(c2ccccc2)CC1	S000194\nCN(C)CC#CC1CCCN1CCc1ccccc1	S000195\nCC1C(=O)N2C(CCC(C)C2)C2(N)C1(c1ccccc1)CCC=C2c1cccc[n+]1[O-]	S000196\nCCCNC(=O)c1noc(C(C)OCc2ccc(Cl)cc2)c1COc1ccccc1C	S000197\nCCC1C2(C)CCC3(C=O)C(COC(=O)C)CCC3CN1CC2	S000198\nCCCN(CC(=O)Nc1cccc(c2ccccc2)c1)C(C)C	S000199\nCc1ccc(C2=NS(=O)(=O)N(CC(=O)N3CCN(c4ccccn4)CC3)C2)cc1F	S000200\nCC1CCCN(C(=O)CSc2nnc(C3CC3)n2C)C1	S000201\nO=C1Cc2cc(O)ccc2C(c2ccc(O)c(O)c2)N1	S000202\nCC(=O)OCc1cc(C)no1	S000203\nO=C(C=Cc1ccc(O)c(C(=O)O)c1)Oc1ccc(Oc2ccccc2)c(C(=O)O)c1	S000204\nCCC(C)C(NC(=O)C1CCC(C)CC1)c1ccccc1F	S000205\nCCC(C)C(=O)OC1C(OC(=O)C)C2(O)CC3C(C)(CCC(OC(=O)C)C3(C)C2C=CC1C)OC(=O)CC	S000206\nCC(CO)Nc1nc(N)c2ncn(C3OC(CO)C(O)C3O)c2n1	S000207\nCc1nc2ccc(c3ccco3)cc2cn1	S000208\nCCN1CCC(c2ccc(F)cc2)C1C(c1ccccc1)c1ccccn1	S000209\nCc1cc(OS(=O)(=O)C)c2c(c1CO)c1ccc(Cl)cc1C2=O	S000210\nCC1CCC(CC(=O)NO)CC1	S000211\nO=C(Nc1ccc2c(c1)OCO2)c1ccc(n2nc(C(F)(F)F)cc2C(F)(F)F)nn1	S000212\nCCOc1ccc(n2nnc3c(OCc4ccc(C)cc4)ncnc23)cc1	S000213\nCOc1ncc(Nc2ncc3ccnn3c2)cc1C(C)C	S000214\nCc1cc2nc(NCN3CCOCC3)c(c3ccccc3)nc2cc1C	S000215\nCOc1cc2c(cc1OC)C1CCC1c1cc(OC)c(OC)c(OC)c21	S000216\nCc1cnc(c2nc3ncccc3o2)c(O)c1C(O)(Cn1cncn1)c1ccc(F)cc1F	S000217\nCC(C)CC(S)C(=O)NS(=O)(=O)OC1OC2C(OC(=O)C)C1C1OC(=O)C21c1ccc(C(F)(F)F)cc1	S000218\nCc1noc(NS(=O)(=O)c2ccccc2Cl)c1COc1cccc(C=Cc2ccc(OCC3COC(C)(C)C3)cc2)c1	S000219\nCc1ccccc1Cn1cc(C(=O)Nc2cncc(Cc3cccc(F)c3)c2)nn1	S000220\nCn1ncc2sc(c3ccccc3)c(O)c2c1=O	S000221\nCC(C)CCn1cc(C(=O)O)c(=O)c2cc(N)c(N3CCN(c4ccccn4)CC3)nc12	S000222\nO=C(Nc1ccccc1)OCC1CN(Cc2ccsc2)CCN1C	S000223\nCCOC(=O)N1CCC(N2N=C(c3ccc(Cl)cc3)CC2c2ccccc2)CC1	S000224\nCOc1cc(C2c3cc4c(cc3C(OC3O[N+](CO)C3CO)C3COC(=O)C23)OCO4)cc2c1OCO2	S000225\nCC(CO)Oc1ccc(OC(=O)c2ccc(C)cc2)cc1	S000226\nO=c1c2ccccc2cc2n1CCO2	S000227\nO=C(O)c1cn(Cc2cccc([N+](=O)[O-])c2)c2ccccc12	S000228\nO=C1NC(=O)C2(CC(C(c3c[nH]c4ccc(Br)cc34)c3ccccc3)(C2)S1)c1ccc(Cl)cc1	S000229\nClc1ccc(c2[nH]c(c3ccn[nH]3)nc2c2ccnc(c3cccs3)c2)[nH]1	S000230\nCc1cc(C)cc(NS(=O)(=O)c2ccc3[nH]c(c4cccs4)nc3c2)c1	S000231\nCC(C)(C)Cc1cnc(c2nnon2)c(N)n1	S000232\nCOCC1OC(n2cnc3c(N)ncnc23)CC1(C)C	S000233\nCCOC(=O)Cn1c(CN(C)C)cc(=O)n(C)c1=O	S000234\nCCOC(=O)C(=Cc1ccc(Br)cc1)SC	S000235\nCN1C2CCC1C(c1cccc(F)c1)C1CCC2N1S(=O)(=O)c1cccc2nsnc12	S000236\nO=C(Nc1ccc(SCCN2CCOCC2)cc1O)c1ccc(c2ccc(Cl)c(Cl)c2)o1	S000237\nCOc1ccc(C2C3=C(COC3=O)Nc3c2c(C)nn3c2ccc(O)cc2)cc1	S000238\nCN(C)c1ccc2c(C3=CCN(C(=O)Cc4cccs4)CC3)c[nH]c2c1	S000239\nCCC(=O)Nc1cc(c2[nH]nc(C)c2C#N)ccc1n1cnc(C)c1	S000240\nCN1CCc2nc(C(=O)N3CCOCC3)oc2C1	S000241\nFC(F)(F)c1cc(c2nc3ccccc3oc2=S)ccn1	S000242\nCN(C)CCNC(=O)CS(=O)(=O)Cc1ccccc1	S000243\nO=C(O)CN1CCC(CNC(=O)c2ccc(Sc3ccccc3)cc2)CC1	S000244\nCCOC(=O)Nc1ccc(OCC(C)NCCc2ccc(S(=O)(=O)N)cc2)cc1	S000245\nCOC(=O)CCCc1c(c2ccccc2)n(C)c2ccc(CO)cc12	S000246\nCN(C)CCc1ccccc1	S000247\nO=C(Nc1cncc(c2ccccn2)n1)c1ccc(Cl)s1	S000248\nCc1cc(C(=O)OCC(=O)N(C)CC2CCCO2)c(C)o1	S000249\nCC(C)(C)OC(=O)N1CC(O)C(O)C1O	S000250\nO=S(=O)(Nc1ncns1)c1cncc(O)c1	S000251\nCN1Cc2ccccc2C(c2ccccc2)NC1c1ccco1	S000252\nCOc1cc2nnnc(c3ccccc3)c2cc1OC	S000253\nCOc1ccc(CC2CC(O)C(=O)OC2CC23CC2(C)C2=CC(O)C(O)C(C(CC2)(C)C)C3=O)cc1	S000254\nc1ccc(CN2CCN(Cc3cc4ccccc4o3)CC2)cc1	S000255\nCc1ccc(CNC(=O)C2(C)CCN2C(=O)c2ccccn2)o1	S000256\nCCN(CC)C(=O)c1cccc(NC(=O)COc2ccccc2[N+](=O)[O-])c1	S000257\nCCCc1cnc2c(c3c(C)nc(N)nc3N)ccnc2c1C	S000258\nCC1CN(c2nc(N)c3ncn(C4CC4)c3n2)CC(C)O1	S000259\nCc1c(C=O)c(=O)oc2c(C)c(OCc3ccccc3)ccc12	S000260\nNCCC(Oc1cc(N2CCOCC2)nn1c1nccc(c2cccs2)n1)C(=O)O	S000261\nC=C(C)C1CCC2(C(=O)O)CCC3(C)C(CCC4C5(C)CCC(OC(=O)C=Cc6cccc(O)c6)C5CCC34C)C12	S000262\nCOc1ccc2nc(c3ccc(S(=O)(=O)NCC4CSCC4=Cc4ccccc4OC(F)(F)F)c(C)c3)ccc2c1	S000263\nCCc1cc(C)c(CNc2ccccc2)cc1S(=O)(=O)N	S000264\nCc1ccc(C)c(Oc2ccc(Nc3ccnc(S(=O)(=O)C)c3)nn2)c1	S000265\nN#Cc1cc(Cl)cc(c2nc(NCc3ccc(C4CCNCC4)cc3)ncc2OCCOc2ccc3[nH]ccc3c2)c1	S000266\nCC(=NNC(NC1=NC(=N)N(C)CC1)c1ccccc1)C1=CC(C)CC1	S000267\nCOc1nc(c2ccccn2)ccc1c1nc(c2cccnc2N)cc(=O)[nH]1	S000268\nCCc1n[nH]c2c1CN(C(=O)CC)CC2	S000269\nCOc1cc2c(cc1O)C(c1ccccc1)CC(NS(=O)(=O)c1ccc(c3cnc(N)c(C)c3)nc1)N2C(=O)C1CC1	S000270\nN=C(N)c1cccc(c2cc(c3ccc4[nH]c(=O)ccc4c3)cc(c3ccon3)n2)n1	S000271\nO=C(Cc1ccc(Cl)c(Cl)c1)Nc1cccc2c1CCC2	S000272\nCC(C(=O)NC(C)C12CC3CC(CC(C3)C1)C2)N1CCC(O)CC1	S000273\nCC1(C)C=Cc2c(ccc3c2OCO3)O1	S000274\nO=c1oc(c2ccco2)nn1C1OC(CO)C(O)C1O	S000275\nO=C(O)CNC(=O)CN1CCN(CCn2ccnc2)C1=O	S000276\nCCOC(=O)CNCC(C)C	S000277\nCCc1cnc2c(NC(C)c3ccccc3)cnn2c1N1CCN(c2ccccc2)CC1	S000278\nCCOc1ccccc1N1CCN(CCSCCC)CC1	S000279\nCOc1ccc(c2nc(N)sc2c2cc(OC)c(OC)c(OC)c2)cc1OC	S000280\nCC[N+](C)(CC)CCCOC(=O)C=CC1=C(C)CC(C)(C)CC1=O	S000281\nCOc1ccc2ncnc(NCCCc3ccccc3)c2c1	S000282\nCCN(CC)CCOc1cc(C(C)(C)C)ccc1Oc1ccccc1C	S000283\nCC(C)CNC(=O)COc1ccc2c(=O)cc(c3ccc(Cl)cc3)oc2c1	S000284\nCc1cc2c(cc1C)CC(C)(O)C(O)C2	S000285\nCc1cccc(C(=O)OCC(=O)N2CC=CC2=O)c1	S000286\nCOC(=O)CC(=O)C(Cc1ccc(Cl)cc1)N1CC(C)N(Cc2ccccc2)C1	S000287\nCN1CCN(c2nc(C(F)(F)F)nc3c2CCC3c2ccncc2)CC1	S000288\nO=S(=O)(c1cnc2ccc(Cl)cn12)c1cn(CC(F)F)c(Cl)c1	S000289\nCC1C(O)C=CC2(C)C1C(O)OCC2O	S000290\nCOc1ccc(OC)c(NC(=O)C(CC(=O)O)NC(=O)COC2OCCCOC2)c1	S000291\nCOc1cc(N2CCNCC2)ccc1Nc1ncc(C(F)(F)F)c(Oc2ccc(C(=O)O)cc2)n1	S000292\nO=c1[nH]c(=S)[nH]c2c1C(c1ccc(Cl)cc1)N(c1ccc(c3cnccn3)cc1)CC2	S000293\nO=C(NCC1OCCc2ccccc12)c1ncccc1F	S000294\nCC1=CCC(C(C)C)CC2OC(=O)C=CC12	S000295\nCOc1cc(C=NNc2nnnn2c2ccc(O)cc2)ccc1OCCCn1ccnc1	S000296\nO=C(C=Cc1ccc(O)cc1)CCC=Nc1cccc(C(=O)O)c1	S000297\nCc1cc(C#N)ccc1Oc1nn2c(C)ccnc2c1c1ccc(Cl)cc1	S000298\nCNC(=O)NC1CN(C(=O)C=Cc2ccc(OC)cc2)CC1C	S000299\nCc1ccoc1C(=O)NC(C)C1CCC2(CCNCC2)O1	S000300\nCc1nc(C#Cc2ccc(c3nc(C#N)ncc3C)cc2)cs1	S000301\nO=C(CCN1C(=O)C2(CCSc3ccccc23)CC1)Nc1ccc(C(F)(F)F)cc1	S000302\nCCCOCCn1c(C)nc2ccccc2c1=O	S000303\nCN(C)Cc1cc2cc(c3cccc(c4ccc(C(C)(C)C)cc4)c3)ccc2[nH]1	S000304\nCOc1cc(C(O)C(CO)Oc2ccc3ccsc3c2)cc(OC)c1	S000305\nO=S1(=O)CCN(c2cccc3ccccc23)CC1	S000306\nN=C(NC(CO)CNC(=O)N)c1ccc(Cc2ccc(C(F)(F)F)cc2)cc1	S000307\nCc1cccc(c2nc(N3CCNCC3)nc3c2ncn3C)c1	S000308\nCCn1c(SCC(=O)N)nnc1c1ccc(N2C(C)OC(C)C2C)cc1	S000309\nO=C(Nc1ccncc1)C(=O)NCCn1ccnc1	S000310\nO=C(COC(=O)C1CCC(=O)N1Cc1cccc(Cl)c1)NCC1CCCO1	S000311\nCC(C)c1cccc(C(C)C)c1OS(=O)(=O)NC(=O)Nc1cc(Oc2cncnc2)ccc1Cl	S000312\nCOCC(C)n1c(SCC(=O)NC(C)C)nc2ccccc12	S000313\nCCN1C(=O)CSC1CSC(=NS(=O)(=O)C1CC1)c1ccc(C(C)(C)C)cc1	S000314\nCOc1cc(CNc2ccc(C)cc2)c(C(=O)CCc2ccc(O)cc2O)cc1	S000315\nNC(=O)c1ncn2c1CN(C(=O)c1ccc(Cl)cc1)CC2	S000316\nO=C(Nc1nc(c2ccccn2)cs1)NCc1ccccc1Cl	S000317\nN#Cc1ccc(c2csc(NS(=O)(=O)c3ccc([N+](=O)[O-])cc3)n2)cc1F	S000318\nN#CC1(CCl)Oc2ccc(c3ccccc3)cc2C=C1n1cnc2c(Cl)cccc12	S000319\nCCOC(Cc1ccc(OCc2noc(c3ccc(OC)cc3)n2)cc1)C(=O)O	S000320\nClc1ccc(n2ccc3ccccc23)cc1F	S000321\nCSc1nc(NC(C)c2ccccn2)cc(c2ncccc2C#N)n1	S000322\nC=CCn1c(SCC(=O)Nc2ccc3c(c2)OCO3)nc2c(c1=O)SC2	S000323\nCc1ccc2cccc(OC3CNC3)c2c1	S000324\nCN1CC(c2ccc(Cl)cc2)(c2cccc(F)c2)CC1=O	S000325\nCCC(=O)NC1C(O)c2cc(c3ccc(OC)cc3)nnc2S1(=O)=O	S000326\nC1CCC(c2ccccc2)CC1	S000327\nCN(C)CCCNc1nccc(c2cnn(C3CCN(C(=O)c4c(Cl)cccc4Cl)CC3)n2)n1	S000328\nCc1cc(C)n(c2ccc(C(=N)N)cc2)n1	S000329\nCc1ccc(c2nc3c(o2)COCC3)cc1	S000330\nCOC(=O)C1OC(n2cnc3c2NC(c2ccc(OC)c(OC)c2)C3)C1Br	S000331\nCC(C)(C)c1ccc(C(=NO)c2cc(C=Cc3ccccn3)ccc2O)c(O)c1	S000332\nNC(C(=O)O)N1c2cc3c(cc2C(=O)C1=O)Cc1ccccc31	S000333\nCc1ccccc1NC(=O)Nc1cc(C)ccn1	S000334\nCCC(C)C(NC(=O)C(CC(=O)O)NC(=O)C(Cc1ccc(O)cc1)NC(=O)OCc1ccccc1)C(=O)O	S000335\nO=C(O)CC(NC(=O)C(Cc1c[nH]cn1)NC(=O)c1[nH]cnc1C(=O)NC(Cc1ccccc1)C(=O)OCC(=O)O)C(=O)O	S000336\nCn1nc([N+](=O)[O-])nc1Sc1nc2ccccc2[nH]1	S000337\nNC(=O)C(CO)NC(=O)C(N)CC(=O)O	S000338\nCCOc1cc(N2CCC3(CC2)COC(=NO3)CNC(=O)OCc2ccccc2)ccc1Cl	S000339\nO=C(O)C(NCCCNC(=O)OCCc1ccccc1)C(=O)O	S000340\nO=C(O)c1cc(c2nnn[nH]2)c(c2ccnc(Nc3ccc(F)cc3)n2)s1	S000341\nCC(=CCC1CC=CC(=C1OCCO)C)C=O	S000342\nN#Cc1csc2c(N)cnnc12	S000343\nc1ccc(NCc2nnc3ccc(c4ccccc4)nn23)cc1	S000344\nO=C(NC(Cc1cc(OCc2ccccc2)ccc1Cl)C(=O)O)c1ccccc1Cl	S000345\nCC(C)CC1C(=O)OC2C(OS(=O)(=O)O)COC3OC4(C)CCC1C23OO4	S000346\nCOc1ccc(C=CC(=O)Nc2ccc(N(C)S(=O)(=O)c3ccccc3)cc2)cc1	S000347\nCN1CCN(c2ccc(CCN(C)C)c3ccccc23)C1	S000348\nCOc1cnc2ccc3c4c(ccc4c4ccccc34)[nH]n12	S000349\nCn1ncc2c(NC(CCO)S(=O)(=O)c3ccc(NC(=O)Nc4ccccc4)cc3)ncnc12	S000350\nCOC(=O)c1c(C(=O)NN=C(C)c2ccc(OC)cc2)cn(C)c1C	S000351\nN#CC1=C(N)OC2=C(C(=O)c3ccccc3C2=O)C1c1ccccc1	S000352\nCCOC(=O)N1CCN(C(=S)NN=C(c2ccccc2)c2ccccc2)CC1	S000353\nCC(=O)Nc1n[nH]c2cccc(c3ccc(N4C(O)OC(C)C4)cc3)c12	S000354\nCc1cnn(c2ccccc2)n1	S000355\nNC(C(=O)O)C(CSC(=O)NN=Cc1ccc(O)cc1)C(=O)O	S000356\nCC=C(C)C(=O)OC1CC(C)C=C2C=CC(C)C(CCC(=O)OC)C2CC1OC	S000357\nCOc1ccccc1N1CCN(CCCNC(=O)c2cccnc2Oc2ccc([N+](=O)[O-])cc2)CC1	S000358\nO=S(=O)(c1ccc2ccccc2c1)N1CCN(c2nccc(c3ccc(C(F)(F)F)cc3)n2)CC1	S000359\nCCN1CCc2c(c3cc(OC)c(OC)cc3c3cc4c(cc23)OCO4)C1	S000360\nCCOC(=O)Cc1nc(C)cc(C)c1Oc1ccc(C#N)cc1	S000361\nCC1CN(C(=O)c2cccnc2Oc2ccc(N(C)C)cc2)CCN1S(=O)(=O)c1ccccc1Cl	S000362\nCC(C)(C)NC(=O)CC1CCC2(CC1)OOC1(O2)C2CC3CC(C2)CC1C3	S000363\nCc1cc(NCCCN(C)C)c2cc(C)ccc2n1	S000364\nCCN(CC)c1cc2ncc(c3ccccc3OC)n2c2c1CN(C)CC2	S000365\nCC(CSc1ccc(Cl)cc1)NO	S000366\nO=C1C(=C(NCC2CC2)C(=O)c2cnncc12)Cl	S000367\nCCC(NC(=S)NCc1ccc(Cl)cc1)C(C)(C)C	S000368\nOc1nncc2c1sc1nc3ccccc3n21	S000369\nCOc1ccc2[nH]c(C)c(Cc3ccc(F)cc3)n2c1=O	S000370\nO=Cc1cccc(c2cc(NC3CCOCC3)nc(c3ccc(NC(=S)NC4CCOCC4)c(Cl)c3)n2)c1	S000371\nCOc1cc2cc(c3cccnc3)c(=O)oc2c(c2cc(O)c(O)c(O)c2)c1OC	S000372\nCN(C)CCOc1ccc(n2cccc2)cc1	S000373\nCOc1ccc(C(=O)NC(C(C)C)C(C)C)cc1OC	S000374\nCCc1nn(CC(=O)O)c(C)c1C	S000375\nCOC1COC(=O)C(C)NC(=O)C(Cc2cccc(Oc3ccccc3C(=O)O)c2)NC1=O	S000376\nCCC(C)C(NC(=O)Cc1ccc(O)cc1)C(=O)NC(Cc1ccccc1)C(O)C(=O)N1CSCC1C(=O)N	S000377\nO=C(O)C(=O)NN=C1CCC(c2cccc(Cl)c2)C1	S000378\nCCOC(=O)C1CCN(C(=O)c2ccc(NS(=O)(=O)c3ccc4c(c3)OCCO4)cc2)CC1	S000379\nO=CN1C(CO)CC2CC1c1ccc(c3cccc(F)c3F)cc21	S000380\nCOc1cccc(C(=O)Nc2cc(C)c(C)cc2CC2COC(c3ccccc3)C2O)c1	S000381\nN#CC1CSCN1C(=O)C(CC(=O)N1CCNCC1)NC1CC1	S000382\nCOc1cccc(c2nn(CCCN3CCOCC3)c(=S)n2c2ccc3ccccc3c2)c1	S000383\nCC(=O)N1CCN(C2=C(c3cccnc3)C(=O)C2=O)CC1	S000384\nCC(C)C(NC(=O)CNC1CCN(Cc2cccc3cc[nH]c23)C1)c1ccccc1	S000385\nN=C(N)c1ccc2cc(CCCc3ccccc3)cc(Cl)c2c1	S000386\nCOc1cc2c(c(OC)c1OC)C(=O)c1ccccc1C2=O	S000387\nCC(C)N1CCN(CC(Oc2ccc(COc3ccc(C(C)(C)C)cc3)cc2)S(=O)(=O)C)CC1	S000388\nCC(C)c1ccc(OC(C)C(C)C)cc1C(=O)CNC1CCC(Oc2ccccc2C(=O)O)CC1	S000389\nCC(=O)NC(C)c1ccc(OCC(O)Cn2ccc(N)nc2=O)cc1	S000390\nCCCc1ccc(Nc2nc(C3CC3)nc3c2CCc2cc(Cl)cc(C(=O)N)c2C3)cc1	S000391\nCC(NC(=O)Nc1nccs1)(C(F)(F)F)C(F)(F)F	S000392\nN#Cc1cnc(NCCc2ccc(O)cc2)nc1O	S000393\nCc1ccc(c2ccn3cc(c4ncc(c5ccccc5)nn4)cc3n2)cc1C	S000394\nCCCn1c2ccccc2c2nnc(SCCNS(=O)(=O)c3ccc(OC)cc3)nc12	S000395\nCOC1C(OC2C3C=CC(O3)C(C(=O)O)OC2)C(OC)C1OCc1ccc(CO)c(Cl)c1Cl	S000396\nCOc1ccc(C(=O)Nc2ccccc2c2ncnc3sccc23)cc1	S000397\nCC1(O)CC(c2ccncc2NC(=O)N)Cc2ccc3ccccc3c12	S000398\nCCOC1(O)C(=O)c2ccccc2OC1(O)c1ccc(O)cc1	S000399\nC=CCNc1ccc(C#Cc2ncc3c(n2)CC(C)N(C(=O)C)CC3)cc1	S000400\nCCN(CC)CCNc1ccnc(c2cccc(CO)c2)n1	S000401\nCc1nc(C#Cc2ccccn2)no1	S000402\nC#Cc1ccc(C(=O)Cn2cc(C)c(=O)n(CC)c2=O)cc1	S000403\nCCOC(=O)C1CCN(S(=O)(=O)c2cnc(Cl)c([N+](=O)[O-])c2)CC1	S000404\nCC(C(=O)Nc1ncc(CO)c(n2cnc3ccccc23)n1)c1ccc(C)cc1	S000405\nCOc1c(C(=O)NCc2ccc3c(c2)OCO3)c(C)nn1C	S000406\nCOc1ccc(NC(=Nc2ccccn2)S)cc1OC	S000407\nCCc1cccc(CC)c1N1C(=O)CC(CN2CCOCC2)C1=O	S000408\nCCC(C)(C)N=C(S)Nc1cccc2cccnc12	S000409\nCCn1c(=N)n(CC(=O)c2ccc(C)c([N+](=O)[O-])c2)c2ccccc12	S000410\nCc1nc2c(c(NCc3cccnc3)n1)CC(CC(C)(C)O)OC2	S000411\nCN(C)c1ccc(c2cn3ccnc(N)c3n2)cc1	S000412\nCC(=O)Nc1nc2ccc(NC(=O)C3CCC(NC(=O)N(C)C)CC3)cc2s1	S000413\nO=[N+]([O-])c1ccc(SCCCN2CCN(c3cccc(Cl)c3)CC2)cc1	S000414\nNS(=O)(=O)c1cn(CC(=O)NCc2ccc(Cl)c(Cl)c2)c(=O)[nH]c1=O	S000415\nCC1CN(C2=C(c3ccc(OCC(F)(F)F)cc3)C(=O)C2=O)CCN1	S000416\nCNC(CN(C)C)C(=O)C1CCC(C)(C)CC1	S000417\nN#CC(=Cc1ccc[nH]1)C(=O)Nc1cccc(C(F)(F)F)c1	S000418\nOC(c1ccc(Cl)cc1)(c1ccsc1)C1CC(COC(=O)c2ccccc2)OC1=O	S000419\nCc1cc(C)cc(NC(=O)CSc2nnc(Cc3cc(Cl)ccc3Cl)o2)c1	S000420\nCOC(=O)c1[nH]c2ccccc2c1Sc1ccc(Cl)cc1	S000421\nCS(=O)(=O)c1ccc(n2cc(c3ccc4c(c3)OCO4)nn2)cc1	S000422\nCN(C(=O)C(F)(F)C(F)(F)F)c1nc2[nH]c(=S)n(c3ccc(OC)cc3)c(=O)c2cc1Cl	S000423\nCc1cccc(c2ccc3nc(C)cc(N)c3c2)c1	S000424\nO=C(NC(Cc1ccccc1)C(O)C=CC(=O)C1(c2ccc3ccccc3c2)CC1)c1ccc(Cl)cc1	S000425\nCOc1ccc(N2CCN(C(=O)COC(=O)c3cccn3C)CC2=O)c(C)c1	S000426\nCCCc1n[nH]c(SCc2ccccc2Cl)n1	S000427\nC[N+](C)([O-])CCCn1c(=N)c(C=Cc2ccccc2)cc2ccccc12	S000428\nCOc1cccc(NC(=O)CN2CCN(C(=O)c3ccc(c4ccccc4)cc3)CC2)c1	S000429\nCC(=O)c1c(C)[nH]c(C(=O)COC(=O)c2cc3ccccc3[nH]2)c1C	S000430\nCc1sc(C)c(C)c1C(=O)NC(Cc1ccccc1)C(O)CNC(=O)c1oc(c2cc3ccccc3nc2S)cc1C(=O)N	S000431\nCCc1c(C#N)c(N)nc(O)c1Sc1ccccc1Br	S000432\nc1ccc(c2nc(c3cnccn3)no2)cc1	S000433\nNc1nnc(Cc2nnc(c3ccsc3)s2)s1	S000434\nNCCC(=O)NCC1(c2ccc(c3ccccc3)cc2)CCC1	S000435\nCC(C)c1ccc(C=C2Oc3ccc(O)c(O)c3C2=O)cc1	S000436\nCc1ccc2c(OCCCn3cccc3)ccnc2c1	S000437\nCOc1ccc(OC)c(CCN2CCN(S(=O)(=O)c3cccc4[nH]ccc34)CC2)c1	S000438\nO=C1OCC(O)C(c2ccccc2)O1	S000439\nCOc1cc2c(c(OC)c1OC)C1CC(C)OC1CN(Cc1ccc3c(c1)OCCO3)C2	S000440\nCCC(CO)n1cc(C(=O)O)c(=O)c2cc(F)c(N3CCN(c4nnc(O)s4)CC3)cc12	S000441\nC=CC(=O)Nc1cccc(C(=C(Nc2ccccc2)c2ccccc2)C#N)c1	S000442\nCC(C)(C)c1cc(C(=O)CCC(=O)N(Cc2ccccc2Cl)C2CCS(=O)(=O)C2)on1	S000443\nCCOC(=O)C1CCN(S(=O)(=O)c2ccccc2F)CC1	S000444\nCN(Cc1cccc(F)c1)C(=O)OCc1ccc2c(c1)OCO2	S000445\nCCN(CC)c1ccc(C(=O)c2cc3c(cc2C)c(CC)c(C(=O)OC)n3C)cc1	S000446\nCCCc1ncnc(c2ccc(C(=O)N3CCC(F)CC3)cc2OC)c1c1nc2ccc(Cl)cn2c1N	S000447\nCC1CCC(C(C)C)C(OC2CCC(C)CC2)C1O	S000448\nCOc1cc2c(cc1NC(=O)C)c1c(O)c(OC)c(OC)c(OC)c1C(=O)/C=C(/C)\CC2	S000449\nNS(=O)(=O)C1=CC2=C(C=Cc3ccccc13)C1C(=C1[N+](=O)[O-])OC2c1ccc(OCc2noc(Cc3ccccc3)n2)cc1	S000450\nO=C(CSc1nnc(c2ccc3ccccc3c2)n1c1ccccc1)N1CCOCC1	S000451\nCCN(CC)C(=O)CCn1c(=O)c2ccccc2n2c(COCc3cnn(CC4CCN4)c3)nnc12	S000452\nCC1(C)C(=CCCc2cc(C(C)(C)C)c(O)c(C(=O)O)c2)C(C)(C)C1=O	S000453\nCOc1cc(OC2CCN(C(C)C[N+](C)(C)C)CC2)ccc1C(=O)NC1CCC(N)CC1	S000454\nCOc1cc(Cc2nnc3n2c2nc(Nc4ccccc4)ncc2c(N)n3)cc(OC)c1OC	S000455\nCCC(C)OC(=O)c1ccc(Nc2ccc(OC)cc2)cc1C(=O)OC	S000456\nCOCc1cn(C2OC(COC(=O)C(C)O)C(OC(=O)C)C2OC(=O)C)c(C)n1	S000457\nCOc1nc2c(Oc3ccc(C(=O)C)cc3F)cccn2c1C(=O)c1ccc(Cl)cc1	S000458\nCC(=O)Nc1nc2ccccc2n2c(CN3CCOCC3)nnc12	S000459\nCCc1cc2c(cc1O)nnn2CC1C2Cc3ccccc3C1n1cccc(c1=O)C2=O	S000460\nO=C(Nc1cccc(C(F)(F)F)n1)NC1CCC(CNS(=O)(=O)c2ccccc2)CC1	S000461\nCCCc1c(N(CCO)CC)c2ccccc2n1CCN(C)CCO	S000462\nCC(C)(C)NC(=O)C1=C(C)NC(=O)C21CCC(C#N)CC2	S000463\nCn1nnnc1SCC(=O)Nc1ccc(OCCN(C(CCBr)CCN(C)C)c2ccc(Cl)cc2)cc1	S000464\nCSc1ccc(N2CCN(S(=O)(=O)C)CC2)cc1	S000465\nCN1CCN(Cc2cccc(c3ccnc(NCCc4cccc(C#N)c4)n3)c2)CC1	S000466\nCCOC(C)C(=O)N(c1ccccc1)c1nnc(C(C)C)n1C(C)C	S000467\nC=CCOc1ccc(C2=Nc3ccccc3N(C(=O)Cc3nc4ccccc4s3)C2C(=O)NC(C)(C)C)cc1	S000468\nO=C(Nc1ccc2c(c1)CCCN2C(=O)c1ccc(Cl)cc1)c1ccccc1F	S000469\nCc1ccc(S(=O)(=O)N(C)C)cc1NC(=O)C1CCCN1C(=O)CCC(C)(C)C	S000470\nCn1cc(F)c(c2ccc(COC3COc4nc(N)nc(N)c4C3=O)cc2)c1	S000471\nCc1ccc(n2nc(C(=O)NS(=O)(=O)c3ccc(C)cc3)c3ccccc3c2=O)cc1	S000472\nCOc1nc(NCc2cccs2)ccc1Sc1cc(C)ccc1N	S000473\nCC(C)(O)CCC(O)C1(O)C(C)COC23CC(=CC12)C(=O)OC3	S000474\nC=C(C)C1CCC2(C(=O)O)CCC3(C)C(CCC4C5(C)CCC(O)C(C)(C)C5CCC34C)C12	S000475\nCCOc1ccc(c2csc(NN=C(C)c3cccnc3)n2)cc1OC	S000476\nCOc1ccccc1N1CCN(CCCOc2ccc(c3cc4ccccc4o3)cc2)CC1	S000477\nCc1cc(NC(=O)COC(=O)c2cc(C)n(c3ccccc3)n2)no1	S000478\nCCCNCCCOCCS(=O)(=O)C	S000479\nO=C1COC2CNCCN2C1	S000480\nCC1=CC(C)(C)Nc2ccc3ccccc3c12	S000481\nCCN(CC)C(=O)Nc1ccc(c2nc(C(F)(F)F)n(C)c2Br)cc1	S000482\nCC(C)n1ncc2c(NCc3cccc(Cl)c3)ncnc12	S000483\nCOc1nc([N+](=O)[O-])ccc1C=NNC(=S)N	S000484\nCc1nc(C(F)(F)F)cc2nc(N(C)Cc3ncccc3C)n(C)c12	S000485\nCOc1ccc(CNC(=O)CN(c2ccc(C)c(C)c2)S(=O)(=O)C)cc1	S000486\nCn1cncc1C[S+]([O-])C1Oc2ccccc2C1	S000487\nO=C(Oc1ccc(NC(=O)c2ccccc2Cl)cc1O)c1ccccc1	S000488\nCOC1C([N+]2(C)CCN(C(=O)OC(C)(C)C)CC2C)C2C1CCC2O	S000489\nCCC(C)Oc1cc(Nc2cncc(c3cccc(C#N)c3)n2)cc2nonc12	S000490\nCN1CCN(CCCNc2ncc3c(n2)CCNC3=O)CC1	S000491\nCCN1CC(=Cc2ccc(O)cc2)C(=O)C1(c1ccccc1)c1ccc(O)cc1	S000492\nCc1ccc(CN(CCCN(C)C)C(=O)CCC(=O)Nc2ccc3c(c2)OCCO3)cc1	S000493\nCCOC(=O)c1cc(c2ccc(OC)cc2)nn1CC1CC(c2ccccc2)CN1C(=O)c1ccccc1	S000494\nCOc1ccccc1N1CCN(CCNC(=O)c2cscc2n2cccc2)CC1	S000495\nCc1nc2oc3c(OCC=C(C)C)cccc3c(=O)c2cc1O	S000496\nCCn1cc(Br)c(Cl)c(NC(=O)c2ccc(S(=O)(=O)C)cc2)c1=O	S000497\nCOc1ccc(c2nc3c(N(C)C)cccc3n2Cc2c(CN)ccc(C)c2C)cc1	S000498\nCc1cc(C)n(C(C#N)C(=O)c2[nH]c(C)nc2C)n1	S000499\nNC(=O)c1ccc(n2nc(C(F)(F)F)cc2c2ccc(c3ccc(C(=O)O)cc3)[nH]2)cc1	S000500\n"
$(function(){
    $('.demo1').on({
        click: function(){
			$("#textMol").val(demo1_str);
        }
    });
	$('.demo2').on({
        click: function(){
			$("#textMol").val(demo2_str);
        }
    });
});