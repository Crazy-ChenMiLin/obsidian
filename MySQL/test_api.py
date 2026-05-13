import requests
import json

# API 配置
API_KEY = "cdd73f5c30490a5aaa8ccbce3d076102:MzYzNzAwNDFkMzM4YWI1MzdkMWWMwM2U4"
MODEL_ID = "astron-code-latest"
API_URL = "https://maas-coding-api.cn-huabei-1.xf-yun.com/v2"

# 构建请求
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

payload = {
    "model": MODEL_ID,
    "messages": [
        {
            "role": "user",
            "content": "你好，请回复'API 测试成功'来确认连接正常。"
        }
    ],
    "max_tokens": 100
}

try:
    print(f"正在测试 API...")
    print(f"模型 ID: {MODEL_ID}")
    print(f"API 地址：{API_URL}")
    print("-" * 50)
    
    response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    
    print(f"状态码：{response.status_code}")
    print(f"响应内容：\n{json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    if response.status_code == 200:
        result = response.json()
        if "choices" in result and len(result["choices"]) > 0:
            message = result["choices"][0]["message"]["content"]
            print(f"\n模型回复：{message}")
            print("\n✓ API 测试成功！")
        else:
            print("\n✗ API 返回格式异常")
    else:
        print(f"\n✗ API 请求失败，状态码：{response.status_code}")
        
except requests.exceptions.Timeout:
    print("请求超时")
except requests.exceptions.RequestException as e:
    print(f"✗ 请求异常：{e}")
except Exception as e:
    print(f"✗ 发生错误：{e}")
