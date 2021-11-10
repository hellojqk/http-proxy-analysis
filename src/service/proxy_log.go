package service

import (
	"time"

	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/hellojqk/http-proxy-analysis/src/model"
	"github.com/hellojqk/http-proxy-analysis/src/repository"
)

// InsertProwyLog .
func InsertProwyLog(proxyLog *entity.ProxyLog) (bool, error) {
	insertResult := repository.DB.Create(proxyLog)
	return insertResult.RowsAffected > 0, insertResult.Error
}

// ListProxyLog .
func ListProxyLog(pageParam *model.ProxyLogListRequestParam) (result []entity.ProxyLog, total int64, err error) {
	result = make([]entity.ProxyLog, 0)
	oldRequestURL := pageParam.ProxyRequestURL

	if oldRequestURL != "" {
		pageParam.ProxyRequestURL = ""
	}

	db := repository.DB.Debug().Model(&entity.ProxyLog{}).Where(pageParam.ProxyLog)

	if pageParam.CreatedAtBegin != "" {
		db = db.Where("created_at >= ?", pageParam.CreatedAtBegin)
	}

	if pageParam.CreatedAtEnd != "" {
		db = db.Where("created_at < ?", pageParam.CreatedAtEnd)
	}

	if oldRequestURL != "" {
		db = db.Where("old_request_url like ?", "%"+oldRequestURL+"%")
	}

	err = db.Count(&total).Error
	if err != nil || total == 0 {
		return
	}
	err = db.Limit(pageParam.PageSize).Offset((pageParam.Current - 1) * pageParam.PageSize).Preload("Application").Preload("API").Order("id desc").Find(&result).Error
	return
}

// GetProxyLog .
func GetProxyLog(proxyLog *entity.ProxyLog) error {
	return repository.DB.Preload("Application").Preload("API").First(proxyLog, proxyLog.ID).Error
}

// DeleteProxyLogBefore .
func DeleteProxyLogBefore(createAt time.Time) error {
	return repository.DB.Debug().Where(" created_at < ?", createAt).Delete(&entity.ProxyLog{}).Error
}
