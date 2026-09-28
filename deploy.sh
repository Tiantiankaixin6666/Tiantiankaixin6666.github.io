#!/usr/bin/env bash
# 一键部署到 GitHub Pages
# 用法：用【Git Bash】运行本脚本（开始菜单搜 "Git Bash"，或文件夹右键 Open Git Bash here）
#   注意：在 PowerShell 里直接跑 `bash deploy.sh` 会用 WSL 的 bash，未装 WSL 会报错；
#        若在 PowerShell，请跳过脚本，直接执行下面三条命令：
#          git branch -M main
#          git remote add origin https://github.com/Tiantiankaixin6666/Tiantiankaixin6666.github.io.git
#          git push -u origin main
# 前提：先在 GitHub 网页新建空仓库，名字必须是 Tiantiankaixin6666.github.io（选 Public）
set -e

cd "$(dirname "$0")"
git branch -M main
git remote add origin https://github.com/Tiantiankaixin6666/Tiantiankaixin6666.github.io.git || \
  git remote set-url origin https://github.com/Tiantiankaixin6666/Tiantiankaixin6666.github.io.git
git push -u origin main

echo "✅ 推送完成。等 1~2 分钟访问 https://tiantiankaixin6666.github.io"
