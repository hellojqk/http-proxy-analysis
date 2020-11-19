package model

import (
	"github.com/hellojqk/http-proxy-analysis/src/core"
)

// PageParam 分页参数
type PageParam struct {
	Current  int    `form:"current"`
	PageSize int    `form:"pageSize"`
	Sorter   string `form:"sorter"`
	Filter   string `form:"filter"`
}

// ProxyLogListRequestParam .
type ProxyLogListRequestParam struct {
	PageParam
	core.ProxyLog
	CreateAtBegin string
	CreateAtEnd   string
}
