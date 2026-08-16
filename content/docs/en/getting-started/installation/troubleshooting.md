---
title: Troubleshooting & Fixes
description: Solutions for common installation errors, execution policy blocks, and build warnings.
order: 5
---

# Troubleshooting & Fixes

Resolve common installation and environment issues quickly.

## 1. PowerShell Script Execution Blocked (`PSSecurityException`)

If you encounter `npm.ps1 cannot be loaded because running scripts is disabled on this system`:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

## 2. Turbopack Port Conflicts

If port `3000` is already in use by another process:

```bash
npx next dev -p 3001
```

## 3. Git Missing from PATH on Windows

If Git commit history or live sync does not appear:

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Git\cmd", [EnvironmentVariableTarget]::User)
```
