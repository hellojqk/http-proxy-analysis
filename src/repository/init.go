package repository

import (
	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

// DB .
var DB *gorm.DB

// InitConn 初始化连接
func InitConn() {
	connectionStr := viper.GetString("connectionString")
	if connectionStr == "" {
		panic("connectionStr is null")
	}
	var err error
	DB, err = gorm.Open(mysql.New(mysql.Config{DSN: connectionStr}), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix:   "hpa_",
			SingularTable: true, // 使用单数表名
		},
	})
	if err != nil {
		panic(errors.Wrap(err, "db open error"))
	}

	sqlDB, err := DB.DB()
	if err != nil {
		panic(errors.Wrap(err, "db DB() error"))
	}
	err = sqlDB.Ping()
	if err != nil {
		panic(errors.Wrap(err, "db Ping() error"))
	}
}

// InitTable 初始化表结构
func InitTable() {
	InitConn()
	db := DB.Debug()
	// db.Migrator().DropTable(&Application{}, &API{}, &ProxyLog{})

	//禁用外键约束
	db.DisableForeignKeyConstraintWhenMigrating = true
	var err error
	err = db.Migrator().AutoMigrate(&entity.Application{}, &entity.API{}, &entity.ProxyLog{}, &entity.DiffStrategy{})
	if err != nil {
		panic(errors.Wrap(err, "db AutoMigrate error"))
	}

	// proxy_log表不允许创建外键约束
	if (db.Migrator().HasConstraint(&entity.ProxyLog{}, "fk_hpa_proxy_log_api")) {
		err = db.Migrator().DropConstraint(&entity.ProxyLog{}, "fk_hpa_proxy_log_api")
		if err != nil {
			panic(errors.Wrap(err, "db AutoMigrate error"))
		}
	}
	if (db.Migrator().HasConstraint(&entity.ProxyLog{}, "fk_hpa_proxy_log_application")) {
		err = db.Migrator().DropConstraint(&entity.ProxyLog{}, "fk_hpa_proxy_log_application")
		if err != nil {
			panic(errors.Wrap(err, "db AutoMigrate error"))
		}
	}
}
