package model

// PageParam 分页参数
type PageParam struct {
	Current  int    `form:"current"`
	PageSize int    `form:"pageSize"`
	Sorter   string `form:"sorter"`
	Filter   string `form:"filter"`
}
