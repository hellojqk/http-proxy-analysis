package dashboard

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/hellojqk/http-proxy-analysis/src/model"
	"github.com/hellojqk/http-proxy-analysis/src/service"
	"github.com/spf13/viper"
)

var cli = http.Client{}

// Run .
func Run() {
	core.InitConn()

	go func() {
		for {
			service.Analysis()
			time.Sleep(time.Second * 10)
		}
	}()

	g := gin.Default()
	group := g.Group("/api")
	g.Static("/assets", "./assets")
	g.Static("/ui", "./ui/dist")
	g.LoadHTMLGlob("./assets/templates/*")
	//查看详情
	g.GET("/proxylog/:id", func(c *gin.Context) {
		proxyLog := &core.ProxyLog{}
		if err := c.ShouldBindUri(proxyLog); err != nil {
			c.String(http.StatusOK, err.Error())
			return
		}
		err := service.GetProxyLog(proxyLog)
		if err != nil {
			c.String(http.StatusOK, err.Error())
			return
		}
		c.HTML(http.StatusOK, "detail.tmpl", gin.H{
			"proxyLog": proxyLog,
		})
	})

	//获取代理日志分页数据
	group.GET("/proxylog", func(c *gin.Context) {
		param := &model.ProxyLogListRequestParam{}
		c.BindQuery(param)
		if param.PageSize <= 0 {
			param.PageSize = 30
		}
		if param.Current <= 0 {
			param.Current = 1
		}
		list, total, err := service.ListProxyLog(param)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		}
		c.JSON(http.StatusOK, gin.H{"total": total, "data": list})
	})

	//重新请求
	group.POST("/proxylog/:id/retry", func(c *gin.Context) {
		proxyLog := &core.ProxyLog{}
		if err := c.ShouldBindUri(proxyLog); err != nil {
			c.String(http.StatusOK, err.Error())
			return
		}
		err := service.GetProxyLog(proxyLog)
		if err != nil {
			c.String(http.StatusOK, err.Error())
			return
		}
		var body io.Reader
		if proxyLog.OldRequestMethod != "GET" {
			body = strings.NewReader(proxyLog.OldRequestBody)
		}
		req, err := http.NewRequest(proxyLog.OldRequestMethod, proxyLog.Application.Host+proxyLog.OldRequestURL, body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		header := http.Header{}
		json.Unmarshal([]byte(proxyLog.OldRequestHeader), &header)
		if header != nil {
			req.Header = header
		}

		_, err = cli.Do(req)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{})
	})

	//获取应用程序数据
	group.GET("/application", func(c *gin.Context) {
		list, err := service.ListAPP(true)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		}
		c.JSON(http.StatusOK, list)
	})

	// //获取应用程序API数据
	// group.GET("/application/:id/api", func(c *gin.Context) {
	// 	list, err := service.ListAPI()
	// 	if err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
	// 	}
	// 	c.JSON(http.StatusOK, list)
	// })

	group.POST("/login/account", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":           "ok",
			"type":             "account",
			"currentAuthority": "admin",
		})
	})
	group.GET("/currentUser", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"name":   "Admin",
			"avatar": "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
			"userid": "00000001",
			"email":  "wy27520@gmail.com",
		})
	})

	g.Run(fmt.Sprintf(":%d", viper.GetInt("dashboardPort")))
}
