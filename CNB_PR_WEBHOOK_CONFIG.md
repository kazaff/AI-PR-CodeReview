# CNB平台PR事件回调配置文档

## 概述

本文档详细说明了如何在CNB平台上配置PR（Pull Request）事件的回调，以便将PR事件实时推送到AI Code Review Assistant服务。通过配置PR事件回调，当代码仓库中有新的PR创建或更新时，CNB平台会自动向指定的URL发送webhook通知。

## 先决条件

1. 已部署的AI Code Review Assistant服务
2. 可公开访问的服务URL
3. CNB平台账号及相应仓库的管理权限
4. 配置好的webhook密钥（用于签名验证）

## 配置步骤

### 1. 获取AI Code Review Assistant服务地址

确保您的AI Code Review Assistant服务已部署并可从公网访问。记录下服务的公网URL，例如：
```
http://your-service-address:3000
```

### 2. 确定webhook端点

AI Code Review Assistant默认监听以下webhook端点：
```
/webhook/pr
```

完整的webhook URL应为：
```
http://your-service-address:3000/webhook/pr
```

### 3. 在CNB平台配置webhook

CNB平台支持通过WebHook插件配置PR事件回调。根据CNB平台文档，配置参数如下：

#### 基本配置参数
- `urls`: 必填，webhook通知地址列表，支持多个地址
- `method`: 可选，HTTP请求方法，支持GET、POST、PUT等，默认为POST
- `content_type`: 可选，HTTP请求的Content-Type，默认为application/json
- `headers`: 可选，自定义HTTP请求头，格式为key=value对的数组
- `valid_response_codes`: 可选，有效的HTTP响应状态码列表，只有返回这些状态码的请求才被视为成功
- `debug`: 可选，是否启用调试模式，true或false，默认为false。启用后将输出详细的请求和响应信息

#### 认证配置参数
- `username`: 可选，HTTP基本认证的用户名
- `password`: 可选，HTTP基本认证的密码
- `token_type`: 可选，认证令牌类型，如Bearer、Token等，默认为Bearer。添加到Authorization请求头，格式为Authorization: ${token_type} ${token_value}
- `token_value`: 可选，认证令牌的值

#### 安全配置参数
- `signature_header`: 可选，签名请求头的名称，用于请求签名验证
- `signature_secret`: 可选，签名密钥，用于生成请求签名
- `skip_verify`: 可选，是否跳过SSL证书验证，默认为false

#### 消息模板
- `template`: 可选，自定义消息模板，用于格式化要发送的消息内容。如果未设置，将使用默认JSON格式

### 4. 在CNB代码仓库中配置PR事件触发

在CNB平台中，您需要在代码仓库的配置文件(.cnb.yml)中设置PR事件触发规则。以下是一个示例配置：

```yaml
main:
  pull_request:
    - name: AI Code Review
      stages:
        - name: Trigger Webhook
          script: |
        # CNB平台会自动将PR事件信息发送到配置的webhook URL
        # 以下是一个curl命令示例，用于手动测试webhook
        curl -X POST "https://your-ai-code-review-service.com/webhook/pr" \
          -H "Content-Type: application/json" \
          -H "x-cnb-signature: sha256=generated_signature" \
          -d '{
            "repository": {
              "name": "example-repo"
            },
            "pull_request": {
              "id": 123,
              "title": "Example PR for testing",
              "description": "This is a test PR to verify webhook functionality",
              "author": "test-user",
              "changes": [
                {
                  "filename": "src/example.js",
                  "content": "console.log(\"Hello, World!\");",
                  "patch": "@@ -1 +1 @@\n-console.log(\"Hello\");\n+console.log(\"Hello, World!\");"
                }
              ]
            }
          }'
        # 实际上，CNB平台会自动处理webhook发送，无需手动编写发送逻辑
        # 这里可以添加其他需要在PR事件触发时执行的自定义逻辑
```

### 5. 设置webhook密钥

为了安全验证webhook请求的真实性，您需要在CNB平台和AI Code Review Assistant中使用相同的webhook密钥。

1. 生成一个安全的webhook密钥（建议使用随机字符串）
2. 在AI Code Review Assistant的环境变量中配置该密钥：
   ```bash
   CNB_WEBHOOK_SECRET=your-generated-secret-key
   ```
3. 在CNB平台的webhook配置中使用相同的密钥作为`signature_secret`

## Webhook事件结构

CNB平台发送的PR事件webhook具有以下结构：

```json
{
  "repository": {
    "name": "example-repo"
  },
  "pull_request": {
    "id": 123,
    "title": "Fix bug in login flow",
    "description": "This PR fixes the authentication issue...",
    "author": "user123",
    "changes": [
      {
        "filename": "src/auth.js",
        "content": "file content here...",
        "patch": "@@ -1,5 +1,5 @@\n-const greeting = 'Hello';\n+const greeting = 'Hello, World!';\n console.log(greeting);"
      }
    ]
  }
}
```

## 签名验证

CNB平台会对webhook请求进行签名以确保安全性。签名通过HMAC SHA256算法生成，具体步骤如下：

1. 使用配置的webhook密钥作为HMAC SHA256的密钥
2. 对请求体的JSON字符串进行签名
3. 将签名结果添加到请求头中（默认为`x-cnb-signature`）

AI Code Review Assistant会自动验证签名的有效性，拒绝未通过验证的请求。

## 测试配置

配置完成后，您可以通过以下方式测试webhook是否正常工作：

1. 在仓库中创建一个新的PR
2. 检查AI Code Review Assistant的日志，确认是否收到webhook请求
3. 验证PR是否被正确分析并生成代码审查评论

## 故障排除

### 常见问题

1. **Webhook未触发**
   - 检查webhook URL是否正确
   - 确认服务是否可从公网访问
   - 验证CNB平台的webhook配置是否正确
   - 检查仓库的.cnb.yml配置文件中是否正确设置了PR事件触发规则

2. **签名验证失败**
   - 确认AI Code Review Assistant和CNB平台使用相同的webhook密钥
   - 检查环境变量是否正确配置

3. **服务无法处理请求**
   - 检查AI Code Review Assistant的日志，查看具体错误信息
   - 确认依赖服务（如AI模型API）是否正常工作

### 日志查看

可以通过以下命令查看AI Code Review Assistant的日志：

```bash
# 如果使用Docker部署
docker logs <container-id>

# 如果直接运行Node.js应用
# 在应用目录下查看控制台输出或日志文件
```

## 相关文档链接

- [CNB Platform API Documentation](https://api.cnb.cool)
- [CNB Developer Portal](https://docs.cnb.cool/en/openapi.html)
- [WebHook Plugin Documentation](https://docs.cnb.cool/en/plugin/#public/cnbcool/webhook)
- [Configuration File Documentation](https://docs.cnb.cool/en/build/configuration.html)

## 注意事项

1. 确保webhook URL可以通过公网访问
2. 妥善保管webhook密钥，避免泄露
3. 根据实际需求调整webhook配置参数
4. 定期检查服务运行状态，确保webhook能够正常处理
5. 在仓库的.cnb.yml配置文件中正确设置PR事件触发规则