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
	"github.com/hellojqk/http-proxy-analysis/src/repository"
	"github.com/hellojqk/http-proxy-analysis/src/service"
	"github.com/spf13/cobra"
)

// runAnalysisCmd represents the runAnalysis command
var runAnalysisCmd = &cobra.Command{
	Use:     "analysis",
	Aliases: []string{"a"},
	Short:   "分析",
	Long:    `运行分析命令`,
	Run: func(cmd *cobra.Command, args []string) {
		repository.InitConn()
		service.Analysis()
	},
}

func init() {
	runCmd.AddCommand(runAnalysisCmd)
}
