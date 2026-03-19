$ErrorActionPreference = "Stop"

$serviceName = "pocket-gull"
$region = "us-west1"

Write-Host "Target Service: $serviceName ($region)"
Write-Host "Fetching active serving revisions..."

# Retrieve revisions that are currently allocated traffic
$rawActiveRevisions = gcloud run services describe $serviceName --region $region --format="value(status.traffic.revisionName)"
$activeRevisions = $rawActiveRevisions -split '\s+' | Where-Object { $_.Trim() -ne "" }

if (-not $activeRevisions) {
    Write-Host "Error: Could not determine active revisions. Exiting for safety." -ForegroundColor Red
    exit
}

Write-Host "Protecting active revision(s):" -ForegroundColor Green
$activeRevisions | ForEach-Object { Write-Host " - $_" -ForegroundColor Green }

Write-Host "`nFetching all historical revisions..."
$rawAllRevisions = gcloud run revisions list --service $serviceName --region $region --format="value(metadata.name)"
$allRevisions = $rawAllRevisions -split '\s+' | Where-Object { $_.Trim() -ne "" }

$deletedCount = 0

foreach ($rev in $allRevisions) {
    if ($rev -notin $activeRevisions) {
        Write-Host "Deleting inactive revision: $rev" -ForegroundColor Yellow
        # The --quiet flag auto-confirms the deletion prompt
        gcloud run revisions delete $rev --region $region --quiet
        $deletedCount++
    }
}

if ($deletedCount -eq 0) {
    Write-Host "`nNo older inactive builds found! Your cloud is sparkling clean." -ForegroundColor Cyan
} else {
    Write-Host "`nCleanup complete! Safely deleted $deletedCount older builds." -ForegroundColor Green
}
