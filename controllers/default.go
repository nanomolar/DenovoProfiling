package controllers

import (
	"denovoprofiling/util"

	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
	responseMsg util.ResponseMsg
}

func (this *MainController) Index() {
	this.TplName = "index.html"
}

func (this *MainController) Service() {
	this.TplName = "service.html"
}

func (this *MainController) Help() {
	this.TplName = "help.html"
}

func (this *MainController) Result() {
	this.TplName = "result.html"
}

func (this *MainController) JobCheck() {
	this.TplName = "job_check.html"
}

/*
func (this *MainController) Marvin4js() {
	this.Ctx.Output.Download("marvin4js-license.cxl")
}
*/
