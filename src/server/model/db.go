package model

import (
	"time"
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
	OldResponseStatus uint16 `gorm:"default:0;not null;index"`             //旧应用接口返回状态

	NewResponseHeader string `gorm:"type:text;not null"`       //新应用接口返回头
	NewResponseBody   string `gorm:"type:mediumtext;not null"` //新应用接口返回body
	NewResponseStatus uint16 `gorm:"default:0;not null;index"` //新应用接口返回状态

	AnalysisResult string `gorm:"type:text;not null"` //初步分析结果
	Model
}
