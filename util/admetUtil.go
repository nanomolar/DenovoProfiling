package util

import (
	"denovoprofiling/models"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"

	"github.com/astaxie/beego"
)

func ADMETPrediction(j *models.Job) error {
	fmt.Println("ADMET Prediction ...")

	ADMETEXE := beego.AppConfig.String("ADMETPredictor")
	ModelPath := beego.AppConfig.String("ModelPath")
	jobIDPath := beego.AppConfig.String("jobPath") + j.JobId
	resultFile := jobIDPath + "/ADMET_Prediction_Results.csv"
	smilesFile := jobIDPath + "/SUBMIT.SMI"
	// generate cannonical smiles
	check, err := PathExists(smilesFile)
	if !check {
		smilesFile = jobIDPath + "/SUBMIT.can"
		Callobabel(j.HitsSdfile, smilesFile, "", "")
	}

	//python models.py --test-file mce_.smi --models-dir models/ --save-file Pred_Results-4.csv --add-header True
	cmd := exec.Command("python", ADMETEXE, "--test-file", smilesFile, "--models-dir", ModelPath, "--save-file", resultFile, "--add-header", "True")
	_, err = cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call ADMETPredictor")
		return err
	}
	return nil
}

type ADMETDescriptors struct {
	Caco2               []float64
	Pgp_Inhibitors      []float64
	Pgp_Substrates      []float64
	Biodegradability    []float64
	CYP1A2              []float64
	CYP2C9              []float64
	CYP2C19             []float64
	CYP2D6              []float64
	CYP3A4              []float64
	Carcinogenic        []float64
	HERG                []float64
	Liver_Toxicity      []float64
	Acute_Oral_Toxicity []float64
}

type ADMET struct {
	Caco2               float64
	Pgp_Inhibitors      float64
	Pgp_Substrates      float64
	Biodegradability    float64
	CYP1A2              float64
	CYP2C9              float64
	CYP2C19             float64
	CYP2D6              float64
	CYP3A4              float64
	Carcinogenic        float64
	HERG                float64
	Liver_Toxicity      float64
	Acute_Oral_Toxicity float64
}

func ReadADMET(despath string) []ADMET {
	fmt.Println("Start read ADMET file ...")
	var ps []ADMET

	file, err := os.Open(despath)
	if err != nil {
		fmt.Println("Error:", err)
		return ps
	}
	defer file.Close()
	reader := csv.NewReader(file)
	_, err = reader.Read()
	if err != nil {
		fmt.Println("Error:", err)
		return ps
	}
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("Error:", err)
			return ps
		}

		var p ADMET
		p.Caco2, _ = strconv.ParseFloat(record[1], 64)
		p.Pgp_Inhibitors, _ = strconv.ParseFloat(record[2], 64)
		p.Pgp_Substrates, _ = strconv.ParseFloat(record[3], 64)
		p.Biodegradability, _ = strconv.ParseFloat(record[4], 64)
		p.CYP1A2, _ = strconv.ParseFloat(record[5], 64)
		p.CYP2C19, _ = strconv.ParseFloat(record[6], 64)
		p.CYP2C9, _ = strconv.ParseFloat(record[7], 64)
		p.CYP2D6, _ = strconv.ParseFloat(record[8], 64)
		p.CYP3A4, _ = strconv.ParseFloat(record[9], 64)
		p.Carcinogenic, _ = strconv.ParseFloat(record[10], 64)
		p.HERG, _ = strconv.ParseFloat(record[11], 64)
		p.Liver_Toxicity, _ = strconv.ParseFloat(record[12], 64)
		p.Acute_Oral_Toxicity, _ = strconv.ParseFloat(record[13], 64)

		p.Caco2, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Caco2), 64)
		p.Pgp_Inhibitors, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Pgp_Inhibitors), 64)
		p.Pgp_Substrates, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Pgp_Substrates), 64)
		p.Biodegradability, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Biodegradability), 64)
		p.CYP1A2, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.CYP1A2), 64)
		p.CYP2C19, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.CYP2C19), 64)
		p.CYP2C9, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.CYP2C9), 64)
		p.CYP2D6, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.CYP2D6), 64)
		p.CYP3A4, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.CYP3A4), 64)
		p.Carcinogenic, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Carcinogenic), 64)
		p.HERG, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.HERG), 64)
		p.Liver_Toxicity, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Liver_Toxicity), 64)
		p.Acute_Oral_Toxicity, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Acute_Oral_Toxicity), 64)

		ps = append(ps, p)
	}
	fmt.Println("Finished read ADMET file ...")
	return ps

}

func ReadADMETPrediction(despath string) (ADMETDescriptors, error) {
	var Des ADMETDescriptors

	file, err := os.Open(despath)
	if err != nil {
		fmt.Println("Error:", err)
		return Des, err
	}
	defer file.Close()
	reader := csv.NewReader(file)
	record, err := reader.Read()

	for {
		record, err = reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("Error:", err)
			return Des, err
		}

		Caco2, _ := strconv.ParseFloat(record[1], 64)
		Pgp_Inhibitors, _ := strconv.ParseFloat(record[2], 64)
		Pgp_Substrates, _ := strconv.ParseFloat(record[3], 64)
		Biodegradability, _ := strconv.ParseFloat(record[4], 64)
		CYP1A2, _ := strconv.ParseFloat(record[5], 64)
		CYP2C19, _ := strconv.ParseFloat(record[6], 64)
		CYP2C9, _ := strconv.ParseFloat(record[7], 64)
		CYP2D6, _ := strconv.ParseFloat(record[8], 64)
		CYP3A4, _ := strconv.ParseFloat(record[9], 64)
		Carcinogenic, _ := strconv.ParseFloat(record[10], 64)
		HERG, _ := strconv.ParseFloat(record[11], 64)
		Liver_Toxicity, _ := strconv.ParseFloat(record[12], 64)
		Acute_Oral_Toxicity, _ := strconv.ParseFloat(record[13], 64)

		Des.Caco2 = append(Des.Caco2, Caco2)
		Des.Pgp_Inhibitors = append(Des.Pgp_Inhibitors, Pgp_Inhibitors)
		Des.Pgp_Substrates = append(Des.Pgp_Substrates, Pgp_Substrates)
		Des.Biodegradability = append(Des.Biodegradability, Biodegradability)
		Des.CYP1A2 = append(Des.CYP1A2, CYP1A2)
		Des.CYP2C19 = append(Des.CYP2C19, CYP2C19)
		Des.CYP2C9 = append(Des.CYP2C9, CYP2C9)
		Des.CYP2D6 = append(Des.CYP2D6, CYP2D6)
		Des.CYP3A4 = append(Des.CYP3A4, CYP3A4)
		Des.Carcinogenic = append(Des.Carcinogenic, Carcinogenic)
		Des.HERG = append(Des.HERG, HERG)
		Des.Liver_Toxicity = append(Des.Liver_Toxicity, Liver_Toxicity)
		Des.Acute_Oral_Toxicity = append(Des.Acute_Oral_Toxicity, Acute_Oral_Toxicity)

	}
	return Des, nil

}
