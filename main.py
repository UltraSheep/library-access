import requests
from dotenv import dotenv_values

env = dotenv_values()
session = requests.Session() 

cookie_url="https://www.lib.ntnu.edu.tw/index.jsp"
session.post(url=cookie_url)

login_url="https://www.lib.ntnu.edu.tw/profile/authenticate.jsp"
login_params={'userName':env['userName'], 'password':env['password']}
session.post(url=login_url, data=login_params)

vid_url="https://www.lib.ntnu.edu.tw/profile/virtualID.jsp"
session.get(url=vid_url)

qr_url="https://www.lib.ntnu.edu.tw/profile/qrcode.jsp"
qr_response=session.get(url=qr_url)

session.close()

with open(f"qr_code.jpeg", "wb") as f:
    f.write(qr_response.content)

