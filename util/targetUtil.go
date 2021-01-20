package util

import (
	"bufio"
	"denovoprofiling/models"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/astaxie/beego"
)

func ReadInchiKey(fileName string) []string {
	var inchi []string
	fin, _ := os.Open(fileName)
	defer fin.Close()
	br := bufio.NewReader(fin)
	for {
		line, err := br.ReadString('\n')
		if err == io.EOF {
			break
		} else if len(line) == 0 || line == "\n" || line == "\r\n" {
			continue
		}
		line = strings.TrimSpace(line)
		inchi = append(inchi, line)
	}
	return inchi
}

func Annotation(j *models.Job) ([]*models.Mol_target, Network, []EnrichmentResult) {
	fmt.Println("Targets mapping ...")
	jobPath := beego.AppConfig.String("jobPath") + j.JobId

	inchiKeyFile := jobPath + "/query.inchikey"
	//Callobabel(j.HitsSdfile, inchiKeyFile, "", "")
	inchikeys := ReadInchiKey(inchiKeyFile)
	var ts []*models.Mol_target
	var net Network

	for i, s := range inchikeys {
		var mt models.Mol_target
		var mts []*models.Mol_target
		_, err := mt.Query().Filter("inchikey", s).Limit(10000).All(&mts)
		if err != nil {
			//panic(err)
			fmt.Println(err)
			continue
		}
		var n Node
		if len(mts) > 0 {
			n.Label = mts[0].Molchembl_id
		}
		n.Id = int64(i + 1)
		n.Group = 0
		net.Nodes = append(net.Nodes, n)
		var n1 Node
		for _, t := range mts {
			if t.Standard_relation != "=" {
				continue
			}
			if t.Organism != "Homo sapiens" {
				continue
			}
			check := 0
			for _, q := range ts {
				if q.Pref_name == t.Pref_name {
					check = 1
					break
				}
			}
			if check == 0 {
				ts = append(ts, t)

				n1.Id = t.Id
				n1.Label = t.Pref_name
				n1.Group = 1
				net.Nodes = append(net.Nodes, n1)
			}
			var e Edge
			e.From = n.Id
			e.To = n1.Id
			check = 0
			for _, eg := range net.Edges {
				if e.From == eg.From && e.To == eg.To {
					check = 1
					break
				}
			}
			if check == 0 {
				net.Edges = append(net.Edges, e)
			}
		}
	}
	res, _ := json.Marshal(net)
	if j.Status == "Running" {
		file, _ := os.Create(jobPath + "/network.json")
		defer file.Close()
		file.WriteString(string(res))
	}

	// get pathways
	fmt.Println(j.Status)
	var enrich []EnrichmentResult
	if j.Status == "success" {
		enrich = ReadEnrichmentResult(jobPath + "/list1_result.txt")
	}
	if j.Status == "Running" {
		var tids []int
		for _, s := range ts {
			check := 0
			for _, n := range tids {
				if s.Tid == n {
					check = 1
					break
				}
			}
			if check == 0 {
				tids = append(tids, s.Tid)
			}
		}
		enrich = DavaidAnalysis(tids, j.JobId)
	}
	fmt.Println("target and pathway finished")

	return ts, net, enrich
}

/*
TCMDataBank
*/

func GetTaregtsFromInChIKey() {
	fmt.Println("Targets mapping ...")
	inchiKeyFile := "/home/liuzh/go/src/chembl/data/3899042733529343479.inchi"
	inchikeys := ReadInchiKey(inchiKeyFile)
	var ts []*models.Mol_target

	for i, s := range inchikeys {
		fmt.Println(i)
		var mt models.Mol_target
		var mts []*models.Mol_target
		_, err := mt.Query().Filter("inchikey", s).Limit(10000).All(&mts)
		if err != nil {
			panic(err)
		}
		for _, t := range mts {
			if t.Standard_relation != "=" {
				continue
			}
			if t.Organism != "Homo sapiens" {
				continue
			}
			check := 0
			for _, q := range ts {
				if q.Pref_name == t.Pref_name {
					check = 1
					break
				}
			}
			if check == 0 {
				ts = append(ts, t)
			}
		}
	}

	file, _ := os.Create("/home/liuzh/go/src/chembl/data/np_targets.txt")
	defer file.Close()
	file.WriteString(string("a"))
}
