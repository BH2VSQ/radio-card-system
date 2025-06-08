#!/bin/bash

# 自动提交脚本
# 用法: ./auto_commit.sh "提交信息"

if [ -z "$1" ]; then
    echo "错误: 请提供提交信息"
    echo "用法: ./auto_commit.sh \"提交信息\""
    exit 1
fi

# 添加所有更改
git add .

# 检查是否有更改需要提交
if git diff --staged --quiet; then
    echo "没有更改需要提交"
    exit 0
fi

# 提交更改
git commit -m "$1"

# 推送到远程仓库
git push origin main

echo "代码已成功提交并推送到GitHub"

