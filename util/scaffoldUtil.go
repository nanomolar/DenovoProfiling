package util

import (
	"bufio"
	"denovoprofiling/models"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sortutil"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

type Scaffold struct {
	Mol     string
	Cid     int64
	Count   int64
	MolList []int64
	MolName []string
}

func checkErr(err error) {
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
}

func GenScaffold(j *models.Job) error {
	fmt.Println("Scaffold genarating ...")
	ScaffoldEXE := beego.AppConfig.String("sclusterEXE")
	cmd := exec.Command(ScaffoldEXE, j.HitsSdfile, "n", "3", "n", "0&")
	_, err := cmd.Output()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Fail to call scaffold exe")
		return err
	}
	return nil
}

func ReadScaffoldResult(sdfile, scafile string) ([]Scaffold, error) {
	fmt.Println("Start Read Scaffold results ...")
	var scaf []Scaffold
	file, err := os.Open(sdfile)
	if err != nil {
		return scaf, err
	}
	defer file.Close()

	br := bufio.NewReader(file)
	var s Scaffold
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
			checkErr(err)
			if strings.Contains(line, "END") {
				mol += line
				break
			}
			mol += line
		}
		s.Mol = mol
		// read scaffold ID and frequency
		for {
			line, err := br.ReadString('\n')
			checkErr(err)
			if strings.Contains(line, "$$$$") {
				break
			} else if strings.Contains(line, ">  <COMPOUND_CODE>") {
				line, err := br.ReadString('\n')
				checkErr(err)
				id, err := strconv.ParseInt(strings.TrimSpace(line), 10, 64)
				checkErr(err)
				s.Cid = id
			} else if strings.Contains(line, ">  <EID>") {
				line, err := br.ReadString('\n')
				cnt, err := strconv.ParseInt(strings.TrimSpace(line), 10, 64)
				checkErr(err)
				s.Count = int64(cnt)
			}
		}
		scaf = append(scaf, s)
	}

	ofile, err := os.Open(scafile)
	if err != nil {
		fmt.Println("Error:", err)
		return scaf, err
	}
	defer file.Close()

	reader := csv.NewReader(ofile)
	reader.Comma = '\t'
	record, err := reader.Read()
	var index int64
	for {
		record, err = reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("Error:", err)
			return scaf, err
		}

		//MolWeight_ := strconv.FormatFloat(record[15], 'f', 2, 64)
		index++
		cid, _ := strconv.ParseInt(record[3], 10, 64)

		//fmt.Println(cid)
		if cid < 1 {
			continue
		}
		scaf[cid-1].MolList = append(scaf[cid-1].MolList, index)
		scaf[cid-1].MolName = append(scaf[cid-1].MolName, record[0])
		//fmt.Println(record) // record has the type []string
	}
	sortutil.DescByField(scaf, "Count")
	fmt.Println("Finished Read Scaffold results ...")
	return scaf, nil
}
