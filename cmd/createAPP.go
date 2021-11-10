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
	name      *string
	proxyHost *string
	imageHost *string
	main      *string
)

// createAPPCmd represents the app command
var createAPPCmd = &cobra.Command{
	Use:   "app",
	Short: "创建应用",
	Long:  `创建应用`,
	Run: func(cmd *cobra.Command, args []string) {
		err := service.CreateAPP(*name, *proxyHost, *imageHost, *main)
		if err != nil {
			panic(err)
		}
	},
}

func init() {
	createCmd.AddCommand(createAPPCmd)

	name = createAPPCmd.Flags().StringP("appName", "a", "", "应用名称,create 时指定")
	proxyHost = createAPPCmd.Flags().StringP("proxyHost", "p", "", "被代理应用地址,create 时指定")
	imageHost = createAPPCmd.Flags().StringP("imageHost", "i", "", "镜像到应用地址,create 时指定")
	main = createAPPCmd.Flags().StringP("main", "m", "proxy", "proxy 或 image，对比时依哪个站点的数据为主")

	createAPPCmd.MarkFlagRequired("appName")
	createAPPCmd.MarkFlagRequired("proxyHost")
	// //绑定到viper上
	// viper.BindPFlag("app.name", createAPPCmd.Flags().Lookup("name"))
	// viper.BindPFlag("app.proxyHost", createAPPCmd.Flags().Lookup("proxyHost"))
	// viper.BindPFlag("app.imageHost", createAPPCmd.Flags().Lookup("imageHost"))
}
