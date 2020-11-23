package service

import (
	"github.com/hellojqk/http-proxy-analysis/src/entity"
	"github.com/hellojqk/http-proxy-analysis/src/repository"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// ListDiffStrategy .
func ListDiffStrategy() (result []entity.DiffStrategy, err error) {
	result = make([]entity.DiffStrategy, 0, 1)
	err = repository.DB.Where("status = ?", 1).Find(&result).Error
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
func InsertDiffStrategy(model *entity.DiffStrategy) (err error) {
	repository.DB.Where(model).First(model)
	if model.ID > 0 {
		if model.Status {
			return
		}
		err = repository.DB.Model(model).UpdateColumn("status", 1).Error
		return
	}
	model.Status = true
	err = repository.DB.Create(model).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("insertDiffStrategy")
		return
	}
	return
}

// DeleteDiffStrategy .
func DeleteDiffStrategy(model *entity.DiffStrategy) (err error) {
	err = repository.DB.Model(model).UpdateColumn("status", 0).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Err(err).Msg("deleteDiffStrategy")
		return
	}
	return
}
