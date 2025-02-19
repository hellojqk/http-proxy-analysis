package service

import (
	"encoding/json"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/hellojqk/http-proxy-analysis/src/repository"
	"github.com/hellojqk/http-proxy-analysis/src/util"
	"github.com/pterm/pterm"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// ImportSwaggerDoc 导入swagger文档
func ImportSwaggerDoc(appName string, url string) {
	repository.InitConn()

	var app = &entity.Application{}
	err := repository.DB.Where(&entity.Application{Name: appName}).First(app).Error
	if err != nil {
		log.Err(err).Msg("app not exists")
		return
	}

	resp, err := http.Get(url)
	if err != nil {
		log.Err(err).Msg("get swagger doc error")
		return
	}

	respBts, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Err(err).Msg("reader swagger doc error")
		return
	}
	ImportSwagger(respBts, app.ID)
}

func ImportSwagger(content []byte, applicationID uint) {
	var m = make(map[string]interface{})
	err := json.Unmarshal(content, &m)
	if err != nil {
		log.Err(err).Msg("unmarshal swagger doc error")
		return
	}
	paths, ok := m["paths"]
	if !ok {
		log.Warn().Msg("cant find paths from swagger doc")
		return
	}
	basePath := m["basePath"]
	basePathStr := ""
	if basePath != nil {
		basePathStr = basePath.(string)
	}
	pathMap := paths.(map[string]interface{})

	re := regexp.MustCompile(`/+`)

	for path, pathItem := range pathMap {
		if pathItem == nil {
			log.Warn().Msgf("path:%s is null", path)
			continue
		}
		methodMap := pathItem.(map[string]interface{})

		api := entity.API{ApplicationID: applicationID, URL: basePathStr + path}
		err := repository.DB.Where(&api).First(&api).Error
		if err != nil && err != gorm.ErrRecordNotFound {
			log.Err(err).Msg("find api error")
			continue
		}
		for method, methodDetail := range methodMap {
			summary := ""
			methodDetailMap := methodDetail.(map[string]interface{})
			if methodDetailMap != nil && methodDetailMap["summary"] != nil {
				summary = methodDetailMap["summary"].(string)
			}
			switch strings.ToLower(method) {
			case "get":
				api.GET = true
				api.GETSummary = summary
				if api.ID == 0 {
					api.GETAllowMirror = true
				}
			case "post":
				api.POST = true
				api.POSTSummary = summary
			case "put":
				api.PUT = true
				api.PUTSummary = summary
			case "patch":
				api.PATCH = true
				api.PATCHSummary = summary
			case "delete":
				api.DELETE = true
				api.DELETESummary = summary
			}
		}
		if api.ID == 0 {
			api.Status = true
		}

		//正则对url中的连续多个/进行替换成一个/
		api.URL = re.ReplaceAllString(api.URL, "/")
		err = repository.DB.Save(&api).Error
		if err != nil {
			log.Err(err).Msg("api create error")
			continue
		}
	}
}

func ImportSwaggerByModel(importSwagger *entity.ImportSwagger) {
	ImportSwagger([]byte(importSwagger.Content), importSwagger.ApplicationID)
}

var apiHeader = []string{"APP_NAME", "URL", "GET", "POST", "PUT", "PATCH", "DELETE", "Status", "CreatedAt"}

// TermShowAPI 获取API列表
func TermShowAPI() (result []entity.API) {
	repository.InitConn()
	result = make([]entity.API, 0, 1)
	err := repository.DB.Preload("Application").Find(&result).Error
	if err != nil {
		log.Err(err).Msg("list app")
		return
	}

	var dataLines = make([][]string, len(result)+1)
	dataLines[0] = apiHeader
	for index, item := range result {
		dataLines[index+1] = []string{item.Application.Name, item.URL, strconv.FormatBool(item.GET), strconv.FormatBool(item.POST), strconv.FormatBool(item.PUT), strconv.FormatBool(item.PATCH), strconv.FormatBool(item.DELETE), strconv.FormatBool(item.Status), item.CreatedAt.Format(util.TimeFormat)}
	}

	pterm.DefaultTable.WithHasHeader().WithData(dataLines).Render()
	return
}

// ListAPI 获取API列表
func ListAPI(api *entity.API) (result []entity.API, err error) {
	result = make([]entity.API, 0, 1)
	//根据applicationId和路由模糊搜索

	// 动态构建查询条件
	query := repository.DB.Debug().Model(api)
	if api.ApplicationID > 0 {
		query = query.Where("application_id = ?", api.ApplicationID)
	}
	if api.URL != "" {
		query = query.Where("URL like ?", "%"+api.URL+"%")
	}
	if api.Status {
		query = query.Where("Status = ?", true)
	}

	err = query.Order("ID desc").Find(&result).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("ListAPI")
		return
	}
	return
}

// UpdateAPI API更新
func UpdateAPI(id uint, columns map[string]interface{}) (err error) {
	err = repository.DB.Debug().Model(&entity.API{}).Where(&entity.API{Model: entity.Model{ID: id}}).
		UpdateColumns(columns).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("UpdateAPI")
		return
	}
	return
}

// CreateAPIByModel 创建API
func CreateAPIByModel(api *entity.API) (err error) {
	api.Status = true
	err = repository.DB.Debug().Create(api).Error
	if err != nil {
		log.Err(err).Msg("CreateAPIByModel")
		return
	}
	return
}

// UpdateAPIByModel 更新API
func UpdateAPIByModel(api *entity.API) (err error) {
	err = repository.DB.Debug().UpdateColumns(api).Error
	if err != nil {
		log.Err(err).Msg("UpdateAPIByModel")
		return
	}
	return
}

// DeleteAPP 删除应用
func DeleteAPI(app *entity.API) error {
	return repository.DB.Debug().Model(&app).UpdateColumn("Status", false).Error
}
