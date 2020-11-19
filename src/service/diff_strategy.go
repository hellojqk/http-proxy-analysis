package service

import (
	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// ListDiffStrategy .
func ListDiffStrategy() (result []core.DiffStrategy, err error) {
	result = make([]core.DiffStrategy, 0, 1)
	err = core.DB.Where("status = ?", 1).Find(&result).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("ListDiffStrategy")
		return
	}
	// for i := 0; i < len(result); i++ {
	// 	result[i].Code = string(DiffResultTypeKeyMap[result[i].Ignore])
	// }
	return
}

// InsertDiffStrategy .
func InsertDiffStrategy(model *core.DiffStrategy) (err error) {
	core.DB.Where(model).First(model)
	if model.ID > 0 {
		if model.Status {
			return
		}
		err = core.DB.Model(model).UpdateColumn("status", 1).Error
		return
	}
	model.Status = true
	err = core.DB.Create(model).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("insertDiffStrategy")
		return
	}
	return
}

// DeleteDiffStrategy .
func DeleteDiffStrategy(model *core.DiffStrategy) (err error) {
	err = core.DB.Model(model).UpdateColumn("status", 0).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("deleteDiffStrategy")
		return
	}
	return
}
