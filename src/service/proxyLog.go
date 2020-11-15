package service

import (
	"github.com/hellojqk/refactor/src/core"
)

// InsertProwyLog .
func InsertProwyLog(proxyLog *core.ProxyLog) (bool, error) {
	insertResult := core.DB.Create(proxyLog)
	return insertResult.RowsAffected > 0, insertResult.Error
}
