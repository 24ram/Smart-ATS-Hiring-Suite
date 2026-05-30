import urllib.request
import urllib.parse
import json

def test():
    # Login to get token
    data = urllib.parse.urlencode({'username': 'recruiter@smartats.com', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login', data=data)
    with urllib.request.urlopen(req) as response:
        token = json.loads(response.read().decode())['access_token']
    
    # Query applications
    req2 = urllib.request.Request('http://127.0.0.1:8000/api/v1/applications/')
    req2.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req2) as response2:
            apps = json.loads(response2.read().decode())
            print(f"Apps count: {len(apps)}")
            if len(apps) > 0:
                print(apps[0])
    except urllib.error.HTTPError as e:
        print("HTTP ERROR:", e.code)
        print(e.read().decode())

test()
