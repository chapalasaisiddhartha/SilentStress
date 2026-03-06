import json

positive_words = [
    "happy", "joy", "excited", "fantastic", "great", "awesome",
    "good", "amazing", "wonderful", "brilliant", "excellent",
    "love", "laugh", "smile", "fun", "dance", "dancing", "sing",
    "fascinated", "fascinating", "fasticinated", "facinated",
    "interested", "curious", "beautiful", "pretty", "handsome",
    "smart", "clever", "genius", "success", "win", "winning",
    "enjoy", "enjoying", "enjoyed",
    "calm", "peaceful", "relaxed", "serene", "tranquil", "quiet", "still", "gentle",
    "soothing", "comfortable", "cozy", "warm", "safe", "restful",
    "breathe", "inhale", "exhale", "focus", "mindful", "balance",
    "ocean", "waves", "breeze", "forest", "river", "sunset", "rain", "waterfall",
    "harmony", "ease", "relief", "joy", "content", "gratitude",
    "rest", "sleep", "dream", "unwind", "recharge", "restore", "release",
    "soft", "light", "lite", "slow", "meditate", "refresh", "comfort", "healing", "peace",
    "chill", "chilling", "chilled", "ok", "okay", "fine", "alright"
]

negations = [
    "not", "no", "never", "dont", "don't", "isnt", "isn't", "arent", "aren't", 
    "cant", "can't", "wont", "won't", "wouldnt", "wouldn't", "couldnt", "couldn't", 
    "shouldnt", "shouldn't", "wasnt", "wasn't", "werent", "weren't", "aint", "ain't", 
    "didnt", "didn't", "doesnt", "doesn't"
]

templates = [
    "i am {}",
    "i feel {}",
    "feeling {}",
    "i am {} right now",
    "so {} today",
    "really {} now",
    "just {}",
    "{}",
    "i look {}",
    "look {}",
    "i just want to {}",
    "i want to {""}"
]

negative_templates = [
    "i am {} {}",
    "i feel {} {}",
    "feeling {} {}",
    "i am {} {} right now",
    "so {} {} today",
    "really {} {} now",
    "just {} {}",
    "{} {}",
    "i look {} {}",
    "look {} {}",
    "i {} want to {}",
    "i {} feel {}"
]

dataset = []

# Generate all positive iterations (Label 0) heavily weighted
for w in positive_words:
    for t in templates:
        phrase = t.format(w)
        # Append multiple times to artificially boost the ML dictionary weight of these words
        for _ in range(10):
            dataset.append({"text": phrase, "label": 0})
        
# Generate all negated positive iterations (Label 1)
for w in positive_words:
    for neg in negations:
        for t in negative_templates:
            phrase = t.format(neg, w)
            dataset.append({"text": phrase, "label": 1})

# Inject pure standalone negative feedback (Label 1)
bad_standalone = ["waste", "useless", "terrible", "worthless", "sucks", "awful", "horrible", "stupid"]
for bw in bad_standalone:
    for t in templates:
        phrase = t.format(bw)
        dataset.append({"text": phrase, "label": 1})

# Write to file
with open('positive_data.json', 'w') as f:
    json.dump(dataset, f, indent=4)

print(f"Successfully generated {len(dataset)} training samples.")
