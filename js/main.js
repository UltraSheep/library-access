const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

async function getQRCode() {
	dotenv.config();

	const userName = process.env.userName;
	const password = process.env.password;

	if (!userName || !password) {
		console.error("Please set userName and password in your .env file.");
		return;
	}

	let jsessionid = null;

	const session = axios.create({
		withCredentials: true
	});

	try {
		const cookieResponse = await session.post(
			"https://www.lib.ntnu.edu.tw/index.jsp"
		);
		jsessionid = parseJSessionId(cookieResponse.headers["set-cookie"]);

		await session.post(
			"https://www.lib.ntnu.edu.tw/profile/authenticate.jsp",
			{
				userName: userName,
				password: password
			},
			{
				headers: {
					Cookie: `JSESSIONID=${jsessionid}`
				},
				transformRequest: [
					function(data) {
						let ret = "";
						for (let it in data) {
							ret +=
								encodeURIComponent(it) +
								"=" +
								encodeURIComponent(data[it]) +
								"&";
						}
						return ret.slice(0, -1);
					}
				]
			}
		);

		await session.get("https://www.lib.ntnu.edu.tw/profile/virtualID.jsp", {
			headers: {
				Cookie: `JSESSIONID=${jsessionid}`
			}
		});

		const qrResponse = await session.get(
			"https://www.lib.ntnu.edu.tw/profile/qrcode.jsp",
			{
				responseType: "arraybuffer",
				headers: {
					Cookie: `JSESSIONID=${jsessionid}`
				}
			}
		);

		const filePath = path.join(__dirname, "qr_code.jpeg");
		fs.writeFileSync(filePath, Buffer.from(qrResponse.data, "binary"));

		console.log("QR code saved to qr_code.jpeg");
	} catch (error) {
		console.error("Error:", error.message);
		if (error.response) {
			console.error("Response status:", error.response.status);
			console.error("Response data:", error.response.data);
		}
	}
}

function parseJSessionId(setCookieHeaders) {
	if (!setCookieHeaders) return null;
	for (const header of setCookieHeaders) {
		const match = header.match(/JSESSIONID=([^;]+)/);
		if (match) {
			return match[1];
		}
	}
	return null;
}

getQRCode();
