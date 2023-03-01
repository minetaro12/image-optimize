FROM golang:1.20.1-alpine3.17 AS builder

WORKDIR /work
COPY . ./
RUN apk add --no-cache alpine-sdk vips-dev && \
    go build

FROM alpine:3.17.2
RUN apk add --no-cache vips
WORKDIR /app
COPY --from=builder /work/image-optimize /app

EXPOSE 8000

ENTRYPOINT ["/app/image-optimize"]