package models

import (
	"crypto/md5"
	"fmt"
	"net/url"
	"strings"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	dbhost := beego.AppConfig.String("dbhost")
	dbport := beego.AppConfig.String("dbport")
	dbuser := beego.AppConfig.String("dbuser")
	dbpassword := beego.AppConfig.String("dbpassword")
	dbname := beego.AppConfig.String("dbname")
	if dbport == "" {
		dbport = "3306"
	}
	dburl := dbuser + ":" + dbpassword + "@tcp(" + dbhost + ":" + dbport + ")/" + dbname + "?charset=utf8"
	//fmt.Printf(dburl)
	orm.RegisterDataBase("default", "mysql", dburl)

	orm.RegisterModel(new(Job))
	//orm.RegisterModel(new(ChemDB))
	//orm.RegisterModel(new(Property))
	orm.RegisterModel(new(Structure))
	//orm.RegisterModel(new(ChemDBProp))
	orm.RegisterModel(new(Prop))
	orm.RegisterModel(new(DrugBank))
	orm.RegisterModel(new(Mol_target))
	orm.RegisterModel(new(Uniprot))
	if beego.AppConfig.String("runmode") == "dev" {
		orm.Debug = true
	}
}

func Md5(buf []byte) string {
	hash := md5.New()
	hash.Write(buf)
	return fmt.Sprintf("%x", hash.Sum(nil))
}

func Rawurlencode(str string) string {
	return strings.Replace(url.QueryEscape(str), "+", "%20", -1)
}
