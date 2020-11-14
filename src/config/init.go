package config

import (
	"fmt"

	"github.com/hellojqk/refactor/src/server/model"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

// Init .
func Init() {
	fmt.Println("Init")
	connectionStr := viper.GetString("connectionString")
	if connectionStr == "" {
		panic("connectionStr is null")
	}

	db, err := gorm.Open(mysql.New(mysql.Config{DSN: connectionStr}), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true, // 使用单数表名
		},
	})
	if err != nil {
		panic(errors.Wrap(err, "db open error"))
	}

	sqlDB, err := db.DB()
	if err != nil {
		panic(errors.Wrap(err, "db DB() error"))
	}
	err = sqlDB.Ping()
	if err != nil {
		panic(errors.Wrap(err, "db Ping() error"))
	}

	db = db.Debug()
	db.Migrator().DropTable(&model.Application{}, &model.API{}, &model.ProxyLog{})

	err = db.Migrator().AutoMigrate(&model.Application{}, &model.API{}, &model.ProxyLog{})
	if err != nil {
		panic(errors.Wrap(err, "db AutoMigrate error"))
	}
}
