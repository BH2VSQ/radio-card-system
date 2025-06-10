#!/bin/bash

# 定义项目根目录
PROJECT_ROOT="/home/ubuntu/radio-card-system"

# 进入项目目录
cd "$PROJECT_ROOT"

# 添加所有更改
git add .

# 获取当前日期和时间
COMMIT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

# 提交更改
git commit -m "自动提交: $COMMIT_DATE"

# 推送到远程仓库
git push origin main

# 更新PROJECT_STATUS.md文件
# 假设每次提交都会在PROJECT_STATUS.md中添加一行日志
# 实际情况可能需要更复杂的逻辑来更新该文件
# 这里仅作示例，实际更新内容需要根据具体需求调整
# 例如，可以添加一个函数来读取并更新PROJECT_STATUS.md的特定部分

# 获取当前PROJECT_STATUS.md内容
CURRENT_STATUS=$(cat PROJECT_STATUS.md)

# 添加新的部署日志
NEW_LOG="- **$COMMIT_DATE**\n  - 自动提交脚本执行成功。\n  - 项目已更新并推送到GitHub。"

# 将新日志添加到PROJECT_STATUS.md的部署日志部分
# 这里需要找到"### 部署日志"的下一行，然后插入内容
# 这是一个简化的示例，可能需要更健壮的文本处理工具（如awk或sed）
# 为了简单起见，我将直接追加到文件末尾，实际部署日志部分需要精确插入

# 查找部署日志的起始行
DEPLOY_LOG_START_LINE=$(grep -n "### 部署日志" PROJECT_STATUS.md | cut -d: -f1)

if [ -n "$DEPLOY_LOG_START_LINE" ]; then
    # 如果找到部署日志部分，则在其后添加
    # 使用sed在指定行后插入内容
    # DEPLOY_LOG_INSERT_LINE=$((DEPLOY_LOG_START_LINE + 1))
    # sed -i "${DEPLOY_LOG_INSERT_LINE}i\n${NEW_LOG}" PROJECT_STATUS.md
    # 由于sed -i "${line}i" 不支持多行插入，这里采用追加到文件末尾的方式，并在PROJECT_STATUS.md中手动调整
    echo -e "\n${NEW_LOG}" >> PROJECT_STATUS.md
else
    # 如果没有找到部署日志部分，则直接追加到文件末尾
    echo -e "\n### 部署日志\n\n${NEW_LOG}" >> PROJECT_STATUS.md
fi

echo "自动提交脚本执行完毕。"


