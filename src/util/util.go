package util

// TimeFormat 时间格式
var TimeFormat = "2006-01-02 15:04:05.000"

// 泛型三元表达式函数
func Ternary[T any](condition bool, trueVal, falseVal T) T {
	if condition {
		return trueVal
	}
	return falseVal
}
