package controllers

import (
	"denovoprofiling/models"
	"denovoprofiling/util"
	"fmt"
	"os"
	"strings"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

func (this *MainController) SubmitJob() {
	fmt.Println("Submitting ...")
	// create a job
	var j models.Job
	util.CreateJob(&j)
	j.JobType = this.GetString("analysisMethod")
	fmt.Println(j.JobType)
	fmt.Println(this.GetString("chemicalSpaceType"))
	fmt.Println(this.GetString("alignmentType"))
	fmt.Println(this.GetString("fpType"))
	j.FpType = this.GetString("fpType")
	j.AlignType = this.GetString("alignmentType")
	j.ChemspaceType = this.GetString("chemicalSpaceType")
	jobPath := beego.AppConfig.String("jobPath") + j.JobId
	err := os.MkdirAll(jobPath, os.ModePerm)
	if err != nil {
		panic(err)
	}

	// get upload file or save the string to a file

	var submitFilePath string
	fileType := this.GetString("fileType")
	if fileType == "SMILES" {
		fileType = "SMI"
	}
	if this.GetString("isFile") == "true" {
		_, header, _ := this.GetFile("molFile")
		submitFilePath = jobPath + "/SUBMIT." + fileType
		j.FileName = header.Filename
		err = this.SaveToFile("molFile", submitFilePath)
		if err != nil {
			fmt.Println(err)
		}
	} else {
		j.FileName = "SUBMIT." + fileType
		submitFilePath = jobPath + "/" + j.FileName
		fo, _ := os.Create(submitFilePath)
		_, err = fo.WriteString(this.GetString("molText"))
		if err != nil {
			fmt.Println(err)
			panic(err)
		}
		fo.Close()
	}

	//	generate SDF file for non-SDF format

	if fileType == "SDF" {
		j.HitsSdfile = submitFilePath
	} else {
		fileNameOnly := strings.TrimSuffix(submitFilePath, fileType)
		SDFilePath := fileNameOnly + "SDF"

		valid := util.Callobabel(submitFilePath, SDFilePath, "--gen2D", "--addinindex")

		if valid {
			j.HitsSdfile = SDFilePath
		} else {
			this.responseMsg.ErrorMsg("Can not convert to SDF File", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
	}

	cnt, err := util.SDfileToChemDB(j.HitsSdfile, j.JobId)
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	fmt.Printf("Job : %s created successfully\n", j.JobId)

	// generate inchikey and save to db
	inchiKeyFile := jobPath + "/query.inchikey"
	util.Callobabel(j.HitsSdfile, inchiKeyFile, "", "")
	inchikeys := util.ReadInchiKey(inchiKeyFile)

	if cnt == int64(len(inchikeys)) {
		var mols []models.Structure
		qs := orm.NewOrm().QueryTable("structure")
		_, err = qs.Filter("job_id", j.JobId).All(&mols)
		for i := 0; i < int(cnt); i++ {
			var m models.Structure
			m = mols[i]
			m.Inchikey = inchikeys[i]
			m.Update()
		}
	}

	// pubchem mapping
	/*if j.Status == "Running" {
		pubchemMapResultFile := jobPath + "/pubchem_mapped.csv"
		util.PubchemMapping(inchiKeyFile, pubchemMapResultFile)
		util.ReadPubchemMapResult(pubchemMapResultFile, j.JobId)
	}*/

	j.Update()
	this.responseMsg.SuccessMsg("", j)
	this.Data["json"] = this.responseMsg
	this.ServeJSON()
	this.TplName = "service.html"
}

func (this *MainController) JobStatus() {
	fmt.Println("Job Status ...")

	JobId := strings.TrimSpace(this.GetString("jobid"))
	fmt.Println("job_id  " + JobId)

	var j models.Job
	err := j.Query().Filter("job_id", JobId).One(&j)
	//fmt.Printf("%v\n", j)
	if err != nil {
		this.responseMsg.ErrorMsg("No such Job ID!", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		return
	}

	this.responseMsg.SuccessMsg("", j)
	this.Data["json"] = this.responseMsg
	this.ServeJSON()
	this.TplName = "job_check.html"

}
