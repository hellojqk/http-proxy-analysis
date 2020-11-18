FROM hellojqk/alpine:3.12.0

WORKDIR /app

COPY bin/hpa /app/hpa

COPY config /app/config/

COPY assets /app/assets/
COPY ui/dist /app/ui/dist

ENTRYPOINT [ "./hpa" ]
