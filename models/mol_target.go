package models

import "github.com/astaxie/beego/orm"

type Mol_target struct {
	Id           int64 `orm:index`
	Molregno     int
	Molchembl_id string
	Inchikey     string

	Tid         int
	Target_type string
	Pref_name   string
	//Tax_id             int
	Organism  string
	Chembl_id string
	//Species_group_flag int

	Activity_id       int
	Standard_relation string
	//Published_value   float64
	//Published_units   string
	Standard_value float64
	Standard_units string
	//Standard_flag     int
	Standard_type string

	Reference string
	Doc_id    int
	//	Journal   string
	//	Year      int
	//	Volume    string
	//	Issue     string
	Pubmed_id int
	//	Doi       string
	//Title     string
	//Authors   string

	//	Activity_comment      string
	//	Published_type        string
	//	Data_validity_comment string
	//	Potential_duplicate   int
	//	Published_relation    string
	//	Pchembl_value         float64
	//	Bao_endpoint          string
	//	Uo_units              string
	//	Qudt_units            string
	//	Assay_id              int
	//	Doc_id                int
	//	Record_id             int
}

func (m *Mol_target) TableName() string {
	return "mol_target"
}

func (m *Mol_target) Insert() error {
	if _, err := orm.NewOrm().Insert(m); err != nil {
		return err
	}
	return nil
}

func (m *Mol_target) Read(fields ...string) error {
	if err := orm.NewOrm().Read(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Mol_target) Update(fields ...string) error {
	if _, err := orm.NewOrm().Update(m, fields...); err != nil {
		return err
	}
	return nil
}

func (m *Mol_target) Delete() error {
	if _, err := orm.NewOrm().Delete(m); err != nil {
		return err
	}
	return nil
}

func (m *Mol_target) Query() orm.QuerySeter {
	return orm.NewOrm().QueryTable(m)
}
