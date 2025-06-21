package model

// QRCodeData contains QR code and join link information.
type QRCodeData struct {
	QRCodeBase64 string `json:"qrCodeBase64"`
	JoinLink     string `json:"joinLink"`
	ClassID      string `json:"classId"`
}
