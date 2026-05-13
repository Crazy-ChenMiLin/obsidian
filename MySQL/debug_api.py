import requests

# 使用新的 API Key
API_KEY = "tp-cq7mcs1njmx6lb125com9osxqzoo7ewyv67zwtuywdrsbffo"
BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1"

print(f"\n测试连接：{BASE_URL}/models")

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

try:
    response = requests.get(f"{BASE_URL}/models", headers=headers, timeout=20)
    print(f"状态码：{response.status_code}")
    print(f"响应内容：{response.text[:500]}")
except Exception as e:
    print(f"错误：{e}")
