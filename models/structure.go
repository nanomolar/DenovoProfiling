package models

import (
	"github.com/astaxie/beego/orm"
)

type Structure struct {
	Id       int64
	Mol      string `orm:"type(text);null"`
	MolName  string `orm:"size(256);index"` // for now, use Id as MolName
	Inchikey string `orm:"size(50);index"`
	//ChemDBId int64  `orm:"column(chemdb_id);index"` // id for ChemDB
	JobId  string `orm:"size(32);index"`
	Active int8
	Cid    string
	//Props  []*Property `orm:"-"`
}

func (m *Structure) TableName() string {
	return "structure"
}

func (m *Structure) Insert() error {
	if _, err := orm.NewOrm().Insert(m); err != nil {
		return err
	}
	return nil
}

func (m *Structure) Read(fields ...string) error {
	if err := orm.NewOrm().Read(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Structure) Update(fields ...string) error {
	if _, err := orm.NewOrm().Update(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Structure) Delete() error {
	if _, err := orm.NewOrm().Delete(m); err != nil {
		return err
	}
	return nil
}

func (m *Structure) Query() orm.QuerySeter {
	return orm.NewOrm().QueryTable(m)
}

//func (m *Structure) ToMolFormat() string {
//	molFormat := m.Mol
//	for _, prop := range m.Props {
//		molFormat += ">  <" + prop.PropName + ">\n"
//		molFormat += prop.PropVal + "\n"
//		molFormat += "\n"
//	}
//	molFormat += "$$$$\n"
//	return molFormat
//}
