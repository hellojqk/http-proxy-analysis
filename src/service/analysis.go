package service

import (
	"encoding/json"
	"fmt"

	"github.com/hellojqk/jsondiff"
	"github.com/hellojqk/refactor/src/core"
	"github.com/rs/zerolog/log"
)

// ingoreFields 忽略字段
var ingoreFields map[string]byte

func init() {
	//todo 提取到配置中
	ingoreFields = make(map[string]byte)
	ingoreFields[".requestid"] = 0
}

// Analysis 分析返回结果
func Analysis() {
	pageIndex, pageSize := 1, 100
	var count int64
	core.DB.Model(&core.ProxyLog{}).Where("old_response_body is not null and old_response_body <> '' and new_response_body is not null and new_response_body <> '' and (analysis_result is null or analysis_result = '')").Count(&count)
	fmt.Printf("Analysis总计:%d\n", count)

	for (pageIndex-1)*pageSize < int(count) {
		result := make([]core.ProxyLog, 0, 10)
		err := core.DB.Where("old_response_body is not null and old_response_body <> '' and new_response_body is not null and new_response_body <> '' and (analysis_result is null or analysis_result = '')").Limit(pageSize).Offset((pageIndex - 1) * pageSize).Find(&result).Error
		if err != nil {
			log.Err(err).Msg("DB.Raw")
		}
		for _, proxyLog := range result {
			// fmt.Println(proxyLog.ResponseBody, "\n\n", proxyLog.MirrorResponseBody)
			// fmt.Println("------------------------------------")
			diffResult, err := jsondiff.Diff(proxyLog.OldResponseBody, proxyLog.NewResponseBody, true)
			if err != nil {
				log.Err(err).Uint("ProxyLogID", proxyLog.ID).Msg("jsondiff.Diff")
				continue
			}
			saveResult := make([]jsondiff.DiffInfo, 0)
			for _, re := range diffResult {
				if _, ok := ingoreFields[re.Field]; ok {
					continue
				}
				saveResult = append(saveResult, re)
			}
			diffResultBts, _ := json.Marshal(saveResult)
			// fmt.Printf("diffResultBts:%d\n%s\n", proxyLog.ProxyLogID, diffResultBts)
			core.DB.Model(&core.ProxyLog{}).Where(&core.ProxyLog{Model: core.Model{ID: proxyLog.ID}}).UpdateColumn("analysis_result", string(diffResultBts))
		}
		pageIndex++
	}
}
