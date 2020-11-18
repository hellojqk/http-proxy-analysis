package service

import (
	"errors"
	"strconv"
	"strings"

	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/hellojqk/http-proxy-analysis/src/util"
	"github.com/pterm/pterm"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// CreateAPP 创建应用
func CreateAPP(appName string, oldHost string, newHost string) (err error) {
	if appName == "" || oldHost == "" {
		err = errors.New("appName or oldHost is null")
		return
	}
	core.InitConn()

	oldHost = strings.TrimRight(oldHost, "/")
	newHost = strings.TrimRight(newHost, "/")

	var app = &core.Application{
		Name:    appName,
		OldHost: oldHost,
		NewHost: newHost,
	}
	app.Status = true
	err = core.DB.Where(&core.Application{Name: appName}).FirstOrCreate(app).Error
	return
}

var appHeader = []string{"APP_NAME", "OLD_HOST", "NEW_HOST", "STATUS", "CREATE_TIME"}

// TermShowListAPP 获取应用列表
func TermShowListAPP() (result []core.Application) {
	core.InitConn()
	result = make([]core.Application, 0, 1)
	err := core.DB.Find(&result).Error
	if err != nil {
		log.Err(err).Msg("list app")
		return
	}

	var dataLines = make([][]string, len(result)+1)
	dataLines[0] = appHeader
	for index, item := range result {
		dataLines[index+1] = []string{item.Name, item.OldHost, item.NewHost, strconv.FormatBool(item.Status), item.CreatedAt.Format(util.TimeFormat)}
	}

	pterm.DefaultTable.WithHasHeader().WithData(dataLines).Render()
	return
}

// ListAPP .
func ListAPP(containAPIInfo bool) (result []core.Application, err error) {
	result = make([]core.Application, 0, 1)
	db := core.DB
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
func GetAPP(appName string) (*core.Application, error) {
	var app = &core.Application{Name: appName}
	err := core.DB.Where(&core.Application{Name: appName}).Preload("APIs").First(app).Error
	if err != nil {
		return nil, err
	}
	return app, nil
}
