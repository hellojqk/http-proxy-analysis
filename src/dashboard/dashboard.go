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

	group.GET("/proxylog", func(c *gin.Context) {
		pageParam := &model.PageParam{}
		c.BindQuery(pageParam)
		if pageParam.PageSize <= 0 {
			pageParam.PageSize = 30
		}
		if pageParam.PageIndex <= 0 {
			pageParam.PageIndex = 1
		}
		list, total, err := service.ListProxyLog(pageParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		}
		c.JSON(http.StatusOK, gin.H{"total": total, "data": list})
	})

	g.Run(":8888")
}
