package service

import (
	"encoding/base64"
	"fmt"

	"classswift-backend/config"

	"github.com/skip2/go-qrcode"
)

// GenerateClassQRCode generates a QR code (base64) and join URL for a class.
func GenerateClassQRCode(classPublicID string) (joinURL string, base64QR string, err error) {
	joinURL = fmt.Sprintf("%s/api/v1/classes/%s/join", config.BaseURL(), classPublicID)
	qrBytes, err := qrcode.Encode(joinURL, qrcode.Medium, 256)
	if err != nil {
		return "", "", err
	}
	base64QR = base64.StdEncoding.EncodeToString(qrBytes)
	return joinURL, base64QR, nil
}
