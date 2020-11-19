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
	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/hellojqk/http-proxy-analysis/src/model"
	"github.com/hellojqk/http-proxy-analysis/src/service"
	"github.com/spf13/cobra"
)

// getProxyLogCmd represents the getProxyLog command
var getProxyLogCmd = &cobra.Command{
	Use:   "proxylog",
	Short: "代理日志",
	Long:  `代理日志`,
	Run: func(cmd *cobra.Command, args []string) {
		core.InitConn()
		service.ListProxyLog(&model.ProxyLogListRequestParam{ProxyLog: core.ProxyLog{
			OldRequestURL: "cost",
		}, PageParam: model.PageParam{PageSize: 10}})
	},
}

func init() {
	getCmd.AddCommand(getProxyLogCmd)

	// Here you will define your flags and configuration settings.v

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// getProxyLogCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// getProxyLogCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
