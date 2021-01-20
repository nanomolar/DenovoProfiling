package routers

import (
	"denovoprofiling/controllers"

	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/", &controllers.MainController{}, "*:Index")
	beego.Router("/index", &controllers.MainController{}, "*:Index")
	beego.Router("/service", &controllers.MainController{}, "*:Service")
	beego.Router("/result.html", &controllers.MainController{}, "*:JobCheck")
	beego.Router("/result", &controllers.MainController{}, "*:Result")
	beego.Router("/profiling", &controllers.MainController{}, "*:Profiling")
	beego.Router("/help", &controllers.MainController{}, "*:Help")

	//upload a library
	beego.Router("/job", &controllers.MainController{}, "*:SubmitJob")
	beego.Router("/jobStatus", &controllers.MainController{}, "*:JobStatus")
	beego.Router("/browse", &controllers.MainController{}, "*:Browse")

	//download
	beego.Router("/downloadLib", &controllers.MainController{}, "*:DownloadLib")
	beego.Router("/downloadAlignedLib", &controllers.MainController{}, "*:DownloadAlignedLib")
}
