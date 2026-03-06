import pandas as pd
import os

dataset_path = r"C:\Users\Siddhartha\Downloads\archive (3)"

try:
    twitter = pd.read_csv(os.path.join(dataset_path, "Twitter_Full.csv"), sep=";")
    print("Twitter DB Size:", len(twitter))
    
    reddit_combi = pd.read_csv(os.path.join(dataset_path, "Reddit_Combi.csv"), sep=";")
    print("Reddit Combi DB Size:", len(reddit_combi))
    
    reddit_title = pd.read_csv(os.path.join(dataset_path, "Reddit_Title.csv"), sep=";")
    print("Reddit Title DB Size:", len(reddit_title))
except Exception as e:
    print(e)
    
positive_data = pd.read_json("positive_data.json")
print("New Synthetic Positive/Negation Data Size:", len(positive_data))
