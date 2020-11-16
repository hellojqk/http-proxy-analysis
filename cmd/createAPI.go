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
	"github.com/hellojqk/proxy-log/src/service"
	"github.com/spf13/cobra"
)

var url *string
var app *string

// createAPICmd represents the api command
var createAPICmd = &cobra.Command{
	Use:   "api",
	Short: "创建API",
	Long:  `创建API，目前仅支持从swagger api文档中导入`,
	Run: func(cmd *cobra.Command, args []string) {
		service.ImportSwaggerDoc(*app, *url)
	},
}

func init() {
	createCmd.AddCommand(createAPICmd)

	app = createAPICmd.Flags().StringP("app", "a", "", "导入应用名称")
	createAPICmd.MarkFlagRequired("app")

	url = createAPICmd.Flags().StringP("url", "u", "", "swagger文档地址")
	createAPICmd.MarkFlagRequired("url")
}
