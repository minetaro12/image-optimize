package main

import (
	"bytes"
	"fmt"
	"image-optimize/convert"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func uploadHandle(w http.ResponseWriter, r *http.Request) {
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		errorResponse(w)
		return
	}

	var quality int
	if r.FormValue("quality") == "" {
		quality = 75
	} else {
		quality, err = strconv.Atoi(r.FormValue("quality"))
		if err != nil {
			errorResponse(w)
			return
		}
	}

	var size int
	if r.FormValue("size") == "" {
		size = 100
	} else {
		size, err = strconv.Atoi(r.FormValue("size"))
		if err != nil {
			errorResponse(w)
			return
		}
	}

	var imgType string
	if r.FormValue("type") == "" {
		imgType = "jpeg"
	} else {
		imgType = r.FormValue("type")
	}

	// バッファに画像データをコピー
	var buffer bytes.Buffer
	io.Copy(&buffer, file)

	// 画像の処理
	dst, err := convert.ImgConv(buffer.Bytes(), imgType, quality, size)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		errorResponse(w)
		return
	}

	// ダウンロードされるようにヘッダーのセット
	w.Header().Add("Content-Disposition", fmt.Sprintf("attachment; filename=%v", url.PathEscape(genFileName(fileHeader.Filename, imgType))))
	w.Write(dst)
}

// hoge.png → hoge_out.webp
func genFileName(n string, ext string) string {
	return strings.TrimSuffix(filepath.Base(n), filepath.Ext(n)) + "_out." + ext
}
