package models

import "github.com/astaxie/beego/orm"

type Uniprot struct {
	Tid     int `orm:"pk"`
	Uniprot string
}

func (m *Uniprot) TableName() string {
	return "uniprot"
}

func (m *Uniprot) Insert() error {
	if _, err := orm.NewOrm().Insert(m); err != nil {
		return err
	}
	return nil
}

func (m *Uniprot) Read(fields ...string) error {
	if err := orm.NewOrm().Read(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Uniprot) Update(fields ...string) error {
	if _, err := orm.NewOrm().Update(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Uniprot) Delete() error {
	if _, err := orm.NewOrm().Delete(m); err != nil {
		return err
	}
	return nil
}

func (m *Uniprot) Query() orm.QuerySeter {
	return orm.NewOrm().QueryTable(m)
}
