package service

import (
	"errors"

	"github.com/hellojqk/refactor/src/core"
	"github.com/hellojqk/refactor/src/util"
	"github.com/pterm/pterm"
	"github.com/rs/zerolog/log"
)

// CreateAPP 创建应用
func CreateAPP(appName string, oldHost string, newHost string) (err error) {
	if appName == "" || oldHost == "" {
		err = errors.New("appName or oldHost is null")
		return
	}
	core.InitConn()

	var app = &core.Application{
		Name:    appName,
		OldHost: oldHost,
		NewHost: newHost,
		Status:  true,
	}
	err = core.DB.Where(&core.Application{Name: appName}).FirstOrCreate(app).Error
	return
}

var headerLine = []string{"APP_NAME", "OLD_HOST", "NEW_HOST", "STATUS", "CREATE_TIME"}

// ListAPP 获取应用列表
func ListAPP() (result []core.Application) {
	core.InitConn()
	result = make([]core.Application, 0, 1)
	err := core.DB.Find(&result).Error
	if err != nil {
		log.Err(err).Msg("list app")
		return
	}

	var dataLines = make([][]string, len(result)+1)
	dataLines[0] = headerLine
	for index, app := range result {
		status := "false"
		if app.Status {
			status = "true"
		}
		dataLines[index+1] = []string{app.Name, app.OldHost, app.NewHost, status, app.CreatedAt.Format(util.TimeFormat)}
	}

	pterm.DefaultTable.WithHasHeader().WithData(dataLines).Render()
	return
}
