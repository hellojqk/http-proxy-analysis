/*
Copyright © 2020 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package cmd

import (
	"fmt"

	"github.com/hellojqk/refactor/src/core"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// initDBCmd represents the db command
var initDBCmd = &cobra.Command{
	Use:   "db",
	Short: "初始化数据库",
	Long:  `数据库初始化`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("db called")
		core.InitTable()
	},
}

func init() {
	initCmd.AddCommand(initDBCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// initDBCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// initDBCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")

	//配置连接字符串
	initDBCmd.Flags().StringP("connectionString", "c", "", "数据库连接字符串")
	//绑定到viper上
	viper.BindPFlag("connectionString", initDBCmd.Flags().Lookup("connectionString"))

	//三种配置方式
	//第一种环境变量大写
	//CONNECTIONSTRING=AAA go run main.go init db
	//第二种命令行参数
	//go run main.go init db -connectionString aaa
	//第三种配置文件
	//go run main.go init db --config config/config.yaml
}
