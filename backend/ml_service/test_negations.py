import json
import requests

messages = [
    "i am not happy",
    "i am happy",
    "i do not want to dance",
    "not feeling wonderful",
    "i am not relaxed",
    "not calm at all",
    "not feeling lite"
]

print("Testing messages against the Flask API...")

for msg in messages:
    print(f"\n--- \"{msg}\" ---")
    try:
        response = requests.post("http://localhost:5002/predict", json={"text": msg})
        if response.status_code == 200:
            data = response.json()
            print(f"Prediction: {data.get('prediction')}")
            print(f"Stress Score: {round(data.get('stressScore', 0), 2)}")
            print(f"Reply:      {data.get('botResponse')}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")
