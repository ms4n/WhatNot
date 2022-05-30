import requests
import json
from decouple import config
from requests.structures import CaseInsensitiveDict

TEST_PHONE_NUMBER_ID = config('TEST_PHONE_NUMBER_ID')
API_ACCESS_TOKEN = config('API_ACCESS_TOKEN')
RECEIVER_PHONE_NUMBER = config('RECEIVER_PHONE_NUMBER')

url = f"https://graph.facebook.com/v13.0/{TEST_PHONE_NUMBER_ID}/messages"

headers = CaseInsensitiveDict()
headers["Authorization"] = f"Bearer {API_ACCESS_TOKEN}"
headers["Content-Type"] = "application/json"

data = {
    "messaging_product": "whatsapp",
    "to": RECEIVER_PHONE_NUMBER,
    "type": "template",
    "template": {"name": "hello_world", "language": {"code": "en_US"}}
}

data = json.dumps(data)

resp = requests.post(url, headers=headers, data=data)

print(resp.status_code, resp.json())
