package model

// PageParam 分页参数
type PageParam struct {
	PageIndex int `form:"page_index"`
	PageSize  int `form:"page_size"`
}
