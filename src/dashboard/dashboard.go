package dashboard

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hellojqk/refactor/src/core"
	"github.com/hellojqk/refactor/src/model"
	"github.com/hellojqk/refactor/src/service"
)

// Run .
func Run() {
	core.InitConn()

	g := gin.Default()
	group := g.Group("/api")
	g.Static("/assets", "./assets")
	g.LoadHTMLGlob("./assets/templates/*")
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

	group.GET("/proxylog", func(c *gin.Context) {
		pageParam := &model.PageParam{}
		c.BindQuery(pageParam)
		if pageParam.PageSize <= 0 {
			pageParam.PageSize = 30
		}
		if pageParam.Current <= 0 {
			pageParam.Current = 1
		}
		list, total, err := service.ListProxyLog(pageParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		}
		c.JSON(http.StatusOK, gin.H{"total": total, "data": list})
	})

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

	g.Run(":8888")
}
