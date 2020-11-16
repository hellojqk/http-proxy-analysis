package service

import (
	"github.com/hellojqk/proxy-log/src/core"
	"github.com/hellojqk/proxy-log/src/model"
)

// InsertProwyLog .
func InsertProwyLog(proxyLog *core.ProxyLog) (bool, error) {
	insertResult := core.DB.Create(proxyLog)
	return insertResult.RowsAffected > 0, insertResult.Error
}

// ListProxyLog .
func ListProxyLog(pageParam *model.PageParam) (result []core.ProxyLog, total int64, err error) {
	result = make([]core.ProxyLog, 0)
	err = core.DB.Model(&core.ProxyLog{}).Count(&total).Error
	if err != nil || total == 0 {
		return
	}
	err = core.DB.Limit(pageParam.PageSize).Offset((pageParam.Current - 1) * pageParam.PageSize).Preload("Application").Preload("API").Find(&result).Error
	return
}

// GetProxyLog .
func GetProxyLog(proxyLog *core.ProxyLog) error {
	return core.DB.Preload("Application").Preload("API").First(proxyLog, proxyLog.ID).Error
}
