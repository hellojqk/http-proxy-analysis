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
	proxyRequestURL := pageParam.ProxyRequestURL

	if proxyRequestURL != "" {
		pageParam.ProxyRequestURL = ""
	}

	db := repository.DB.Debug().Model(&entity.ProxyLog{})
	if pageParam.ApplicationID != 0 {
		db.Where("application_id = ?", pageParam.ApplicationID)
	}
	if pageParam.APIID != 0 {
		db.Where("api_id = ?", pageParam.APIID)
	}
	if pageParam.ProxyRequestURL != "" {
		db.Where("proxy_request_url like ?", "%"+pageParam.ProxyRequestURL+"%")
	}
	if pageParam.ProxyRequestMethod != "" {
		db.Where("proxy_request_method = ?", pageParam.ProxyRequestMethod)
	}
	if pageParam.ProxyResponseStatus != 0 {
		db.Where("proxy_response_status = ?", pageParam.ProxyResponseStatus)
	}
	if pageParam.ImageResponseStatus != 0 {
		db.Where("image_response_status = ?", pageParam.ImageResponseStatus)
	}

	if pageParam.CreatedAtBegin != "" {
		db = db.Where("created_at >= ?", pageParam.CreatedAtBegin)
	}

	if pageParam.CreatedAtEnd != "" {
		db = db.Where("created_at < ?", pageParam.CreatedAtEnd)
	}

	if proxyRequestURL != "" {
		db = db.Where("proxy_request_url like ?", "%"+proxyRequestURL+"%")
	}
	//有差异
	if pageParam.AnalysisDiffCount == 1 {
		db = db.Where("analysis_diff_count > 0")
		//无差异
	} else if pageParam.AnalysisDiffCount == -1 {
		db = db.Where("analysis_diff_count = 0")
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
	return repository.DB.Where(" created_at < ?", createAt).Delete(&entity.ProxyLog{}).Error
}

// DeleteProxyLogBeforeCount 每个API只保留最新的count条数据
func DeleteProxyLogBeforeCount(count int) error {
	//至少保留1000条日志
	if count <= 1000 {
		count = 1000
	}
	apps, err := ListAPP(true)
	if err != nil {
		return err
	}
	for _, app := range apps {
		if len(app.APIs) == 0 {
			continue
		}
		for _, api := range app.APIs {
			repository.DB.Where("api_id=? and id < (select id from (SELECT id from hpa_proxy_log where api_id=? order by id desc LIMIT 1 OFFSET ?) t)", api.ID, api.ID, count).Delete(&entity.ProxyLog{})
		}
	}
	repository.DB.Where("api_id=? and id < (select id from (SELECT id from hpa_proxy_log where api_id=? order by id desc LIMIT 1 OFFSET ?) t)", 0, 0, count).Delete(&entity.ProxyLog{})
	return nil
}
