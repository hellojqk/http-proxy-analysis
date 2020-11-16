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
	"github.com/hellojqk/proxy-log/src/dashboard"
	"github.com/spf13/cobra"
)

// runDashboardCmd represents the runDashboard command
var runDashboardCmd = &cobra.Command{
	Use:     "dashboard",
	Aliases: []string{"d"},
	Short:   "运行代理日志汇总平台",
	Long:    `运行代理日志汇总平台`,
	Run: func(cmd *cobra.Command, args []string) {
		dashboard.Run()
	},
}

func init() {
	runCmd.AddCommand(runDashboardCmd)
}
