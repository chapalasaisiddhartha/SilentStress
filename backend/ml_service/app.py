import os
import re
import string
import random
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

import nltk
from nltk.stem import WordNetLemmatizer

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Ensure NLTK resources
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)

lemmatizer = WordNetLemmatizer()

# Load Models
current_dir = os.path.dirname(os.path.abspath(__file__))
try:
    vectorizer = joblib.load(os.path.join(current_dir, 'vectorizer.pkl'))
    model = joblib.load(os.path.join(current_dir, 'model.pkl'))
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

# --- INTENTS AND RESPONSES (from Notebook) ---
intents = {
    "identity": [
        "who are you","what are you","what is your name","tell me your name",
        "what should i call you","what is this chatbot","what is this bot",
        "what is this system","what is this program","what is this application",
        "are you a bot","are you ai","are you human","are you real",
        "what kind of chatbot are you"
    ],
    "creator": [
        "who created you","who made you","who developed you","who designed you",
        "who built you","who programmed you","who invented you",
        "who is your developer","which company made you","which organization made you",
        "who worked on you","who is behind you","who coded you","who wrote your code",
        "who trained you"
    ],
    "purpose": [
        "why are you here","what is your purpose","what is your role",
        "what is your job","why were you created","what problem do you solve",
        "what is your goal","why was this chatbot made","why do you exist",
        "what is your main task","why should i talk to you","what is this project about",
        "what do you aim to do","what are you designed for","why was this system built"
    ],
    "ability": [
        "what can you do","how can you help me","can you help me",
        "what are your features","what are your capabilities",
        "what services do you provide","how can you assist me",
        "what support can you give","what can you analyze",
        "can you understand emotions","can you detect stress",
        "can you analyze feelings","can you talk with me",
        "can you chat with me","can you give advice"
    ],
    "technology": [
        "how do you work","how do you analyze messages","how do you detect stress",
        "how do you understand text","how do you process language",
        "what technology do you use","what algorithm do you use",
        "do you use ai","do you use machine learning","do you use deep learning",
        "do you use nlp","what model do you use","what dataset do you use",
        "how were you trained","how were you built"
    ],
    "privacy": [
        "do you store my data","is my data safe","do you save conversations",
        "do you record chats","do you keep my messages",
        "are conversations private","is this conversation confidential",
        "can someone read my messages","are my chats secure",
        "do you share my data","do you collect personal information",
        "do you track users","do you log messages",
        "how do you protect privacy","is this safe to use"
    ],
    "learning": [
        "can you learn","can you improve yourself","can you update yourself",
        "do you learn from conversations","can you become smarter",
        "can you adapt","can you train yourself",
        "do you improve over time","can you upgrade yourself",
        "can you change your answers","do you get better with use",
        "can you gain knowledge","can you evolve","can you grow smarter",
        "can you learn new things"
    ],
    "mental_health": [
        "can you help with stress","can you help with anxiety",
        "can you help with depression","can you support mental health",
        "can you calm me down","can you motivate me",
        "can you reduce stress","can you guide me emotionally",
        "can you support me emotionally","can you make me feel better",
        "can you comfort me","can you help with worries",
        "can you help with overthinking","can you help with sadness",
        "can you help with burnout"
    ],
    "limitations": [
        "are you a therapist","are you a doctor","can you replace a therapist",
        "can you replace a doctor","are you a counselor",
        "are you a mental health expert","are you certified",
        "can you give medical advice","should i rely on you",
        "can you diagnose problems","are you professional help",
        "are you trained medically","can you treat mental illness",
        "are you qualified","should i trust you fully"
    ],
    "general": [
        "can i trust you","are you safe","are you reliable",
        "how accurate are you","how smart are you",
        "how intelligent are you","what version are you",
        "do you speak other languages","can you understand english",
        "can you understand emotions","can you talk naturally",
        "can you understand context","can you follow conversations",
        "can you remember chats","do you know everything"
    ]
}

responses = {
    "identity": [
        "I am SilentStress Detector, an AI chatbot that detects stress in conversations.",
        "I'm a stress detection chatbot built using NLP and machine learning.",
        "I'm an AI system designed to analyze messages and understand emotional stress.",
        "I am a conversational AI created to provide emotional support."
    ],
    "creator": [
        "I was developed as a project using NLP and machine learning techniques.",
        "I was built by developers to help detect stress in text conversations.",
        "I was designed as an AI system to analyze emotional patterns in messages.",
        "I was created to demonstrate how AI can assist with mental wellbeing."
    ],
    "purpose": [
        "My goal is to detect stress in user messages and provide supportive responses.",
        "I aim to identify emotional stress patterns and encourage healthy communication.",
        "I try to help people recognize stress through conversational analysis.",
        "My purpose is to offer early emotional support through text analysis."
    ],
    "ability": [
        "I can analyze your messages and estimate your stress level.",
        "I try to understand emotional patterns in text conversations.",
        "I can detect stress signals and respond with supportive messages.",
        "I can chat with you and provide calming suggestions."
    ],
    "technology": [
        "I use Natural Language Processing and machine learning to analyze messages.",
        "I rely on TF-IDF vectorization and Logistic Regression for stress detection.",
        "I process text using NLP techniques to understand emotional signals.",
        "I analyze patterns in language using machine learning models."
    ],
    "privacy": [
        "I do not permanently store personal conversations.",
        "Your messages are only analyzed temporarily during the chat.",
        "I focus only on analyzing text and do not collect personal identity data.",
        "Your conversation is not shared with anyone."
    ],
    "learning": [
        "I do not learn from individual users in real time.",
        "My knowledge improves when developers update the model.",
        "I remain consistent unless my system is retrained.",
        "I do not automatically adapt from conversations."
    ],
    "mental_health": [
        "I can provide supportive suggestions, but I am not a professional therapist.",
        "I try to help you reflect on stress and encourage positive coping.",
        "I can offer calming suggestions and supportive responses.",
        "I aim to help you recognize stress and talk about it."
    ],
    "limitations": [
        "I am not a licensed therapist or doctor.",
        "I cannot replace professional medical or mental health advice.",
        "I provide general emotional support but not medical diagnosis.",
        "For serious issues, it is best to consult a professional."
    ],
    "general": [
        "I try my best to understand conversations and provide helpful responses.",
        "I aim to be supportive and informative during conversations.",
        "I focus on detecting stress patterns in text messages.",
        "I am designed to assist with emotional awareness."
    ]
}

greetings = [
    "hi","hello","hey","hey there","hello there","hi there","hey buddy","hey friend",
    "good morning","good afternoon","good evening","morning","evening","afternoon",
    "hiya","howdy","greetings","salutations","yo","sup",
    "what's up","whats up","wassup","yo bro","yo dude","hello friend","hi buddy",
    "hello bot","hi bot","hey bot","hi chatbot","hello chatbot","hey chatbot",
    "hello everyone","hi everyone","hey everyone","hello guys","hi guys","hey guys",
    "hello team","hi team","hey team","hello people","hi people","hey people",
    "nice to see you","good to see you","great to see you","long time no see",
    "hello again","hi again","hey again","back again","im back","i am back",
    "good day","have a good day","hope you are well","hope you're well",
    "hope you are doing well","hope you're doing well",
    "how are you","how are you doing","how are you today","how's it going",
    "hows it going","how are things","how's everything",
    "nice meeting you","pleased to meet you","glad to meet you",
    "good to meet you","great to meet you",
    "hello my friend","hi my friend","hey my friend",
    "hello dear","hi dear","hey dear",
    "hey there buddy","hello there friend","hi there friend",
    "hey there bot","hello there bot","hi there bot",
    "hey hey","hello hello","hi hi",
    "good morning everyone","good evening everyone","good afternoon everyone",
    "morning everyone","evening everyone",
    "hello world","hi world","hey world","namaste"
]

low_responses = [
    "You sound relaxed today.",
    "Glad things seem calm for you.",
    "That's nice to hear."
]

medium_responses = [
    "It sounds like you're dealing with something.",
    "I'm here to listen if you want to talk.",
    "Sometimes sharing helps reduce stress."
]

high_responses = [
    "You seem very stressed.",
    "That sounds really overwhelming.",
    "Maybe try taking a slow deep breath."
]



# --- HELPER FUNCTIONS (From Notebook) ---

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words]
    return " ".join(words)

def predict_stress(text):
    cleaned = clean_text(text)
    vector = vectorizer.transform([cleaned])
    prob = model.predict_proba(vector)
    stress_score = prob[0][1] * 100
    return stress_score

def detect_intent(text):
    text = text.lower()
    for intent, questions in intents.items():
        for q in questions:
            if q in text:
                return intent
    return None

def bot_question(text):
    intent = detect_intent(text)
    if intent:
        return random.choice(responses[intent])
    return None

def is_greeting(text):
    text = text.strip().lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text in greetings

def too_short(text):
    return len(text.split()) < 2

def chatbot_response(user_text):
    text = user_text.strip().lower()

    # 1. Greeting
    if is_greeting(text):
        return None, "Hello! How are you feeling today?"

    # 2. Bot Questions
    bot_reply = bot_question(text)
    if bot_reply:
        return None, bot_reply

    # 3. Too Short
    if too_short(text):
        return None, "Could you tell me a bit more?"

    # 4. ML prediction (Purely Model-Based Context)
    stress = predict_stress(user_text)

    if stress < 40:
        reply = random.choice(low_responses)
    elif stress < 75:
        reply = random.choice(medium_responses)
    else:
        reply = random.choice(high_responses)

    return stress, reply

# --- FLASK ENDPOINTS ---

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
        
    user_text = data['text']
    
    stress_level, reply = chatbot_response(user_text)
    
    # Send a fallback stress level if none predicted (e.g for short messages)
    if stress_level is None:
        prediction_label = "Neutral"
        score = 0
    else:
        score = stress_level
        if stress_level < 40:
            prediction_label = "Low"
        elif stress_level < 75:
            prediction_label = "Medium"
        else:
            prediction_label = "High"

    return jsonify({
        'prediction': prediction_label,    
        'stressScore': score,
        'botResponse': reply
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
