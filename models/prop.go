package models

import (
	"github.com/astaxie/beego/orm"
)

type Prop struct {
	Id        int64
	MolName   string
	MolWeight float64
	Hba       int64
	Hbd       int64
	Alogp     float64
	RotBonds  float64
	Tpsa      float64
}

func (m *Prop) TableName() string {
	return "Prop"
}

func (m *Prop) Insert() error {
	if _, err := orm.NewOrm().Insert(m); err != nil {
		return err
	}
	return nil
}

func (m *Prop) Read(fields ...string) error {
	if err := orm.NewOrm().Read(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Prop) Update(fields ...string) error {
	if _, err := orm.NewOrm().Update(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Prop) Delete() error {
	if _, err := orm.NewOrm().Delete(m); err != nil {
		return err
	}
	return nil
}

func (m *Prop) Query() orm.QuerySeter {
	return orm.NewOrm().QueryTable(m)
}
