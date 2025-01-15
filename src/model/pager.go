package model

import "github.com/hellojqk/http-proxy-analysis/src/entity"

// PageParam 分页参数
type PageParam struct {
	Current  int               `form:"current"`
	PageSize int               `form:"pageSize"`
	Sorter   map[string]string `form:"sorter"`
	Filter   map[string]string `form:"filter"`
}

// ProxyLogListRequestParam .
type ProxyLogListRequestParam struct {
	PageParam
	entity.ProxyLog
	CreatedAtBegin     string
	CreatedAtEnd       string
	ProxyDurationBegin int64
	ProxyDurationEnd   int64
	ImageDurationBegin int64
	ImageDurationEnd   int64
}
