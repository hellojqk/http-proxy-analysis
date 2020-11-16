SET CGO_ENABLED=0
SET GOARCH=amd64
SET GOOS=linux
go build -tags=jsoniter -ldflags "-s -w" -o ./bin/hpa ./main.go
docker build -t hellojqk/http-proxy-analysis:latest .
docker push hellojqk/http-proxy-analysis:latest
