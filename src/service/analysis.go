package service

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/hellojqk/http-proxy-analysis/src/repository"
	"github.com/hellojqk/jsondiff"
	"github.com/rs/zerolog/log"
)

// ingoreInfo 忽略字段 0:全局策略 >0为具体APIID策略
var ingoreInfo map[uint][]entity.DiffStrategy

func init() {
	//todo 提取到配置中
	ingoreInfo = make(map[uint][]entity.DiffStrategy)
}

// ReLoadDiffStrategy .
func ReLoadDiffStrategy() {
	list, err := ListDiffStrategy()
	if err != nil {
		log.Err(err).Msg("loadDiffStrategy")
	}
	m := make(map[uint][]entity.DiffStrategy, 1)
	m[0] = make([]entity.DiffStrategy, 0)
	for _, item := range list {
		if ary := m[item.APIID]; ary == nil {
			m[item.APIID] = make([]entity.DiffStrategy, 0)
		}
		m[item.APIID] = append(m[item.APIID], item)
	}

	for k := range m {
		if k == 0 {
			continue
		}
		m[k] = append(m[k], m[0]...)
	}
	// to do lock
	ingoreInfo = m
}

// Analysis 分析返回结果
func Analysis() {
	ReLoadDiffStrategy()
	pageIndex, pageSize := 1, 100
	var count int64
	repository.DB.Model(&entity.ProxyLog{}).Where("status=1 and old_response_body is not null and old_response_body <> '' and new_response_body is not null and new_response_body <> '' and (analysis_result is null or analysis_result = '')").Count(&count)
	fmt.Printf("Analysis总计:%d\n", count)

	for (pageIndex-1)*pageSize < int(count) {
		result := make([]entity.ProxyLog, 0, 10)
		err := repository.DB.Where("status=1 and old_response_body is not null and old_response_body <> '' and new_response_body is not null and new_response_body <> '' and (analysis_result is null or analysis_result = '')").Order("id asc").Limit(pageSize).Offset((pageIndex - 1) * pageSize).Find(&result).Error
		if err != nil {
			log.Err(err).Msg("DB.Raw")
		}
		for _, proxyLog := range result {
			diffResult, err := jsondiff.Diff(proxyLog.OldResponseBody, proxyLog.NewResponseBody, true)
			if err != nil {
				log.Err(err).Uint("ProxyLogID", proxyLog.ID).Msg("jsondiff.Diff")
				err = repository.DB.Model(&entity.ProxyLog{}).Where(&entity.ProxyLog{Model: entity.Model{ID: proxyLog.ID}}).UpdateColumn("status", 0).Error
				if err != nil {
					log.Err(err).Uint("ProxyLogID", proxyLog.ID).Msg("jsondiff.Diff update status")
				}
				continue
			}

			ingoreFields, ok := ingoreInfo[proxyLog.APIID]
			if !ok {
				ingoreFields = ingoreInfo[0]
			}

			saveResult := make([]jsondiff.DiffInfo, 0)
			for _, re := range diffResult {

				ingore := false
				for _, ingoreField := range ingoreFields {
					ingore = strings.Contains(re.Field, ingoreField.Field) && ingoreField.Code == re.Code
					if ingore {
						break
					}
				}

				if ingore {
					continue
				}

				//清除diff不同的详细信息，因为该字段会非常大
				re.Message = ""
				saveResult = append(saveResult, re)
			}
			diffResultBts, _ := json.Marshal(saveResult)
			fmt.Printf("diffResultBts:%d\t%d\n", proxyLog.ID, len(saveResult))
			repository.DB.Model(&entity.ProxyLog{}).Where(&entity.ProxyLog{Model: entity.Model{ID: proxyLog.ID}}).UpdateColumns(map[string]interface{}{"analysis_result": string(diffResultBts), "analysis_diff_count": len(saveResult)})
		}
		pageIndex++
	}
}
