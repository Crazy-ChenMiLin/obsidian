import requests

API_KEY = "tp-cq7mcs1njmx6lb125com9osxqzoo7ewyv67zwtuywdrsbffo"

# 测试不同的 Base URL
urls = [
    "https://token-plan-cn.xiaomimimo.com/v1",
    "https://token-plan-cn.xiaomimimo.com/v1/",
    "https://token-plan-cn.xiaomimimo.com/v1/chat/completions",
]

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

for url in urls:
    print(f"\n测试：{url}")
    try:
        if "/chat/completions" in url:
            response = requests.post(url, headers=headers, json={
                "model": "mimo-v2.5-pro",
                "messages": [{"role": "user", "content": "Hi"}]
            }, timeout=10)
        else:
            response = requests.get(f"{url}/models", headers=headers, timeout=10)
        
        print(f"状态码：{response.status_code}")
        if response.status_code == 200:
            print("✓ 成功!")
        else:
            print(f"响应：{response.text[:200]}")
    except Exception as e:
        print(f"错误：{e}")
