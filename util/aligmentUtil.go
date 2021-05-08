package util

import (
	"bufio"
	"denovoprofiling/models"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/astaxie/beego"
)

func Align(j *models.Job) {
	fmt.Println("Alignment ...")
	// Get first mol as query mol
	var str models.Structure
	err := str.Query().Filter("job_id", j.JobId).One(&str)
	if err != nil {
		panic(err)
	}
	jobPath := beego.AppConfig.String("jobPath") + j.JobId
	queryMolFile := jobPath + "/First.mol"
	file, err := os.Create(queryMolFile)
	defer file.Close()
	file.WriteString(str.Mol)

	Sim3DSearchEXE := beego.AppConfig.String("Alignment")
	hitsSDF := jobPath + "/out.sd"
	cmd4 := exec.Command(Sim3DSearchEXE, "-sd", j.HitsSdfile, "-qsd", queryMolFile, "-outsd", hitsSDF, "-M", "0", "-ST", "0.0", "-CC", "true")
	_, err = cmd4.Output()
	if err != nil {
		fmt.Println("Fail to call wega program")
	}
	//fmt.Fprintf(os.Stdout, "%s", buf3)
}

func GenerateConfAlign(j *models.Job) {

	fmt.Println("Generate confor ...")

	// obabel diverse50.sdf -O diverse50-conf-200-1.sdf --confab --conf 200
	ifile := beego.AppConfig.String("jobPath") + j.JobId + "/SUBMIT.SDF"
	conffile := beego.AppConfig.String("jobPath") + j.JobId + "/conf.SDF"
	cmd := exec.Command("obabel", ifile, "-O", conffile, "--gen3D")
	//cmd := exec.Command("obabel", ifile, "-O", conffile, "--confab", "--conf", "200")
	_, err := cmd.Output()
	if err != nil {
		fmt.Println("Fail to call obabel to generate conf")
		fmt.Println(err)
	}

	// Get first mol as query mol

	//obabel diverse50-conf-200-1.sdf -O 11.sdf -f 1 -l 1
	ifile = beego.AppConfig.String("jobPath") + j.JobId + "/conf.SDF"
	firstmolfile := beego.AppConfig.String("jobPath") + j.JobId + "/First.SDF"
	cmd = exec.Command("obabel", ifile, "-O", firstmolfile, "-f", "1", "-l", "1")
	_, err = cmd.Output()
	if err != nil {
		fmt.Println("Fail to call obabel to get first conf")
		fmt.Println(err)
	}

	Sim3DSearchEXE := beego.AppConfig.String("Alignment")
	hitsSDF := beego.AppConfig.String("jobPath") + j.JobId + "/out.sdf"
	aligntype := ""
	if j.AlignType == "shape" {
		aligntype = "0"
	} else if j.AlignType == "pharmacophore" {
		aligntype = "1"
	} else {
		aligntype = "2"
	}
	cmd4 := exec.Command(Sim3DSearchEXE, "-sd", conffile, "-qsd", firstmolfile, "-outsd", hitsSDF, "-M", aligntype, "-ST", "0.0", "-CC", "true")
	_, err = cmd4.Output()
	if err != nil {
		fmt.Println("Fail to call wega program")
	}
	//fmt.Fprintf(os.Stdout, "%s", buf3)
}

func ReadAlignResult(jobid string) []*models.Structure {
	fmt.Println("Read confor ...")
	var mols []*models.Structure
	var mol models.Structure

	path := beego.AppConfig.String("jobPath") + jobid + "/out_Aligned.sd"
	//path := "E:/Program/Go/src/chemprofiling/xx_Aligned.sd"
	f, err := os.Open(path)
	if err != nil {
		fmt.Println("error read aligned files")
		return mols
	}
	defer f.Close()

	br := bufio.NewReader(f)

	_, err = mol.Query().Filter("job_id", jobid).All(&mols)

	if err != nil {
		fmt.Println(err)
		return mols
	}
	cnt := 0
	for {
		line, err := br.ReadString('\n')
		if err == io.EOF {
			break
		}
		var mol string
		mol += line
		// read mol infor
		for {
			line, err := br.ReadString('\n')
			if err == io.EOF {
				break
			}
			if strings.Contains(line, "END") {
				mol += line
				break
			}
			mol += line
		}
		for {
			line, err := br.ReadString('\n')
			checkErr(err)
			if strings.Contains(line, "$$$$") {
				break
			}
		}

		if cnt == 0 {
			cnt++
			continue
		}
		mols[cnt-1].Mol = mol
		cnt++
	}
	return mols

}
