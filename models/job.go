package models

import (
	"time"

	"github.com/astaxie/beego/orm"
)

type Job struct {
	Id             int64
	JobId          string `orm:"index"`
	FileName       string `orm:"type(text);null`
	JobType        string `orm:"size(256);index"`
	QueryParameter string `orm:"type(text);null`
	HitsSdfile     string
	QueryMol       string
	Threshold      string
	//Maxhits        string
	Mols           string    `orm:"type(text);null`
	StartTime      time.Time `orm:"auto_now_add;type(datetime)"`
	FinishTime     time.Time `orm:"auto_now_add;type(datetime)"`
	Results        string    `orm:"type(text);null`
	Status         string    `orm:"size(255)"`
}

func (m *Job) TableName() string {
	return "job"
}

func (m *Job) Insert() error {
	if _, err := orm.NewOrm().Insert(m); err != nil {
		return err
	}
	return nil
}

func (m *Job) Read(fields ...string) error {
	if err := orm.NewOrm().Read(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Job) Update(fields ...string) error {
	if _, err := orm.NewOrm().Update(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Job) Delete() error {
	if _, err := orm.NewOrm().Delete(m); err != nil {
		return err
	}
	return nil
}

func (m *Job) Query() orm.QuerySeter {
	return orm.NewOrm().QueryTable(m)
}