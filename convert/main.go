package convert

import (
	"errors"
	_ "image/gif"

	"github.com/h2non/bimg"
)

func ImgConv(src []byte, t string, q, s int) ([]byte, error) {
	var imgType bimg.ImageType
	if err := checkImgType(t, &imgType); err != nil {
		return nil, err
	}

	// 元の画像のサイズを取得
	width, _, err := getSize(src)
	if err != nil {
		return nil, err
	}

	options := bimg.Options{
		Width:   int(float32(width) * (float32(s) / 100)),
		Quality: q,
		Type:    imgType,
	}

	newImg, err := bimg.NewImage(src).Process(options)
	if err != nil {
		return nil, err
	}

	return newImg, nil
}

// 変換先形式の判定
func checkImgType(t string, dst *bimg.ImageType) error {
	if t == "jpg" || t == "jpeg" {
		*dst = bimg.JPEG
		return nil
	} else if t == "png" {
		*dst = bimg.PNG
		return nil
	} else if t == "webp" {
		*dst = bimg.WEBP
		return nil
	} else {
		return errors.New("invalid image type")
	}
}

func getSize(src []byte) (int, int, error) {
	imgSize, err := bimg.Size(src)
	if err != nil {
		return 0, 0, err
	}

	return imgSize.Width, imgSize.Height, nil
}
