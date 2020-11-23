package entity

import (
	"time"

	"github.com/hellojqk/jsondiff"
)

// Model .
type Model struct {
	ID        uint      `gorm:"primarykey;AUTO_INSTREMENT;not null" uri:"id"`
	Status    bool      `gorm:"type:tinyint(1);default:0;not null"` //状态，是否有效数据
	CreatedAt time.Time `gorm:"index"`
	UpdatedAt time.Time `gorm:"index"`
}

// Application 代理程序列表
type Application struct {
	Name    string `gorm:"type:varchar(50);default:'';not null"`  //代理应用名称
	Host    string `gorm:"type:varchar(255);default:'';not null"` //代理地址 http(s)://domain
	OldHost string `gorm:"type:varchar(255);default:'';not null"` //旧应用地址 http(s)://(ip:port|localDomain)
	NewHost string `gorm:"type:varchar(255);default:'';not null"` //新应用地址 http(s)://(ip:port|localDomain)
	Model
	APIs []*API
}

// API 接口地址
type API struct {
	ApplicationID uint   `gorm:"default:0;not null;index"`              //应用程序ID
	URL           string `gorm:"type:varchar(255);default:'';not null"` //接口地址

	GET            bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否有对应方法
	GETSummary     string `gorm:"type:varchar(255);default:'';not null"` //对应方法接口描述
	GETAllowMirror bool   `gorm:"type:tinyint(1);default:1;not null"`    //是否允许镜像流量

	POST            bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否有对应方法
	POSTSummary     string `gorm:"type:varchar(255);default:'';not null"` //对应方法接口描述
	POSTAllowMirror bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否允许镜像流量

	PUT            bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否有对应方法
	PUTSummary     string `gorm:"type:varchar(255);default:'';not null"` //对应方法接口描述
	PUTAllowMirror bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否允许镜像流量

	PATCH            bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否有对应方法
	PATCHSummary     string `gorm:"type:varchar(255);default:'';not null"` //对应方法接口描述
	PATCHAllowMirror bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否允许镜像流量

	DELETE            bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否有对应方法
	DELETESummary     string `gorm:"type:varchar(255);default:'';not null"` //对应方法接口描述
	DELETEAllowMirror bool   `gorm:"type:tinyint(1);default:0;not null"`    //是否允许镜像流量

	Model

	Application *Application
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
	OldDuration       int64  `gorm:"default:0;not null;"`                  //旧应用接口执行时间

	NewResponseHeader string `gorm:"type:text;not null"`       //新应用接口返回头
	NewResponseBody   string `gorm:"type:mediumtext;not null"` //新应用接口返回body
	NewResponseStatus int    `gorm:"default:0;not null;index"` //新应用接口返回状态
	NewDuration       int64  `gorm:"default:0;not null;"`      //新应用接口持续时间

	AnalysisResult    string `gorm:"type:text;not null"`  //初步分析结果
	AnalysisDiffCount int    `gorm:"default:0;not null;"` //初步分析不同数量
	Model

	Status      bool `gorm:"type:tinyint(1);default:0;not null"` //状态，是否有效数据
	Application *Application
	API         *API
}

// DiffStrategy 对比策略表
type DiffStrategy struct {
	Field string        `gorm:"type:varchar(255);default:'';not null"`  // 字段名 需要与DiffResult里对应
	Code  jsondiff.Code `gorm:"type:varchar(255);default:'';not null;"` // 忽略策略 对应 jsondiff.Code KeyNotExists ValueNotEqual ValueTypeNotEqual ValueArrayLengthNotEqual
	// Strategy   uint8  `gorm:"default:0;not null;"`                   // 0 完全验证 1部分验证 适用于字符部分匹配（todo）
	// StrategyDetail string `gorm:"type:varchar(4000);default:'';not null"` // 如果是部分策略，则为策略描述，例如 {相似度:80%}
	// ApplicationID uint  `gorm:"default:0;not null"` //应用程序ID
	APIID uint `gorm:"default:0;not null"` // 1部分策略时与API关联的ID
	Model
}
