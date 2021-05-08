package util

import (
	"denovoprofiling/models"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

func CalFingerprints(j *models.Job) {
	fmt.Println("Fingerprint calculating ...")
	PaDELEXE := beego.AppConfig.String("PaDEL")
	jobIDPath := beego.AppConfig.String("jobPath") + j.JobId
	fpFile := jobIDPath + "/fp.csv"
	fpXML := ""
	if j.FpType == "maccs" {
		fpXML = beego.AppConfig.String("MACCSFingerprintXML")
	} else if j.FpType == "pubchem" {
		fpXML = beego.AppConfig.String("PUBCHEMFingerprintXML")
	}

	cmd := exec.Command("java", "-jar", PaDELEXE, "-dir", j.HitsSdfile, "-file", fpFile, "-fingerprints", "-2d", "-descriptortypes", fpXML, "-removesalt", "-retainorder")
	_, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call PaDEL")
	}
}

func CalDistance(j *models.Job) {
	fmt.Println("Distance matrix calculating ...")

	jobIDPath := beego.AppConfig.String("jobPath") + j.JobId
	fpFile := jobIDPath + "/fp.csv"
	check, _ := PathExists(fpFile)
	if !check {
		CalFingerprints(j)
	}

	// generate a R script and run, generate the distance matrix file

	scriptContent := read(beego.AppConfig.String("CalDistanceRScript"))

	distanceFile := jobIDPath + "/distance.csv"
	//fmt.Println(scriptContent)
	scriptContent = strings.Replace(scriptContent, "fpCSVfile", fpFile, -1)
	scriptContent = strings.Replace(scriptContent, "distanceCSVFile", distanceFile, -1)

	RscriptPath := jobIDPath + "/distance_script.R"
	fo, _ := os.Create(RscriptPath)
	_, err := fo.WriteString(scriptContent)

	if err != nil {
		fmt.Println(err)
		//panic(err)
	}
	fo.Close()

	cmd := exec.Command("Rscript", RscriptPath)
	_, err = cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call R")
	}
}

func GenDescriptors(j *models.Job) error {
	fmt.Println("Descriptors calculation ...")

	PaDELEXE := beego.AppConfig.String("PaDEL")
	jobIDPath := beego.AppConfig.String("jobPath") + j.JobId
	resultFile := jobIDPath + "/des.csv"
	desXML := beego.AppConfig.String("DescriptorsXML")
	cmd := exec.Command("java", "-jar", PaDELEXE, "-dir", j.HitsSdfile, "-file", resultFile, "-2d", "-fingerprints", "-descriptortypes", desXML, "-removesalt", "-retainorder")
	_, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call PaDEL")
		return err
	}
	return nil
}

func ReadDescriptorsFile(despath string) []models.Prop {
	fmt.Println("Start read descriptors file ...")
	var ps []models.Prop

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

		var p models.Prop
		p.MolName = record[0]
		p.MolWeight, _ = strconv.ParseFloat(record[12], 64)
		p.Hba, _ = strconv.ParseInt(record[7], 10, 64)
		p.Hbd, _ = strconv.ParseInt(record[9], 10, 64)
		p.Alogp, _ = strconv.ParseFloat(record[1], 64)
		p.RotBonds, _ = strconv.ParseFloat(record[10], 64)
		p.Tpsa, _ = strconv.ParseFloat(record[11], 64)

		p.MolWeight, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.MolWeight), 64)
		p.Alogp, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Alogp), 64)
		p.Tpsa, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", p.Tpsa), 64)
		ps = append(ps, p)
	}
	fmt.Println("Finished read descriptors file ...")
	return ps

}

type Descriptors struct {
	MolWeight []float64
	Hba       []int64
	Hbd       []int64
	Alogp     []float64
	RotBonds  []float64
	Tpsa      []float64
}

func GetDescriptor(despath string) (Descriptors, error) {
	var Des Descriptors

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

		MolWeight, _ := strconv.ParseFloat(record[12], 64)
		Hba, _ := strconv.ParseInt(record[7], 10, 64)
		Hbd, _ := strconv.ParseInt(record[9], 10, 64)
		Alogp, _ := strconv.ParseFloat(record[1], 64)
		RotBonds, _ := strconv.ParseFloat(record[10], 64)
		Tpsa, _ := strconv.ParseFloat(record[11], 64)

		MolWeight, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", MolWeight), 64)
		Alogp, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", Alogp), 64)
		Tpsa, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", Tpsa), 64)

		Des.MolWeight = append(Des.MolWeight, MolWeight)
		Des.Hba = append(Des.Hba, Hba)
		Des.Hbd = append(Des.Hbd, Hbd)
		Des.Alogp = append(Des.Alogp, Alogp)
		Des.RotBonds = append(Des.RotBonds, RotBonds)
		Des.Tpsa = append(Des.Tpsa, Tpsa)

	}
	return Des, nil

}

func CalPCA(j *models.Job) {
	fmt.Println("PCA Calculating ...")
	jobIDPath := beego.AppConfig.String("jobPath") + j.JobId

	fpFile := jobIDPath + "/fp.csv"
	check, _ := PathExists(fpFile)
	if !check {
		CalFingerprints(j)
	}
	// generate a R script and run, generate the distance matrix file

	scriptContent := read(beego.AppConfig.String("calPCARScript"))

	pcaFile := jobIDPath + "/pca.csv"
	//fmt.Println(scriptContent)
	scriptContent = strings.Replace(scriptContent, "fpCSVfile", fpFile, -1)
	scriptContent = strings.Replace(scriptContent, "pcaCSVfile", pcaFile, -1)

	RscriptPath := jobIDPath + "/pca_script.R"
	fo, _ := os.Create(RscriptPath)
	_, err := fo.WriteString(scriptContent)

	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	fo.Close()

	cmd := exec.Command("Rscript", RscriptPath)

	_, err = cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call PCA R script")
	}
}
