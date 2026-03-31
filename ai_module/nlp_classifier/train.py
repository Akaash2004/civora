"""
CIVORA - NLP Complaint Classifier
Train Script

Trains a Logistic Regression classifier on the civic complaints dataset
and saves the model + vectorizer to the model/ folder.

Run:
    python train.py
"""

import os
import re
import string
import pandas as pd
import numpy as np
import joblib
import nltk

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

# ── Download NLTK data (only needed once) ────────────────────────────────────
nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)
from nltk.corpus import stopwords

STOP_WORDS = set(stopwords.words("english"))

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "data", "complaints.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "classifier_pipeline.pkl")
LABELS_PATH = os.path.join(MODEL_DIR, "label_classes.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

# ── Category label mapping (normalise CSV values) ─────────────────────────────
LABEL_MAP = {
    "pwd"          : "PWD",
    "sanitation"   : "Sanitation",
    "water supply" : "Water Supply",
    "drainage"     : "Drainage",
    "electricity"  : "Electricity",
    "other"        : "Other",
}


# ── Text pre-processing ───────────────────────────────────────────────────────
def preprocess(text: str) -> str:
    """Lowercase, remove punctuation, strip stop-words."""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)          # keep only letters/spaces
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 1]
    return " ".join(tokens)


# ── Domain keyword dictionary (boosts classification accuracy) ────────────────
KEYWORD_MAP = {
    "PWD"          : ["pothole", "road", "pavement", "crack", "bridge", "footpath",
                      "broken", "damage", "uneven", "construction", "pit", "surface"],
    "Sanitation"   : ["garbage", "waste", "dustbin", "smell", "drain", "litter",
                      "unclean", "dirty", "sweeping", "overflowing", "dump"],
    "Water Supply" : ["water", "supply", "pipe", "leakage", "shortage", "pressure",
                      "contamination", "burst", "pipeline", "tap", "connection"],
    "Drainage"     : ["drain", "sewage", "flood", "overflow", "clog", "stagnation",
                      "blocked", "sewer", "waterlogging"],
    "Electricity"  : ["electricity", "power", "outage", "streetlight", "electric",
                      "transformer", "pole", "wire", "current", "voltage", "cut"],
    "Other"        : [],
}

def keyword_features(text: str) -> dict:
    """Return a dict of keyword-hit counts per category."""
    text_lower = text.lower()
    return {
        cat: sum(1 for kw in kws if kw in text_lower)
        for cat, kws in KEYWORD_MAP.items()
    }


# ── Load & prepare dataset ────────────────────────────────────────────────────
def load_data(path: str):
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip().str.lower()

    # Accept 'description' or 'complaint_text' or first text column
    text_col = next(
        (c for c in df.columns if c in ("description", "complaint_text", "text", "complaint")),
        df.columns[0],
    )
    label_col = next(
        (c for c in df.columns if c in ("category", "label", "class")),
        df.columns[1],
    )

    df = df[[text_col, label_col]].dropna()
    df.columns = ["text", "label"]

    # Normalise labels
    df["label"] = df["label"].str.strip().str.lower().map(
        lambda x: LABEL_MAP.get(x, x.title())
    )

    print(f"\n✅ Loaded {len(df)} rows from '{path}'")
    print("\nClass distribution:")
    print(df["label"].value_counts().to_string())
    return df


# ── Build & train pipeline ────────────────────────────────────────────────────
def train(df: pd.DataFrame):
    df["clean_text"] = df["text"].apply(preprocess)

    X = df["clean_text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # TF-IDF + Logistic Regression pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),   # unigrams + bigrams
            max_features=5000,
            sublinear_tf=True,    # log(TF) scaling
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=5.0,                # regularisation strength
            solver="lbfgs",
            multi_class="multinomial",
        )),
    ])

    print("\n🚀 Training model …")
    pipeline.fit(X_train, y_train)

    # ── Evaluation ────────────────────────────────────────────────────────────
    y_pred = pipeline.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)

    print(f"\n📊 Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print("Confusion Matrix (rows = actual, cols = predicted):")
    labels = sorted(y.unique())
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=labels, columns=labels)
    print(cm_df.to_string())

    return pipeline, labels


# ── Save model ────────────────────────────────────────────────────────────────
def save_model(pipeline, labels):
    joblib.dump(pipeline, MODEL_PATH)
    joblib.dump(labels,   LABELS_PATH)
    print(f"\n💾 Model saved → {MODEL_PATH}")
    print(f"💾 Labels saved → {LABELS_PATH}")


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    df = load_data(DATA_PATH)
    pipeline, labels = train(df)
    save_model(pipeline, labels)
    print("\n✅ Training complete! Run 'python predict.py' to test the model.")
