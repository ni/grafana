package middleware

import (
	"bufio"
	"compress/gzip"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/grafana/grafana/pkg/web"
)

type gzipResponseWriter struct {
	w *gzip.Writer
	web.ResponseWriter
}

func (grw *gzipResponseWriter) WriteHeader(c int) {
	grw.Header().Del("Content-Length")
	grw.ResponseWriter.WriteHeader(c)
}

func (grw gzipResponseWriter) Write(p []byte) (int, error) {
	if grw.Header().Get("Content-Type") == "" {
		grw.Header().Set("Content-Type", http.DetectContentType(p))
	}
	grw.Header().Del("Content-Length")
	return grw.w.Write(p)
}

func (grw gzipResponseWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	if hijacker, ok := grw.ResponseWriter.(http.Hijacker); ok {
		return hijacker.Hijack()
	}
	return nil, nil, fmt.Errorf("GZIP ResponseWriter doesn't implement the Hijacker interface")
}

type matcher func(s string) bool

func prefix(p string) matcher { return func(s string) bool { return strings.HasPrefix(s, p) } }
func substr(p string) matcher { return func(s string) bool { return strings.Contains(s, p) } }

var gzipIgnoredPaths = []matcher{
	prefix("/apis"), // apiserver handles its own compression https://github.com/kubernetes/kubernetes/blob/b60e01f881aa8a74b44d0ac1000e4f67f854273b/staging/src/k8s.io/apiserver/pkg/endpoints/handlers/responsewriters/writers.go#L155-L158
	prefix("/api/datasources"),
	prefix("/api/plugins"),
	prefix("/api/plugin-proxy/"),
	prefix("/api/gnet/"), // Already gzipped by grafana.com.
	prefix("/metrics"),
	prefix("/api/live/ws"),   // WebSocket does not support gzip compression.
	prefix("/api/live/push"), // WebSocket does not support gzip compression.
	substr("/resources"),
}

var gzipWriterPool = sync.Pool{
	New: func() interface{} {
		gz, _ := gzip.NewWriterLevel(io.Discard, gzip.DefaultCompression)
		// compress/gzip lazily initializes the internal flate.compressor on the
		// first Write() call. Pre-warm it here so that after Reset(), gzip.Write()
		// finds a non-nil compressor and calls compressor.Reset() (cheap) instead
		// of flate.NewWriter() (allocates ~320 KB). Without this, every writer
		// created after a GC pool drain triggers flate.NewWriter during the request.
		gz.Flush()           // triggers compressor init via internal Write(nil)
		gz.Reset(io.Discard) // compressor is preserved through Reset; stream state cleared
		return gz
	},
}

func Gziper() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			requestPath := req.URL.RequestURI()

			for _, pathMatcher := range gzipIgnoredPaths {
				if pathMatcher(requestPath) {
					next.ServeHTTP(rw, req)
					return
				}
			}

			if !strings.Contains(req.Header.Get("Accept-Encoding"), "gzip") {
				next.ServeHTTP(rw, req)
				return
			}

			gz := gzipWriterPool.Get().(*gzip.Writer)
			gz.Reset(rw)
			grw := &gzipResponseWriter{gz, rw.(web.ResponseWriter)}
			grw.Header().Set("Content-Encoding", "gzip")
			grw.Header().Set("Vary", "Accept-Encoding")

			defer func() {
				// We can't really handle close errors at this point and we can't report them to the caller.
				// Reset clears z.err on next use, so putting a closed/errored writer back is safe.
				_ = gz.Close()
				// Reset to io.Discard before returning to pool so the pool does not
				// hold a reference to rw (and its backing connection buffers) longer
				// than the lifetime of this request.
				gz.Reset(io.Discard)
				gzipWriterPool.Put(gz)
			}()

			next.ServeHTTP(grw, req)
		})
	}
}
