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

func ReadAlignResult(jobid string) []*models.Structure {
	path := beego.AppConfig.String("jobPath") + jobid + "/out_Aligned.sd"
	//path := "E:/Program/Go/src/chemprofiling/xx_Aligned.sd"
	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer f.Close()

	br := bufio.NewReader(f)
	var mols []*models.Structure
	var mol models.Structure
	_, err = mol.Query().Filter("job_id", jobid).All(&mols)

	if err != nil {
		fmt.Println(err)
		panic(err)
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
		mols[cnt].Mol = mol
		cnt++
		for {
			line, err := br.ReadString('\n')
			checkErr(err)
			if strings.Contains(line, "$$$$") {
				break
			}
		}
	}
	return mols

}
