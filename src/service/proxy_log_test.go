package service

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/hellojqk/http-proxy-analysis/src/repository"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/viper"
)

func TestMain(m *testing.M) {
	// Find home directory.
	home, err := homedir.Dir()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// Search config in home directory with name ".hpa" (without extension).
	viper.AddConfigPath(home)
	viper.AddConfigPath("config/")
	viper.SetConfigName(".hpa")

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}
	repository.InitConn()
	m.Run()
}

func TestGetProxyLog(t *testing.T) {
	// pl := entity.ProxyLog{Model: entity.Model{ID: 3913298}}
	// err := GetProxyLog(&pl)
	// if err != nil {
	// 	t.Error(err)
	// }

	// t.Logf("%v\n", pl.Application)
	result := make([]entity.ProxyLog, 0, 10)
	repository.DB.Debug().Preload("Application").Where("status=1 ").Order("id asc").Limit(10).Find(&result)
	t.Logf("%v\n", result[0].Application)
}

func TestDeleteProxyLogBefore(t *testing.T) {
	err := DeleteProxyLogBefore(time.Now().AddDate(0, -3, 0))
	if err != nil {
		t.Error(err)
	}
}

func TestDeleteProxyLogBeforeCount(t *testing.T) {
	DeleteProxyLogBeforeCount(40000)
}
