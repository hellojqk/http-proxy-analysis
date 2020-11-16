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
	"github.com/hellojqk/http-proxy-analysis/src/service"
	"github.com/spf13/cobra"
)

var (
	name    *string
	oldHost *string
	newHost *string
)

// createAPPCmd represents the app command
var createAPPCmd = &cobra.Command{
	Use:   "app",
	Short: "创建应用",
	Long:  `创建应用`,
	Run: func(cmd *cobra.Command, args []string) {
		err := service.CreateAPP(*name, *oldHost, *newHost)
		if err != nil {
			panic(err)
		}
	},
}

func init() {
	createCmd.AddCommand(createAPPCmd)

	name = createAPPCmd.Flags().StringP("appName", "a", "", "应用名称,create 时指定")
	oldHost = createAPPCmd.Flags().StringP("oldHost", "o", "", "旧应用地址,create 时指定")
	newHost = createAPPCmd.Flags().StringP("newHost", "n", "", "新应用地址,create 时指定")

	createAPPCmd.MarkFlagRequired("appName")
	createAPPCmd.MarkFlagRequired("oldHost")
	// //绑定到viper上
	// viper.BindPFlag("app.name", createAPPCmd.Flags().Lookup("name"))
	// viper.BindPFlag("app.oldHost", createAPPCmd.Flags().Lookup("oldHost"))
	// viper.BindPFlag("app.newHost", createAPPCmd.Flags().Lookup("newHost"))
}
