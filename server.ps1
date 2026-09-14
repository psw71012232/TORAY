# ==============================================================================
# [웹 서버 스크립트] Windows PowerShell 정적 소켓 웹 서버
# 브라우저 및 외부 터널링(localhost.run, serveo 등) 완벽 대응
# ==============================================================================

param(
    # // 여기 수정: 포트 번호 설정 (기본값: 8080)
    [int]$Port = 8080
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, $Port)
$listener = New-Object System.Net.Sockets.TcpListener($endpoint)

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    $listener.Start()
    Write-Host "[OK] 웹서버가 성공적으로 가동되었습니다!"
    Write-Host "👉 로컬 접속 주소: http://localhost:$Port/"
} catch {
    Write-Host "[오류] 포트 $Port 시작 실패: $_"
    exit 1
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        $buffer = New-Object byte[] 8192
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        
        if ($bytesRead -gt 0) {
            $requestStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
            $lines = $requestStr -split "`r?`n"
            if ($lines.Length -gt 0) {
                $parts = $lines[0] -split " "
                if ($parts.Length -ge 2) {
                    $method = $parts[0].ToUpper()
                    $rawUrl = $parts[1].Split('?')[0].TrimStart('/')
                    $url = [System.Uri]::UnescapeDataString($rawUrl)
                    if ([string]::IsNullOrWhiteSpace($url)) {
                        $url = "index.html"
                    }

                    $filePath = Join-Path $root $url

                    if (Test-Path $filePath -PathType Leaf) {
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                        $content = [System.IO.File]::ReadAllBytes($filePath)
                        
                        $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($content.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                        $hBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($hBytes, 0, $hBytes.Length)
                        if ($method -ne "HEAD") {
                            $stream.Write($content, 0, $content.Length)
                        }
                    } else {
                        $body = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found")
                        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                        $hBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($hBytes, 0, $hBytes.Length)
                        if ($method -ne "HEAD") {
                            $stream.Write($body, 0, $body.Length)
                        }
                    }
                }
            }
        }
        $stream.Flush()
        $stream.Close()
        $client.Close()
    }
} finally {
    $listener.Stop()
}
