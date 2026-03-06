import joblib
import pandas as pd
import numpy as np

# Load our vectorizer and model
vectorizer = joblib.load('vectorizer.pkl')
model = joblib.load('model.pkl')

words = ["happy", "dance", "dancing", "enjoy", "waste", "not", "chill"]

print("Model Log Odds Analysis:")
print("-------------------------")

# Get feature names from TF-IDF
feature_names = vectorizer.get_feature_names_out()

# Get model coefficients (weights)
coefs = model.coef_[0]

for w in words:
    if w in feature_names:
        idx = np.where(feature_names == w)[0][0]
        weight = coefs[idx]
        print(f"'{w}': {weight:.4f} (Positive = Stress, Negative = No Stress)")
    else:
        print(f"'{w}': NOT IN VOCABULARY")
