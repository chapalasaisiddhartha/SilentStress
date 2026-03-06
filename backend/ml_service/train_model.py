import pandas as pd
import numpy as np
import re
import os
import joblib

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Ensure NLTK resources are available
nltk.download('punkt')
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    # We explicitly do NOT use stop_words here anymore.
    # To rely on pure ML for negations, the model MUST see the words "not", "no", "won't", etc.
    words = [lemmatizer.lemmatize(w) for w in words]
    return " ".join(words)

def main():
    print("Loading datasets...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "dataset")
    
    reddit_combi = pd.read_csv(os.path.join(dataset_path, "Reddit_Combi.csv"), sep=";")
    reddit_title = pd.read_csv(os.path.join(dataset_path, "Reddit_Title.csv"), sep=";")
    twitter_non = pd.read_csv(os.path.join(dataset_path, "Twitter_ Non-Advert-Tabelle 1.csv"), sep=";")
    twitter_full = pd.read_csv(os.path.join(dataset_path, "Twitter_Full.csv"), sep=";")

    df1 = reddit_combi[["Body_Title","label"]]
    df1 = df1.rename(columns={"Body_Title":"text"})

    df2 = reddit_title[["title","label"]]
    df2 = df2.rename(columns={"title":"text"})

    df3 = twitter_non[["text","label"]]

    df4 = twitter_full[["text","labels"]]
    df4 = df4.rename(columns={"labels":"label"})

    print("Loading positive reinforcement dataset...")
    try:
        positive_data = pd.read_json(os.path.join(os.path.dirname(__file__), "positive_data.json"))
        df_positive = positive_data[["text", "label"]]
        # Duplicate the dataset significantly to ensure the ML model prioritizes these specific edge-cases over Reddit noise
        df_positive = pd.concat([df_positive] * 30, ignore_index=True)
    except Exception as e:
        print(f"Warning: Could not load positive_data.json: {e}")
        df_positive = pd.DataFrame(columns=["text", "label"])

    print("Merging datasets...")
    # Drop duplicates on the raw social media data first
    social_media_data = pd.concat([df1, df2, df3, df4], ignore_index=True)
    social_media_data = social_media_data.dropna().drop_duplicates()
    
    # Merge with our custom positive data (which relies on deliberate duplicates for weighting)
    data = pd.concat([social_media_data, df_positive], ignore_index=True)
    data = data.reset_index(drop=True)

    print("Cleaning text (this might take a minute)...")
    data["text"] = data["text"].apply(clean_text)

    X_train, X_test, y_train, y_test = train_test_split(
        data["text"], data["label"], test_size=0.2, random_state=42
    )

    print("Vectorizing...")
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1,2))
    X_train_vec = vectorizer.fit_transform(X_train)
    # X_test_vec = vectorizer.transform(X_test)

    print("Training the Logistic Regression model...")
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vec, y_train)

    print("Saving vectorizer and model...")
    joblib.dump(vectorizer, os.path.join(os.path.dirname(__file__), 'vectorizer.pkl'))
    joblib.dump(model, os.path.join(os.path.dirname(__file__), 'model.pkl'))
    
    print("Done! model.pkl and vectorizer.pkl have been created successfully.")

if __name__ == "__main__":
    main()
