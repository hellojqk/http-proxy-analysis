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
	"github.com/hellojqk/refactor/src/server"
	"github.com/spf13/cobra"
)

var serverName *string

// runServerCmd represents the runServer command
var runServerCmd = &cobra.Command{
	Use:     "server",
	Aliases: []string{"s"},
	Short:   "运行代理服务端",
	Long:    `启动一个代理服务器`,
	Run: func(cmd *cobra.Command, args []string) {
		server.Run(*serverName)
	},
}

func init() {
	runCmd.AddCommand(runServerCmd)
	serverName = runServerCmd.Flags().StringP("appName", "a", "", "应用名称")
	runServerCmd.MarkFlagRequired("appName")
}
