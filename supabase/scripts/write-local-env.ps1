param([switch]$Force)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$cliPath = Join-Path $projectRoot 'node_modules/.bin/supabase.cmd'
$targetPath = Join-Path $projectRoot '.env.local'
if ((Test-Path -LiteralPath $targetPath) -and -not $Force) {
  throw '.env.local já existe. Revise antes de sobrescrever com -Force.'
}

Push-Location -LiteralPath $projectRoot
try {
  # Capture the whole local status in memory; never display privileged fields.
  $statusText = & $cliPath status -o json 2>$null
  if ($LASTEXITCODE -ne 0) { throw 'Stack local ainda indisponível.' }
  try {
    $status = ($statusText -join "`n") | ConvertFrom-Json
  } catch {
    throw 'Status local inválido; nenhuma saída sensível será exibida.'
  }
  $apiUrl = [string]$status.API_URL
  $publishableKey = [string]$status.PUBLISHABLE_KEY
  if (-not $apiUrl -or -not $publishableKey.StartsWith('sb_publishable_')) {
    $names = ($status.PSObject.Properties.Name -join ', ')
    throw "CLI não retornou API_URL e PUBLISHABLE_KEY atuais. Campos disponíveis (sem valores): $names"
  }
  $parsed = [Uri]$apiUrl
  if ($parsed.Host -notin @('127.0.0.1', 'localhost', '[::1]', '::1')) {
    throw 'A configuração retornada não é loopback; nenhum arquivo foi alterado.'
  }
  $content = "NEXT_PUBLIC_SUPABASE_URL=$apiUrl`nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$publishableKey`n"
  [IO.File]::WriteAllText($targetPath, $content, [Text.UTF8Encoding]::new($false))
  Write-Output '.env.local configurado com URL local e chave publicável. Nenhuma chave privilegiada foi gravada.'
} finally {
  Pop-Location
}
