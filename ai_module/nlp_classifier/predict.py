"""
CIVORA - NLP Complaint Classifier
Prediction Module

Loads the trained pipeline and exposes a `classify()` function.
Also runs a set of example complaints when executed directly.

Run:
    python predict.py
"""

import os
import re
import joblib
import nltk

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords

STOP_WORDS = set(stopwords.words("english"))

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "model", "classifier_pipeline.pkl")
LABELS_PATH = os.path.join(BASE_DIR, "model", "label_classes.pkl")

# ── Keyword dictionary (used for keyword extraction in the response) ───────────
KEYWORD_MAP = {
    "PWD"          : ["pothole", "road", "pavement", "crack", "bridge", "footpath",
                      "broken", "damage", "uneven", "construction", "pit", "surface"],
    "Sanitation"   : ["garbage", "waste", "dustbin", "smell", "litter",
                      "unclean", "dirty", "sweeping", "overflowing", "dump"],
    "Water Supply" : ["water", "supply", "pipe", "leakage", "shortage", "pressure",
                      "contamination", "burst", "pipeline", "tap", "connection"],
    "Drainage"     : ["drain", "sewage", "flood", "overflow", "clog", "stagnation",
                      "blocked", "sewer", "waterlogging"],
    "Electricity"  : ["electricity", "power", "outage", "streetlight", "electric",
                      "transformer", "pole", "wire", "current", "voltage", "cut"],
    "Other"        : [],
}


# ── Pre-processing (must match train.py) ─────────────────────────────────────
def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 1]
    return " ".join(tokens)


def extract_keywords(text: str, category: str) -> list[str]:
    """Return domain keywords found in the raw complaint text."""
    text_lower = text.lower()
    words      = KEYWORD_MAP.get(category, [])
    return [kw for kw in words if kw in text_lower]


# ── Load model (lazy, singleton pattern) ─────────────────────────────────────
_pipeline = None
_labels   = None

def _load_model():
    global _pipeline, _labels
    if _pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not found. Please run 'python train.py' first."
            )
        _pipeline = joblib.load(MODEL_PATH)
        _labels   = joblib.load(LABELS_PATH)
    return _pipeline, _labels


# ── Public classify function ──────────────────────────────────────────────────
def classify(complaint: str) -> dict:
    """
    Classify a civic complaint.

    Args:
        complaint: Raw complaint text from the user.

    Returns:
        {
            "category":   str,         # predicted department label
            "confidence": float,       # probability 0-1
            "keywords":   list[str],   # matched domain keywords
            "all_scores": dict         # confidence per category
        }
    """
    pipeline, labels = _load_model()

    clean = preprocess(complaint)
    proba = pipeline.predict_proba([clean])[0]

    # Map probabilities to label names
    clf_labels  = pipeline.classes_
    scores      = {lbl: round(float(p), 4) for lbl, p in zip(clf_labels, proba)}

    predicted   = max(scores, key=scores.get)
    confidence  = scores[predicted]
    keywords    = extract_keywords(complaint, predicted)

    return {
        "category"  : predicted,
        "confidence": confidence,
        "keywords"  : keywords,
        "all_scores": scores,
    }


# ── Demo / manual test ────────────────────────────────────────────────────────
SAMPLE_COMPLAINTS = [
    "There is a huge pothole on MG Road near the bus stop",
    "Garbage has not been collected for 5 days and it is overflowing",
    "No water supply in our area since yesterday morning",
    "The drain near our colony is completely blocked and water is flooding the street",
    "The streetlight on Main Street has been broken for a week now",
    "Illegal construction is happening next to the park",
    "Sewage is overflowing onto the road near Block A",
    "Water pipe burst near the school and road is damaged",
    "Frequent power cuts every evening in Anna Nagar",
    "Uneven road surface and cracks near Gandhi Nagar junction",
]

if __name__ == "__main__":
    print("=" * 65)
    print("  CIVORA — NLP Complaint Classifier  |  Live Demo")
    print("=" * 65)

    for complaint in SAMPLE_COMPLAINTS:
        result = classify(complaint)
        print(f"\n📝 Complaint : {complaint}")
        print(f"   ✅ Category  : {result['category']}  ({result['confidence']*100:.1f}%)")
        print(f"   🔑 Keywords  : {result['keywords'] or ['(none detected)']}")

    print("\n" + "=" * 65)
    print("Demo complete. Integrate classify() into your FastAPI app.")
