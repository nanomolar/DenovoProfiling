package util

import (
	"bufio"
	"denovoprofiling/models"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"
)

type ResponseMsg struct {
	State string
	Msg   string
	Data  interface{}
}

func (this *ResponseMsg) ErrorMsg(msg string, data interface{}) {
	this.State = "error"
	this.Msg = msg
	this.Data = data
}

func (this *ResponseMsg) SuccessMsg(msg string, data interface{}) {
	this.State = "success"
	this.Msg = msg
	this.Data = data
}

func SubString(str string, start int, end int) string {
	substr := []byte(str)[start:end]
	return string(substr)
}

func RandString(length int) string {
	rand.Seed(time.Now().UnixNano())
	rs := make([]string, length)
	for start := 0; start < length; start++ {
		t := rand.Intn(2)
		if t == 0 {
			rs = append(rs, strconv.Itoa(rand.Intn(10)))
		} else {
			rs = append(rs, string(rand.Intn(26)+65))
		}
		/*else {
			rs = append(rs, string(rand.Intn(26)+97))
		}*/
	}
	return strings.Join(rs, "")
}

func CreateJob(j *models.Job) {
	j.JobId = RandString(20)
	j.StartTime = time.Now()
	j.Status = "Running"
	j.Insert()
}

func ReadTXT(path string) []string {
	//path = "E:/Program/GoProject/src/list1_result.txt"
	//path = "E:/GO_WorkSpace/src/list1_result.txt"
	var str []string
	fmt.Println(path)
	file, err := os.Open(path)
	if err != nil {
		fmt.Println("Error:", err)
		return str
	}
	defer file.Close()

	br := bufio.NewReader(file)
	var bytes []byte
	//bytes, _, err = br.ReadLine()
	for {
		bytes, _, err = br.ReadLine()
		if err != nil {
			fmt.Println(err)
			break
		}
		str = append(str, string(bytes))

	}
	return str
}

// read file return string
func read(path string) string {
	fi, err := os.Open(path)
	if err != nil {
		panic(err)
	}

	defer fi.Close()
	fd, err := ioutil.ReadAll(fi)
	if err != nil {
		panic(err)
	}
	return string(fd)
}

func FileSize(file string) (int64, error) {
	f, e := os.Stat(file)
	if e != nil {
		return 0, e
	}
	return f.Size(), nil
}
