package models

import (
	"github.com/astaxie/beego/orm"
)

type DrugBank struct {
	Id         int64
	MolName    string
	DrugbankId string
	Mol        string
	CommonName string
	CasNumber  string
	//Inchi      string
}

func (m *DrugBank) TableName() string {
	return "drugbank"
}

func (m *DrugBank) Insert() error {
	if _, err := orm.NewOrm().Insert(m); err != nil {
		return err
	}
	return nil
}

func (m *DrugBank) Read(fields ...string) error {
	if err := orm.NewOrm().Read(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *DrugBank) Update(fields ...string) error {
	if _, err := orm.NewOrm().Update(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *DrugBank) Delete() error {
	if _, err := orm.NewOrm().Delete(m); err != nil {
		return err
	}
	return nil
}

func (m *DrugBank) Query() orm.QuerySeter {
	return orm.NewOrm().QueryTable(m)
}
