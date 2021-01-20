package util

import (
	"denovoprofiling/models"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sortutil"
	"strconv"

	"github.com/astaxie/beego"
)

type DrugHits struct {
	DrugbankId   string
	Sim          float64
	QueryName    string
	DrugMol      string
	ReferenceMol string
	ReferenceId  string
	CasNumber    string
	CommonName   string
}

func DrugsComp(j *models.Job) error {
	fmt.Println("Start to calculate Drugs similarity  ...")
	sim2DEXE := beego.AppConfig.String("2DsimSearchEXE")
	drugSDFile := beego.AppConfig.String("DrugSDFile")

	jobIDPath := beego.AppConfig.String("jobPath") + j.JobId
	hitsFile := jobIDPath + "/2DsimDrugs.txt"

	cmd := exec.Command(sim2DEXE, drugSDFile, j.HitsSdfile, "1", "0.5", hitsFile, "100000")
	_, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call 2D similarity search exe")
		return err
	}
	return nil

}

func ReadDrugCompResult(path, jobid string) ([]DrugHits, error) {
	fmt.Println("Start read similar drug results")
	var drugs []DrugHits

	file, err := os.Open(path)
	if err != nil {
		fmt.Println("Error:", err)
		return drugs, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = '\t'

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("Error:", err)
			return drugs, err
		}
		var d DrugHits
		d.DrugbankId = record[0]
		d.Sim, _ = strconv.ParseFloat(record[1], 64)
		d.QueryName = record[2]
		d.ReferenceId = record[3]
		drugs = append(drugs, d)
	}

	for i, s := range drugs {
		var d models.DrugBank
		err = d.Query().Filter("drugbank_id", s.DrugbankId).One(&d)
		checkErr(err)

		drugs[i].DrugMol = d.Mol
		drugs[i].CasNumber = d.CasNumber
		drugs[i].CommonName = d.CommonName
	}
	sortutil.DescByField(drugs, "Sim")
	fmt.Println("Fnished read similar drug results")
	return drugs, nil

}
