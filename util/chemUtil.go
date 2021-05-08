package util

import (
	"bufio"
	"denovoprofiling/models"
	"encoding/csv"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"sort"
	"strconv"
        "time"
	"strings"

	"github.com/astaxie/beego"
)

func SDfileToChemDB(SDfile string, JobId string) (int64, error) {
	file, err := os.Open(SDfile)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	var strucCnt int64
	var str string
	var bytes []byte
	sdReader := bufio.NewReader(file)
	for {
		// read one structure
		/*
		** insert structure first and get Id.
		** Then use Id as the first line in Mol data
		** The original molName will be saved to property "MolName"
		 */
		var structure models.Structure
		structure.MolName = "init"
		structure.Mol = "init"
		structure.JobId = JobId

		var mol string
		var molName string
		// read molecular name
		bytes, _, err = sdReader.ReadLine()
		str = string(bytes)
		if err != nil {
			if err == io.EOF {
				return strucCnt, nil
			} else {
				return strucCnt, err
			}
		}

		if molName = str; molName == "" {
			molName = fmt.Sprintf("%d", strucCnt+1)
		}
		//mol = fmt.Sprintf("%d\n", structure.Id) // Id as the first line in Mol data
		mol = fmt.Sprintf("%d\n", strucCnt) // Id as the first line in Mol data
		// read mol data
		for {
			bytes, _, err = sdReader.ReadLine()
			str = string(bytes)
			if err != nil {
				if err == io.EOF {
					return strucCnt, nil
				} else {
					return strucCnt, err
				}
			}
			//str = strings.TrimSpace(str)
			mol += str + "\n"
			// make it right for win(\r\n) or linux(\n)
			if str == "M  END" {
				break
			}
		}
		structure.MolName = molName
		structure.Mol = mol
		structure.JobId = JobId
		err = structure.Insert()
		if err != nil {
			// go to "$$$$"
			for {
				bytes, _, err = sdReader.ReadLine()
				str = string(bytes)
				if err != nil {
					if err == io.EOF {
						return strucCnt, nil
					} else {
						return strucCnt, err
					}
				}
				// make it right for win(\r\n) or linux(\n)
				if str == "$$$$" {
					break
				}
			}
			// continue to read next molecule
			continue
		}

		// read property
		for {
			bytes, _, err = sdReader.ReadLine()
			str = string(bytes)
			if str == "$$$$" {
				break
			}
		}

		strucCnt++
	}
	return strucCnt, nil
}

func Callobabel(ifile, ofile, parm1, parm2 string) bool {
	cmd := exec.Command("obabel", ifile, "-O", ofile, parm1, parm2)
	_, err := cmd.Output()
	if err != nil {
		fmt.Println("Fail to call obabel")
		fmt.Println(err)
		return false
	}

	fs, _ := FileSize(ofile)

	if fs == 0 {
		fmt.Println("0 molecules converted")
		return false
	}
	return true
}

func PubchemMapping(ifile, ofile string) bool {
	fmt.Println("Start to pubchem mapping ...")
	PubChemMapping := beego.AppConfig.String("PubChemMapping")
	cmd := exec.Command("python", PubChemMapping, "--input-file", ifile, "--save-file", ofile)
	_, err := cmd.Output()
	if err != nil {
		fmt.Println("Fail to call PubChemMapping")
		fmt.Println(err)
		return false
	}
	fmt.Println("Finished pubchem mapping ")
	return true

}

func ReadPubchemMapResult1(filename, jobid string) {
	//filename = "/home/liuzh/project/database/mappingChemDB/denovo500-3.csv"
	fmt.Println("Start to read  pubchem mapping results")
	ofile, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error:", err)
	}
	defer ofile.Close()

	reader := csv.NewReader(ofile)
	reader.Comma = ','
	record, err := reader.Read()
	for {
		record, err = reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("Error:", err)
			continue
		}
		inchikey := record[1]
		cid := record[0]
		var m models.Structure
		var ms []models.Structure
		_, err = m.Query().Filter("job_id", jobid).Filter("inchikey", inchikey).All(&ms)

		if err == nil {
			for i, _ := range ms {
				var ma models.Structure
				ma = ms[i]
				ma.Cid = cid
				err = ma.Update()
				if err != nil {
					fmt.Println(err)
					panic(err)
				}
			}
		}
	}
	fmt.Println("Finished pubchem mapping results")
}

func ReadPubchemMapResult(jobid string) {

	fmt.Println("Start to read  pubchem mapping results")
	folder := beego.AppConfig.String("jobPath") + jobid
	files, _ := ioutil.ReadDir(folder)
	for _, file := range files {
		fmt.Println(folder + "/" + file.Name())
		if !strings.Contains(file.Name(), "pubchem_mapped") {
			continue
		}
		ofile, err := os.Open(folder + "/" + file.Name())
		if err != nil {
			fmt.Println("Error:", err)
		}
		defer ofile.Close()

		reader := csv.NewReader(ofile)
		reader.Comma = ','
		record, err := reader.Read()
		for {
			record, err = reader.Read()
			if err == io.EOF {
				break
			} else if err != nil {
				fmt.Println("Error:", err)
				continue
			}
			inchikey := record[1]
			cid := record[0]
			var m models.Structure
			var ms []models.Structure
			_, err = m.Query().Filter("job_id", jobid).Filter("inchikey", inchikey).All(&ms)

			if err == nil {
				for i, _ := range ms {
					var ma models.Structure
					ma = ms[i]
					ma.Cid = cid
					err = ma.Update()
					if err != nil {
						fmt.Println(err)
					}
				}
			}
		}
	}
	fmt.Println("Finished pubchem mapping results")
}

func GenInchiKey(folder string, molFileName string, mol string) string {
	inchiFile := folder + "/" + molFileName + ".inchikey"
	molFile := folder + "/" + molFileName + ".mol"
	os.MkdirAll(folder, os.ModeDir)
	fi, _ := os.Create(molFile)
	defer fi.Close()
	fi.WriteString(mol)

	cmd := exec.Command("obabel", molFile, "-O", inchiFile)
	buf, err := cmd.Output()
	if err != nil {
		return ""
	}
	fmt.Fprintf(os.Stdout, "%s", buf)
	inchiByte, _ := ioutil.ReadFile(inchiFile)
	inchikey := strings.TrimRight(string(inchiByte), "\n")
	inchikey = strings.TrimRight(inchikey, "\r")
	return inchikey
}

/*
** folder: the folder cantains the mol file which will be used to search database
** molFileName:  name of mol file, do not contain the extension name
** chemID: the ID of chemical database
 */
func ExactSearch(folder string, molFileName string, chemDBId int64) *models.Structure {
	fmt.Println("ExactSearch: " + molFileName)
	inchiFile := folder + "/" + molFileName + ".inchikey"
	molFile := folder + "/" + molFileName + ".mol"
	cmd := exec.Command("obabel", molFile, "-O", inchiFile)
	buf, err := cmd.Output()
	if err != nil {
		return nil
	}
	fmt.Fprintf(os.Stdout, "%s", buf)
	inchiByte, _ := ioutil.ReadFile(inchiFile)
	inchikey := strings.TrimRight(string(inchiByte), "\n")
	inchikey = strings.TrimRight(inchikey, "\r")
	fmt.Println(inchikey)

	var mol models.Structure
	err = mol.Query().Filter("ChemId", chemDBId).Filter("Inchi", inchikey).One(&mol)
	if err != nil {
		return nil
	}
	return &mol
}

/*
** return the 'txt' result file path of subSearch
** subSearchEXE : full path of executable file
** library :  the SD file of compound library
** query   : full path of the query mol file
** resFolder
 */
func SubSearch(subSearchEXE string, library string, query string, resFolder string) (string, error) {
	hitsTXT := resFolder + "/res.txt"
	//cmd4 := exec.Command("EXE/subsearch.exe", "query/allScaffolds.sdf", molFile, hitsTXT, maxhits)
	maxhits := "100"
	cmd4 := exec.Command(subSearchEXE, library, query, hitsTXT, maxhits)
	_, err := cmd4.Output()
	if err != nil {
		fmt.Println("Fail to call subsearch.exe")
		return "", err
	}
	//fmt.Fprintf(os.Stdout, "%s", buf3)
	return hitsTXT, nil
}

func ReadSubSearchRes(hitsTXT string) []string {
	file, err := os.Open(hitsTXT)
	if err != nil {
		panic(err)
		return nil
	}
	defer file.Close()
	var hits []string
	bytes, _ := ioutil.ReadAll(file)
	if len(bytes) == 0 {
		return hits
	}
	if bytes[len(bytes)-1] == ',' {
		bytes = bytes[0 : len(bytes)-1]
	}
	str := string(bytes)
	//fmt.Println(line)
	hits = strings.Split(strings.TrimSpace(str), ",")
	fmt.Println(hits)
	return hits
}

type SimSearchRes struct {
	MolName  string  // structure name (must be unique)
	SimValue float64 // similarity value
}

/*
** define sort method for SimSearchRes
** sort method:  Len, Less, Swap
 */
type SimSearchResArray []*SimSearchRes

func (list SimSearchResArray) Len() int {
	return len(list)
}

// by descent
func (list SimSearchResArray) Less(i, j int) bool {
	if list[i].SimValue < list[j].SimValue {
		return false
	} else if list[i].SimValue > list[j].SimValue {
		return true
	}
	return false
}

func (list SimSearchResArray) Swap(i, j int) {
	var temp *SimSearchRes = list[i]
	list[i] = list[j]
	list[j] = temp
}

/*
** return the 'txt' result file path of simSearch
** simSearchEXE : full path of executable file
** library :  the SD file of compound library
** query   : full path of the query mol file
** resFolder : full path of directory of result file
 */
func SimSearch(simSearchEXE, library, query, resFolder, maxhits, threshold string) (string, error) {
	hitsTXT := resFolder + "/res.txt"
	cmd4 := exec.Command(simSearchEXE, library, query, "1", threshold, hitsTXT, maxhits)
	_, err := cmd4.Output()
	if err != nil {
		fmt.Println("Fail to call simsearch.exe")
		return "", err
	}
	//fmt.Fprintf(os.Stdout, "%s", buf3)

	return hitsTXT, nil
}

func ReadSimHits(hitsTXT string) []*SimSearchRes {
	file, err := os.Open(hitsTXT)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	br := bufio.NewReader(file)
	var bytes []byte
	var hitList SimSearchResArray
	//top, _ := strconv.ParseInt(max, 10, 64)
	for {
		bytes, _, err = br.ReadLine()
		str := string(bytes)
		if err != nil {
			fmt.Println(err)
			break
		}
		//fmt.Println(line)
		tmp := strings.Split(str, "\t")
		if len(tmp) != 2 {
			continue
		}
		var hit SimSearchRes
		hit.MolName = strings.TrimSpace(tmp[0])
		//fmt.Printf("%s\t%s\n", tmp[0], tmp[1])
		hit.SimValue, _ = strconv.ParseFloat(strings.TrimSpace(tmp[1]), 64)
		//fmt.Printf("%f\n",simvalue)
		//hit.Simvalue  = str[1]
		hitList = append(hitList, &hit)
	}
	sort.Sort(hitList)
	return hitList
}

func DrugBankToDatabase(SDFile string) (int64, error) {
	fmt.Println("Loading Drugbank")
	file, err := os.Open(SDFile)
	if err != nil {
		fmt.Println(err)
		return 0, err
	}
	defer file.Close()

	var strucCnt int64
	var str string
	var bytes []byte
	sdReader := bufio.NewReader(file)
	for {
		// read one structure
		var mol string
		var molName string
		// read molecular name
		bytes, _, err = sdReader.ReadLine()
		str = string(bytes)
		if err != nil {
			if err == io.EOF {
				return strucCnt, nil
			} else {
				return strucCnt, err
			}
		}
		if molName = str; molName == "" {
			molName = "noname"
		}
		mol += molName + "\n"

		// read mol data
		for {
			bytes, _, err = sdReader.ReadLine()
			str = string(bytes)
			if err != nil {
				if err == io.EOF {
					return strucCnt, nil
				} else {
					return strucCnt, err
				}
			}
			//str = strings.TrimSpace(str)
			mol += str + "\n"
			// make it right for win(\r\n) or linux(\n)
			if str == "M  END" {
				break
			}
		}
		var drugbank models.DrugBank
		drugbank.MolName = molName
		drugbank.Mol = mol

		// generate inchikey for molecule
		//zinc.Inchi = GenInchiKey(tmpFolder, molName, mol)

		if err != nil {
			// go to "$$$$"
			for {
				bytes, _, err = sdReader.ReadLine()
				str = string(bytes)
				if err != nil {
					if err == io.EOF {
						return strucCnt, nil
					} else {
						return strucCnt, err
					}
				}
				// make it right for win(\r\n) or linux(\n)
				if str == "$$$$" {
					break
				}
			}
			// continue to read next molecule
			continue
		}

		// read property, need to do ...

		// go to "$$$$"
		for {
			bytes, _, err = sdReader.ReadLine()
			str = string(bytes)
			if err != nil {
				if err == io.EOF {
					return strucCnt, nil
				} else {
					return strucCnt, err
				}
			}
			if strings.Contains(str, "DRUGBANK_ID") {
				bytes, _, err = sdReader.ReadLine()
				str = string(bytes)
				drugbank.DrugbankId = str
				fmt.Println(str)
			}
			if strings.Contains(str, "COMMON_NAME") {
				bytes, _, err = sdReader.ReadLine()
				str = string(bytes)
				drugbank.CommonName = str
				fmt.Println(str)
			}
			if strings.Contains(str, "CAS_NUMBER") {
				bytes, _, err = sdReader.ReadLine()
				str = string(bytes)
				drugbank.CasNumber = str
				fmt.Println(str)
			}
			// make it right for win(\r\n) or linux(\n)
			if str == "$$$$" {
				break
			}
		}
		err = drugbank.Insert()
		checkErr(err)
		strucCnt++
	}
	fmt.Println(strucCnt)
	return strucCnt, nil
}


// delete submitted structures over 15 days
func CleanJob() {
	fmt.Println("Start to clean Job")
	var jobs []models.Job
	var job models.Job
	t := time.Now().AddDate(0, 0, -15)
	fmt.Println(t)
	_, err := job.Query().Filter("finish_time__lt", t).All(&jobs)
	if err != nil {
		fmt.Println(err)
	}
	for _, j := range jobs {
		fmt.Println(j.JobId)
		fmt.Println(j.FinishTime)
		var m models.Structure
		var ms []models.Structure
		_, err := m.Query().Filter("job_id", j.JobId).All(&ms)
		if err != nil {
			fmt.Println(err)
		}
		for i, _ := range ms {
			ms[i].Delete()
		}
	}
}

