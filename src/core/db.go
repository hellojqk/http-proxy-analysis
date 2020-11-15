package core

import (
	"time"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

// Model .
type Model struct {
	ID        uint      `gorm:"primarykey;AUTO_INSTREMENT;not null"`
	CreatedAt time.Time `gorm:"index"`
	UpdatedAt time.Time `gorm:"index"`
}

// Application 代理程序列表
type Application struct {
	Name    string `gorm:"type:varchar(50);default:'';not null"`  //代理应用名称
	OldHost string `gorm:"type:varchar(255);default:'';not null"` //旧应用地址
	NewHost string `gorm:"type:varchar(255);default:'';not null"` //新应用地址
	Status  bool   `gorm:"type:tinyint(1);default:0;not null"`    //状态，是否启用
	Model
	APIs []API
}

// API 接口地址
type API struct {
	ApplicationID uint   `gorm:"default:0;not null;index"`              //应用程序ID
	URL           string `gorm:"type:varchar(255);default:'';not null"` //接口地址
	GET           bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否代理此类请求
	POST          bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否代理此类请求
	PUT           bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否代理此类请求
	PATCH         bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否代理此类请求
	DELETE        bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否代理此类请求
	Status        bool   `gorm:"type:tinyint(1);default:0;not null"`    //状态，是否启用
	Model

	Application Application
}

// ProxyLog 代理日志
type ProxyLog struct {
	ApplicationID     uint   `gorm:"default:0;not null;index"`             //应用程序ID
	APIID             uint   `gorm:"default:0;not null;index"`             //接口ID
	OldRequestMethod  string `gorm:"type:varchar(10);default:'';not null"` //旧应用接口请求方法
	OldRequestURL     string `gorm:"type:text;not null"`                   //旧应用接口请求url
	OldRequestHeader  string `gorm:"type:text;not null"`                   //旧应用接口请求头
	OldRequestBody    string `gorm:"type:mediumtext;not null"`             //旧应用接口请求body
	OldResponseHeader string `gorm:"type:text;not null"`                   //旧应用接口返回头
	OldResponseBody   string `gorm:"type:mediumtext;not null"`             //旧应用接口返回body
	OldResponseStatus int    `gorm:"default:0;not null;index"`             //旧应用接口返回状态

	NewResponseHeader string `gorm:"type:text;not null"`       //新应用接口返回头
	NewResponseBody   string `gorm:"type:mediumtext;not null"` //新应用接口返回body
	NewResponseStatus int    `gorm:"default:0;not null;index"` //新应用接口返回状态

	AnalysisResult string `gorm:"type:text;not null"` //初步分析结果
	Model
}

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
			TablePrefix:   "refactor_",
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

	err := db.Migrator().AutoMigrate(&Application{}, &API{}, &ProxyLog{})
	if err != nil {
		panic(errors.Wrap(err, "db AutoMigrate error"))
	}
}
