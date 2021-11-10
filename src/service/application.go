package service

import (
	"errors"
	"strconv"
	"strings"

	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/hellojqk/http-proxy-analysis/src/repository"
	"github.com/hellojqk/http-proxy-analysis/src/util"
	"github.com/pterm/pterm"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// CreateAPP 创建应用
func CreateAPP(appName string, proxyHost string, imageHost string, main string) (err error) {
	if appName == "" || proxyHost == "" {
		err = errors.New("appName or proxyHost is null")
		return
	}
	repository.InitConn()

	proxyHost = strings.TrimRight(proxyHost, "/")
	imageHost = strings.TrimRight(imageHost, "/")

	var app = &entity.Application{
		Name:      appName,
		ProxyHost: proxyHost,
		ImageHost: imageHost,
		Main:      main,
	}
	app.Status = true
	err = repository.DB.Where(&entity.Application{Name: appName}).FirstOrCreate(app).Error
	return
}

var appHeader = []string{"APP_NAME", "OLD_HOST", "NEW_HOST", "STATUS", "CREATE_TIME"}

// TermShowListAPP 获取应用列表
func TermShowListAPP() (result []entity.Application) {
	repository.InitConn()
	result = make([]entity.Application, 0, 1)
	err := repository.DB.Find(&result).Error
	if err != nil {
		log.Err(err).Msg("list app")
		return
	}

	var dataLines = make([][]string, len(result)+1)
	dataLines[0] = appHeader
	for index, item := range result {
		dataLines[index+1] = []string{item.Name, item.ProxyHost, item.ImageHost, strconv.FormatBool(item.Status), item.CreatedAt.Format(util.TimeFormat)}
	}

	pterm.DefaultTable.WithHasHeader().WithData(dataLines).Render()
	return
}

// ListAPP .
func ListAPP(containAPIInfo bool) (result []entity.Application, err error) {
	result = make([]entity.Application, 0, 1)
	db := repository.DB
	if containAPIInfo {
		db = db.Preload("APIs")
	}
	err = db.Find(&result).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("list app")
		return
	}
	return
}

// GetAPP 获取应用信息
func GetAPP(appName string) (*entity.Application, error) {
	var app = &entity.Application{Name: appName}
	err := repository.DB.Where(&entity.Application{Name: appName}).Preload("APIs").First(app).Error
	if err != nil {
		return nil, err
	}
	return app, nil
}
