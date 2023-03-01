package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed public/*
var static embed.FS

func main() {
	public, err := fs.Sub(static, "public")
	if err != nil {
		log.Fatal(err)
	}

	httpListen := fmt.Sprintf(":%v", getEnv("PORT", "8000"))
	http.Handle("/", http.FileServer(http.FS(public)))
	http.HandleFunc("/upload", uploadHandle)

	log.Println("Server Listening on", httpListen)
	log.Fatal(http.ListenAndServe(httpListen, logRequest(http.DefaultServeMux)))
}

func errorResponse(w http.ResponseWriter) {
	w.WriteHeader(400)
	w.Write([]byte(string("Invalid Request")))
}

func getEnv(key, fallback string) string {
	if val, isFound := os.LookupEnv(key); isFound {
		return val
	}
	return fallback
}

func logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s\n", r.RemoteAddr, r.Method, r.URL)
		handler.ServeHTTP(w, r)
	})
}
