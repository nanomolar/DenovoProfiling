package controllers

import (
	"denovoprofiling/models"
	"denovoprofiling/util"
	"fmt"
	"strings"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

func (this *MainController) Browse() {

	fmt.Println("browse")
	//	chemDBId := strings.TrimSpace(this.GetString("job_id"))
	//	fmt.Println("job_id  " + chemDBId)
	//	var chemDB models.ChemDB
	//	err := chemDB.Query().Filter("Id", chemDBId).One(&chemDB)
	//	fmt.Printf("%v\n", chemDB)
	//	if err != nil {
	//		this.responseMsg.ErrorMsg("", nil)
	//		this.Data["json"] = this.responseMsg
	//		this.ServeJSON()
	//		return
	//	}

	// get limited structures of this chemDB

	start, _ := this.GetInt64("start")
	limit, _ := this.GetInt64("limit")
	fmt.Println(start)
	fmt.Println(limit)
	//	if chemDB.Molnum <= (start + limit) {
	//		limit = chemDB.Molnum - start
	//	}
	//	if chemDB.Molnum <= limit {
	//		limit = chemDB.Molnum
	//	}
	var mols []models.Structure
	qs := orm.NewOrm().QueryTable("structure")
	_, err := qs.Filter("job_id", this.GetString("job_id")).Limit(limit, start).All(&mols)
	if err != nil {
		this.responseMsg.ErrorMsg("", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		return
	}

	// get properties for each molecule

	//	for i, _ := range mols {
	//		var props []*models.Property
	//		qs := orm.NewOrm().QueryTable("property")
	//		_, err = qs.Filter("CmpId", mols[i].Id).All(&props)
	//		mols[i].Props = props
	//	}
	this.responseMsg.SuccessMsg("", mols)
	this.Data["json"] = this.responseMsg
	this.ServeJSON()
}

func (this *MainController) DownloadLib() {

	fmt.Println("download lib")
	JobId := strings.TrimSpace(this.GetString("jobid"))
	fmt.Println("job_id  " + JobId)

	var job models.Job
	job.Query().Filter("job_id", JobId).One(&job)

	this.Ctx.Output.Download(job.HitsSdfile)
}

func (this *MainController) DownloadAlignedLib() {

	fmt.Println("download lib")
	JobId := strings.TrimSpace(this.GetString("jobid"))
	fmt.Println("job_id  " + JobId)

	AlignedHitsPath := beego.AppConfig.String("jobPath") + JobId + "/out_Aligned.sd"
	this.Ctx.Output.Download(AlignedHitsPath)
}

func (this *MainController) DownloadADMET() {

	fmt.Println("download ADMET")
	JobId := strings.TrimSpace(this.GetString("jobid"))
	fmt.Println("job_id  " + JobId)
	ADMETPath := beego.AppConfig.String("jobPath") + JobId + "/ADMET_Prediction_Results.csv"
	this.Ctx.Output.Download(ADMETPath)
}

func (this *MainController) ShowEdgeInfor() {
	to, _ := this.GetInt64("to")
	fmt.Println(to)

	var j models.Mol_target
	err := j.Query().Filter("id", to).One(&j)
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
}

func (this *MainController) Profiling_bk() {
	fmt.Println("Profiling ...")
	JobId := strings.TrimSpace(this.GetString("jobid"))
	//fmt.Println("job_id  " + JobId)

	var j models.Job
	err := j.Query().Filter("job_id", JobId).One(&j)
	//fmt.Printf("%v\n", j)
	if err != nil {
		this.responseMsg.ErrorMsg("No such Job ID!", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		return
	}

	// check job overdue, only keep job within 15 days
	t := time.Now().AddDate(0, 0, -15)
	fmt.Println(t)
	fmt.Println(j.StartTime)
	if t.After(j.StartTime) {
		fmt.Println("true")
		this.responseMsg.ErrorMsg("Job is overdue!", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		return
	}

	// check job status

	JobPath := beego.AppConfig.String("jobPath") + j.JobId + "/"
	inchiKeyFile := JobPath + "query.inchikey"
	pubchemMapResultFile := JobPath + "pubchem_mapped.csv"

	if j.Status == "Running" {
		util.PubchemMapping(inchiKeyFile, pubchemMapResultFile)
	}
	check, _ := util.PathExists(pubchemMapResultFile)
	if check {
		util.ReadPubchemMapResult(j.JobId)
	} else {
		fmt.Println("PubChem mapping failed")
	}

	// get mol infor
	var mols []models.Structure
	qs := orm.NewOrm().QueryTable("structure")
	_, err = qs.Filter("job_id", JobId).All(&mols)
	if err != nil {
		this.responseMsg.ErrorMsg("", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		j.FinishTime = time.Now()
		j.Status = "failed"
		return
	}

	//get des infor
	if j.Status == "Running" {
		err = util.GenDescriptors(&j)
		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
	}

	despath := JobPath + "des.csv"
	var ps []models.Prop
	ps = util.ReadDescriptorsFile(despath)

	resultsInfo := make(map[string]interface{})
	resultsInfo["mols"] = mols
	resultsInfo["props"] = ps

	//pubchem mapping

	// profiling user defined service
	jobType := j.JobType
	if strings.Contains(jobType, "scaffold") {
		fmt.Println("Start scaffold analysis")
		if j.Status == "Running" {
			err = util.GenScaffold(&j)
			if err != nil {
				this.responseMsg.ErrorMsg("", nil)
				this.Data["json"] = this.responseMsg
				this.ServeJSON()
				return
			}
		}
		Scaffold_des_path := JobPath + "SUBMIT_scls.txt"
		Scaffold_stru_path := JobPath + "SUBMIT_scls_cnt.sdf"
		scaffolds, err := util.ReadScaffoldResult(Scaffold_stru_path, Scaffold_des_path)
		if err != nil {
			fmt.Println(err)
			fmt.Println("No scaffolds find.")
		}
		resultsInfo["scaffold"] = scaffolds
	}
	if strings.Contains(jobType, "diversity") {
		fmt.Println("Start identification and visualization")
		des, err := util.GetDescriptor(despath)

		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
		resultsInfo["des"] = des

		if j.Status == "Running" {
			util.CalDistance(&j)
			util.CalPCA(&j)
		}
	}
	if strings.Contains(jobType, "target") {
		fmt.Println("Start target and pathway mapping")
		targets, network, pathway := util.Annotation(&j)
		resultsInfo["targets"] = targets
		resultsInfo["network"] = network
		resultsInfo["pathway"] = pathway
	}
	if strings.Contains(jobType, "drugs") {
		fmt.Println("Start drugs mapping")
		if j.Status == "Running" {
			util.DrugsComp(&j)
		}
		DrugHits_path := JobPath + "2DsimDrugs.txt"
		drugs, err := util.ReadDrugCompResult(DrugHits_path, j.JobId)
		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
		resultsInfo["drugs"] = drugs

	}
	if strings.Contains(jobType, "alignment") {
		fmt.Println("Start alignment")

		var alignment []*models.Structure
		if j.Status == "Running" {
			util.GenerateConfAlign(&j)
			//util.Align(&j)
		}
		alignment = util.ReadAlignResult(j.JobId)
		resultsInfo["alignment"] = alignment
	}

	if strings.Contains(jobType, "admet") {
		fmt.Println("Start ADMET")
		if j.Status == "Running" {
			util.ADMETPrediction(&j)
		}
		admet := util.ReadADMET(JobPath + "ADMET_Prediction_Results.csv")
		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
		resultsInfo["admet"] = admet
	}

	j.Status = "success"
	j.FinishTime = time.Now()
	j.Update()
	resultsInfo["job"] = j
	this.responseMsg.SuccessMsg("", resultsInfo)
	this.Data["json"] = this.responseMsg
	this.ServeJSON()
	this.TplName = "result.html"
	fmt.Println("Success")
}

func (this *MainController) Profiling() {
	fmt.Println("Profiling ...")
	JobId := strings.TrimSpace(this.GetString("jobid"))
	//fmt.Println("job_id  " + JobId)

	var j models.Job
	err := j.Query().Filter("job_id", JobId).One(&j)
	//fmt.Printf("%v\n", j)
	if err != nil {
		this.responseMsg.ErrorMsg("No such Job ID!", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		return
	}

	// check job overdue, only keep job within 15 days
	t := time.Now().AddDate(0, 0, -15)
	fmt.Println(t)
	fmt.Println(j.StartTime)
	if t.After(j.StartTime) {
		fmt.Println("true")
		this.responseMsg.ErrorMsg("Job is overdue!", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		return
	}

	// check job status

	JobPath := beego.AppConfig.String("jobPath") + j.JobId + "/"
	inchiKeyFile := JobPath + "query.inchikey"
	pubchemMapResultFile := JobPath + "pubchem_mapped"

	if j.Status == "Running" {
		util.PubchemMapping(inchiKeyFile, pubchemMapResultFile)
	}
	check, _ := util.PathExists(pubchemMapResultFile + "_batch_1.csv")
	if check {
		util.ReadPubchemMapResult(j.JobId)
	} else {
		fmt.Println("PubChem mapping failed")
	}

	// get mol infor
	var mols []models.Structure
	qs := orm.NewOrm().QueryTable("structure")
	_, err = qs.Filter("job_id", JobId).All(&mols)
	if err != nil {
		this.responseMsg.ErrorMsg("", nil)
		this.Data["json"] = this.responseMsg
		this.ServeJSON()
		j.FinishTime = time.Now()
		j.Status = "failed"
		return
	}

	//get des infor
	if j.Status == "Running" {
		err = util.GenDescriptors(&j)
		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
	}

	despath := JobPath + "des.csv"
	var ps []models.Prop
	ps = util.ReadDescriptorsFile(despath)

	resultsInfo := make(map[string]interface{})
	resultsInfo["mols"] = mols
	resultsInfo["props"] = ps

	//pubchem mapping

	// profiling user defined service
	jobType := j.JobType
	if strings.Contains(jobType, "scaffold") {
		fmt.Println("Start scaffold analysis")
		if j.Status == "Running" {
			err = util.GenScaffold(&j)
			if err != nil {
				this.responseMsg.ErrorMsg("", nil)
				this.Data["json"] = this.responseMsg
				this.ServeJSON()
				return
			}
		}
		Scaffold_des_path := JobPath + "SUBMIT_scls.txt"
		Scaffold_stru_path := JobPath + "SUBMIT_scls_cnt.sdf"
		scaffolds, err := util.ReadScaffoldResult(Scaffold_stru_path, Scaffold_des_path)
		if err != nil {
			fmt.Println(err)
			fmt.Println("No scaffolds find.")
		}
		resultsInfo["scaffold"] = scaffolds
	}
	//similarity,pca,distribution,scaffold
	if strings.Contains(jobType, "diversity") {
		fmt.Println("Start chemical space")

		if strings.Contains(j.ChemspaceType, "distribution") {
			des, err := util.GetDescriptor(despath)
			if err != nil {
				this.responseMsg.ErrorMsg("", nil)
				this.Data["json"] = this.responseMsg
				this.ServeJSON()
				return
			}
			resultsInfo["des"] = des
		}
		if strings.Contains(j.ChemspaceType, "similarity") {
			if j.Status == "Running" {
				util.CalDistance(&j)
			}
		}
		if strings.Contains(j.ChemspaceType, "pca") {
			if j.Status == "Running" {
				util.CalPCA(&j)
			}
		}
		if strings.Contains(j.ChemspaceType, "scaffold") {
			fmt.Println("Start scaffold analysis")
			if j.Status == "Running" {
				err = util.GenScaffold(&j)
				if err != nil {
					this.responseMsg.ErrorMsg("", nil)
					this.Data["json"] = this.responseMsg
					this.ServeJSON()
					return
				}
			}
			Scaffold_des_path := JobPath + "SUBMIT_scls.txt"
			Scaffold_stru_path := JobPath + "SUBMIT_scls_cnt.sdf"
			scaffolds, err := util.ReadScaffoldResult(Scaffold_stru_path, Scaffold_des_path)
			if err != nil {
				fmt.Println(err)
				fmt.Println("No scaffolds find.")
			}
			resultsInfo["scaffold"] = scaffolds
		}

	}

	if strings.Contains(jobType, "admet") {
		fmt.Println("Start ADMET")
		if j.Status == "Running" {
			util.ADMETPrediction(&j)
		}
		admet := util.ReadADMET(JobPath + "ADMET_Prediction_Results.csv")
		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
		resultsInfo["admet"] = admet
	}

	if strings.Contains(jobType, "alignment") {
		fmt.Println("Start alignment")

		var alignment []*models.Structure
		if j.Status == "Running" {
			util.GenerateConfAlign(&j)
			//util.Align(&j)
		}
		alignment = util.ReadAlignResult(j.JobId)
		resultsInfo["alignment"] = alignment
	}

	if strings.Contains(jobType, "drugs") {
		fmt.Println("Start drugs mapping")
		if j.Status == "Running" {
			util.DrugsComp(&j)
		}
		DrugHits_path := JobPath + "2DsimDrugs.txt"
		drugs, err := util.ReadDrugCompResult(DrugHits_path, j.JobId)
		if err != nil {
			this.responseMsg.ErrorMsg("", nil)
			this.Data["json"] = this.responseMsg
			this.ServeJSON()
			return
		}
		resultsInfo["drugs"] = drugs
	}
	if strings.Contains(jobType, "target") {
		fmt.Println("Start target and pathway mapping")
		targets, network, pathway := util.Annotation(&j)
		resultsInfo["targets"] = targets
		resultsInfo["network"] = network
		resultsInfo["pathway"] = pathway
	}

	j.Status = "success"
	j.FinishTime = time.Now()
	j.Update()
	resultsInfo["job"] = j
	this.responseMsg.SuccessMsg("", resultsInfo)
	this.Data["json"] = this.responseMsg
	this.ServeJSON()
	this.TplName = "result.html"
	fmt.Println("Success")
}
