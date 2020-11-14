package service

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/hellojqk/refactor/src/core"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// ImportSwaggerDoc 导入swagger文档
func ImportSwaggerDoc(appName string, url string) {
	core.InitConn()

	var app = &core.Application{}
	err := core.DB.Where(&core.Application{Name: appName}).First(app).Error
	if err != nil {
		log.Err(err).Msg("app not exists")
		return
	}

	resp, err := http.Get(url)
	if err != nil {
		log.Err(err).Msg("get swagger doc error")
		return
	}

	respBts, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Err(err).Msg("reader swagger doc error")
		return
	}

	var m = make(map[string]interface{})
	err = json.Unmarshal(respBts, &m)
	paths, ok := m["paths"]
	if !ok {
		log.Warn().Msg("cant find paths from swagger doc")
		return
	}
	pathMap := paths.(map[string]interface{})

	for path, pathItem := range pathMap {
		if pathItem == nil {
			log.Warn().Msgf("path:%s is null", path)
			continue
		}
		methodMap := pathItem.(map[string]interface{})

		api := core.API{ApplicationID: app.ID, URL: path}
		err := core.DB.Where(&api).First(&api).Error
		if err != nil && err != gorm.ErrRecordNotFound {
			log.Err(err).Msg("find api error")
			continue
		}
		for method := range methodMap {
			switch strings.ToLower(method) {
			case "get":
				api.GET = true
			case "POST":
				api.POST = true
			case "PUT":
				api.PUT = true
			case "PATCH":
				api.PATCH = true
			case "DELETE":
				api.DELETE = true
			}
		}
		if api.ID == 0 {
			api.Status = true
		}
		err = core.DB.Save(&api).Error
		if err != nil {
			log.Err(err).Msg("api create error")
			continue
		}
	}
}
