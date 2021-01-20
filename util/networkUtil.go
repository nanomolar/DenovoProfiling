package util

type Network struct {
	Nodes []Node
	Edges []Edge
}

type Node struct {
	Id    int64  `json:"id"`
	Label string `json:"label"`
	Group int64  `json:"group"`
}

type Edge struct {
	//Id   int `json:"id"`
	From int64 `json:"from"`
	To   int64 `json:"to"`
}
