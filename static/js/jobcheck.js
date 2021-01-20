$(function(){
		//jobid = getQueryString("jobid")
		//if (jobid !== null){
		//	$(".jsJobID2").val(jobid);
		//}
          var JobID1 = window.localStorage? localStorage.getItem("jobID"): Cookie.read("jobID");
          if (JobID1) {document.getElementsByClassName("jsJobID2")[0].setAttribute("value", JobID1);}
          //  Click search button to submit job
          $(".jsJobsubmit2").on({
              click: function () {
                  var JobID = $(".jsJobID2").val().trim();
                  if (JobID.length==20) {
                      $(".jobSearch").removeClass("has-error");
                      $(".errorJobTip").hide();
                      if (window.localStorage) {
                        localStorage.setItem("jobID", JobID);
                      } else {
                          Cookie.write("jobID", JobID);
                      }
					  $.ajax({
                        url: "jobStatus",
                        type: "POST",
                        data: {"jobid":JobID},
                    }).done(HandleJobStatus);    
                  } else {
                      $(".jobSearch").addClass("has-error");
                      $(".errorJobTip").show();
                      return false;
                  }
              }
          });
          //  Using "Enter" to submit job
          $(".jsJobID2").keyup(function(event){
              var JobID = $(this).val().trim();
              if(event.keyCode == 13){
                  var JobID = $(".jsJobID2").val();
                  if (JobID.length==20) {
                      $(".jobSearch").removeClass("has-error");
                      $(".errorJobTip").hide();
                      if (window.localStorage) {
                        localStorage.setItem("jobID", JobID);
                      } else {
                          Cookie.write("jobID", JobID);
                      }
                      $.ajax({
                        url: "jobStatus",
                        type: "POST",
                        data: {"jobid":JobID},
                    }).done(HandleJobStatus);  
                  } else {
                      $(".jobSearch").addClass("has-error");
                      $(".errorJobTip").show();
                      return false;
                  }   
              }            
          });
        })

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function HandleJobStatus(jobState){
    //var jobState = JSON.parse(msg);
	
	if (jobState.State != "success"){
        $(".loading").hide();
        alert("Failed to check the job. Please check your JobID.");
        return false;
    } 
    console.log(jobState);
	console.log(jobState.Data.JobId);
	//$("#JobID").html(jobState.Data.JobId);
	//$("#Status").html(jobState.Data.Status);

    if (jobState.Data.Status == "success"){
        if (window.localStorage) {
            localStorage.setItem("jobID", jobState.Data.JobId);
        } else {
            Cookie.write("jobID", jobState.Data.JobId);
        } 
        window.location.href = "result?jobid=" + jobState.Data.JobId;
    }else if (jobState.Data.Status == "Running"){
		$("#JobID").html(jobState.Data.JobId);
		$("#Status").html(jobState.Data.Status);
		$(".JobTip").show();
		sleep(5000).then(() => {
    		$(".JobTip").hide();
		})
	}else if (jobState.Data.Status == "Failed"){
		$("#JobID2").html(jobState.Data.JobId);
		$("#Status2").html(jobState.Data.Status);
		$(".FailTip").show();
	}
}



function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

$(function(){
	jobid = getQueryString("jobid")
	if (jobid !== null){
		$(".jsJobID2").val(jobid);
	}
})

