package server

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hellojqk/http-proxy-analysis/src/core"
	"github.com/hellojqk/http-proxy-analysis/src/service"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"
)

type responseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (r responseBodyWriter) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

func (r responseBodyWriter) WriteString(s string) (n int, err error) {
	r.body.WriteString(s)
	return r.ResponseWriter.WriteString(s)
}

// Run .
func Run(appName string) {
	core.InitConn()

	app, err := service.GetAPP(appName)

	if err != nil {
		panic(errors.Wrap(err, "cant find app"))
	}

	g := gin.Default()
	g.Use(logResponseBody(app))
	oldHost, _ := url.Parse(app.OldHost)
	proxy := httputil.NewSingleHostReverseProxy(oldHost)
	// proxy.Transport = &http.Transport{
	// 	Proxy: func(*http.Request) (*url.URL, error) {
	// 		return url.Parse("http://127.0.0.1:8899")
	// 	},
	// 	TLSClientConfig: &tls.Config{
	// 		InsecureSkipVerify: true, // 忽略证书验证
	// 	},
	// }
	host := strings.ReplaceAll(app.OldHost, "https://", "")
	host = strings.ReplaceAll(host, "http://", "")
	host = strings.TrimRight(host, "/")
	var handlerFunc = func(c *gin.Context) {
		c.Request.Header.Set("Host", host)
		c.Request.Host = host
		proxy.ServeHTTP(c.Writer, c.Request)
	}
	g.Any("/*action", handlerFunc)

	g.Run(fmt.Sprintf(":%d", viper.GetInt("serverPort")))
}

// parseAry 将url转换成数组 /a/b/c ["a","b","c"]
func parseAry(url string) []string {
	lowURLAry := strings.Split(strings.ToLower(url), "/")
	lowURLTempAry := make([]string, 0, len(lowURLAry))
	for _, v := range lowURLAry {
		if v != "" {
			lowURLTempAry = append(lowURLTempAry, v)
		}
	}
	return lowURLTempAry
}

// getURLInfo
func getURLInfo(app *core.Application) (map[string]*core.API, map[string][]string) {
	var apiInfoMap = make(map[string]*core.API, len(app.APIs))
	var restfulURLMap = make(map[string][]string, len(app.APIs))
	for _, api := range app.APIs {
		lowURL := strings.ToLower(api.URL)
		apiInfoMap[lowURL] = api
		restfulURLMap[lowURL] = parseAry(lowURL)
	}
	return apiInfoMap, restfulURLMap
}

// matchURL 匹配URL对应的api id
func matchURL(apiInfoMap map[string]*core.API, restfulURLMap map[string][]string, requestURL string) *core.API {
	url, err := url.ParseRequestURI(requestURL)
	if err != nil {
		log.Err(err).Msg("url.ParseRequestURI")
	}

	lowPath := strings.ToLower(url.Path)
	var restfulURL string
	_, ok := restfulURLMap[lowPath]
	//如果能直接匹配路由则直接使用
	if ok {
		restfulURL = lowPath
	} else {
		tempPathAry := parseAry(lowPath)

		for key, restfulAry := range restfulURLMap {
			//如果当前路由的长度和配置长度不一致则跳过
			if len(restfulAry) != len(tempPathAry) {
				continue
			}
			match := true
			// tempPathAry /a/b/123/c
			// restfulAry /a/b/{id}/c
			for index, tempItem := range tempPathAry {
				if !match {
					break
				}

				//直接匹配当前项
				if restfulAry[index] == tempItem {
					continue
				}

				//如果最后一位是{证明也能匹配
				if restfulAry[index][0] == '{' {
					if index == len(tempPathAry)-1 || restfulAry[index+1] == tempPathAry[index+1] {
						continue
					}
				}
				match = false
			}
			if match {
				restfulURL = key
			}
		}
	}
	if restfulURL == "" {
		return nil
	}
	return apiInfoMap[restfulURL]
}

var cli = http.DefaultClient

// logResponseBody 记录应用访问信息
func logResponseBody(app *core.Application) gin.HandlerFunc {

	return func(c *gin.Context) {
		//swagger文档地址则跳过处理
		if strings.HasPrefix(c.Request.RequestURI, "/swagger") {
			c.Next()
			return
		}
		apiInfoMap, restfulURLMap := getURLInfo(app)
		apiInfo := matchURL(apiInfoMap, restfulURLMap, c.Request.RequestURI)

		w := &responseBodyWriter{body: &bytes.Buffer{}, ResponseWriter: c.Writer}
		c.Writer = w

		proxyLog := &core.ProxyLog{
			ApplicationID:    app.ID,
			OldRequestMethod: c.Request.Method,
			Status:           true,
		}
		if apiInfo != nil {
			proxyLog.APIID = apiInfo.ID
		}

		//记录请求信息参数
		requestData, err := c.GetRawData()
		if err != nil {
			log.Err(err).Msg("c.GetRawData()")
		}
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestData))

		proxyLog.OldRequestBody = string(requestData)
		proxyLog.OldRequestURL = c.Request.RequestURI

		requestHeaderBts, err := json.Marshal(c.Request.Header)
		if err != nil {
			log.Err(err).Msg("json.Marshal(c.Request.Header)")
		}
		proxyLog.OldRequestHeader = string(requestHeaderBts)

		oldBeginTime := time.Now().UnixNano()
		c.Next()
		proxyLog.OldResponseStatus = c.Writer.Status()
		responseHeaderBts, err := json.Marshal(c.Writer.Header())
		if err != nil {
			log.Err(err).Msg("json.Marshal(c.Writer.Header())")
		}
		proxyLog.OldResponseHeader = string(responseHeaderBts)

		// 判断返回信息是否压缩
		contentEncoding := c.Writer.Header().Get("Content-Encoding")
		switch strings.ToLower(contentEncoding) {
		case "gzip":
			reader, _ := gzip.NewReader(w.body)
			if reader != nil {
				readerBts, _ := ioutil.ReadAll(reader)
				proxyLog.OldResponseBody = string(readerBts)
			}
		// todo 支持其他压缩算法
		default:
			proxyLog.OldResponseBody = w.body.String()
		}
		proxyLog.OldDuration = (time.Now().UnixNano() - oldBeginTime) / 1e6

		//配置了新的站点，接口不在配置列表里默认允许get镜像，接口在配置列表里则按照配置是否允许镜像
		if app.NewHost != "" && ((apiInfo == nil && c.Request.Method == "GET") ||
			(apiInfo != nil &&
				((c.Request.Method == "GET" && apiInfo.GETAllowMirror) ||
					(c.Request.Method == "POST" && apiInfo.POSTAllowMirror) ||
					(c.Request.Method == "PUT" && apiInfo.PUTAllowMirror) ||
					(c.Request.Method == "PATCH" && apiInfo.PATCHAllowMirror) ||
					(c.Request.Method == "DELETE" && apiInfo.DELETEAllowMirror)))) {
			newRequest, err := http.NewRequest(c.Request.Method, app.NewHost+c.Request.RequestURI, bytes.NewReader(requestData))
			if err != nil {
				log.Err(err).Msg("http.NewRequest")
			}
			newRequest.Header = c.Request.Header
			newBeginTime := time.Now().UnixNano()
			//发送镜像请求
			newResponse, err := cli.Do(newRequest)
			if err != nil {
				log.Err(err).Msg("cli.Do(newRequest)")
			}
			if newResponse != nil {
				proxyLog.NewDuration = (time.Now().UnixNano() - newBeginTime) / 1e6
				proxyLog.NewResponseStatus = newResponse.StatusCode
				newResponseHeaderBts, err := json.Marshal(newResponse.Header)
				proxyLog.NewResponseHeader = string(newResponseHeaderBts)

				newResponseBody, err := ioutil.ReadAll(newResponse.Body)
				if err != nil {
					log.Err(err).Msg("ioutil.ReadAll(newResponse.Body)")
				}
				proxyLog.NewResponseBody = string(newResponseBody)
			}
		}
		fmt.Println(proxyLog.OldResponseStatus)
		fmt.Println(proxyLog.OldResponseHeader)
		fmt.Println(proxyLog.OldResponseBody)
		result, err := service.InsertProwyLog(proxyLog)
		if !result {
			log.Err(err).Msg("WriteLog Failed")
		}
	}
}
