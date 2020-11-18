package service

import (
	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// ListDiffStrategy .
func ListDiffStrategy() (result []core.DiffStrategy, err error) {
	result = make([]core.DiffStrategy, 0, 1)
	err = core.DB.Find(&result).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("ListDiffStrategy")
		return
	}
	return
}
