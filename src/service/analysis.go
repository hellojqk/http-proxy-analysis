package service

import (
	"encoding/json"
	"fmt"

	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/hellojqk/jsondiff"
	"github.com/rs/zerolog/log"
)

// ingoreFields 忽略字段
var ingoreFields map[string]jsondiff.Code

// DiffResultTypeCodeMap .
var DiffResultTypeCodeMap = make(map[jsondiff.Code]uint8)

// DiffResultTypeKeyMap .
var DiffResultTypeKeyMap = make(map[uint8]jsondiff.Code)

func init() {
	DiffResultTypeCodeMap[jsondiff.KeyNotExists] = 1
	DiffResultTypeCodeMap[jsondiff.ValueNotEqual] = 2
	DiffResultTypeCodeMap[jsondiff.ValueTypeNotEqual] = 3
	DiffResultTypeCodeMap[jsondiff.ValueArrayLengthNotEqual] = 4

	for k, v := range DiffResultTypeCodeMap {
		DiffResultTypeKeyMap[v] = k
	}
}

func init() {
	//todo 提取到配置中
	ingoreFields = make(map[string]jsondiff.Code)
	ingoreFields[".requestid"] = jsondiff.ValueNotEqual
}

// ReLoadDiffStrategy .
func ReLoadDiffStrategy() {
	list, err := ListDiffStrategy()
	if err != nil {
		log.Err(err).Msg("loadDiffStrategy")
	}
	m := make(map[string]jsondiff.Code)
	for _, item := range list {
		m[item.Field] = DiffResultTypeKeyMap[item.Ignore]
	}
	// to do lock
	ingoreFields = m
}

// Analysis 分析返回结果
func Analysis() {
	ReLoadDiffStrategy()
	pageIndex, pageSize := 1, 100
	var count int64
	core.DB.Model(&core.ProxyLog{}).Where("status=1 and old_response_body is not null and old_response_body <> '' and new_response_body is not null and new_response_body <> '' and (analysis_result is null or analysis_result = '')").Count(&count)
	fmt.Printf("Analysis总计:%d\n", count)

	for (pageIndex-1)*pageSize < int(count) {
		result := make([]core.ProxyLog, 0, 10)
		err := core.DB.Where("status=1 and old_response_body is not null and old_response_body <> '' and new_response_body is not null and new_response_body <> '' and (analysis_result is null or analysis_result = '')").Order("id asc").Limit(pageSize).Offset((pageIndex - 1) * pageSize).Find(&result).Error
		if err != nil {
			log.Err(err).Msg("DB.Raw")
		}
		for _, proxyLog := range result {
			diffResult, err := jsondiff.Diff(proxyLog.OldResponseBody, proxyLog.NewResponseBody, true)
			if err != nil {
				log.Err(err).Uint("ProxyLogID", proxyLog.ID).Msg("jsondiff.Diff")
				err = core.DB.Model(&core.ProxyLog{}).Where(&core.ProxyLog{Model: core.Model{ID: proxyLog.ID}}).UpdateColumn("status", 0).Error
				if err != nil {
					log.Err(err).Uint("ProxyLogID", proxyLog.ID).Msg("jsondiff.Diff update status")
				}
				continue
			}
			saveResult := make([]jsondiff.DiffInfo, 0)
			for _, re := range diffResult {
				if _, ok := ingoreFields[re.Field]; ok {
					continue
				}
				//清除diff不同的详细信息，因为该字段会非常大
				re.Message = ""
				saveResult = append(saveResult, re)
			}
			diffResultBts, _ := json.Marshal(saveResult)
			fmt.Printf("diffResultBts:%d\t%d\n", proxyLog.ID, len(saveResult))
			core.DB.Model(&core.ProxyLog{}).Where(&core.ProxyLog{Model: core.Model{ID: proxyLog.ID}}).UpdateColumns(map[string]interface{}{"analysis_result": string(diffResultBts), "analysis_diff_count": len(saveResult)})
		}
		pageIndex++
	}
}
