# CIVORA — NLP Complaint Classifier

A standalone, isolated NLP classification module that automatically categorizes civic complaints into one of the five CIVORA departments:

| Label | Department |
|-------|------------|
| `PWD` | Public Works Department (roads, potholes, bridges) |
| `Sanitation` | Garbage, waste, cleanliness |
| `Water Supply` | Water shortage, pipe leaks, contamination |
| `Drainage` | Flooding, blocked drains, sewage overflow |
| `Electricity` | Power cuts, streetlights, transformer issues |

---

## 📁 Folder Structure

```
ai_module/
└── nlp_classifier/
    ├── README.md              ← You are here
    ├── requirements.txt       ← Python dependencies
    ├── train.py               ← Model training script
    ├── predict.py             ← Standalone prediction (test it here)
    ├── app.py                 ← FastAPI microservice
    ├── data/
    │   └── complaints.csv     ← Training dataset (500 rows)
    └── model/
        └── (auto-generated after training)
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Python **3.10.x** (recommended)
- pip

### 2. Create a Virtual Environment
```bash
cd civora/ai_module/nlp_classifier
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Train the Model
```bash
python train.py
```
This will:
- Load `data/complaints.csv`
- Preprocess and vectorize the complaint text
- Train a Logistic Regression classifier
- Save the model + vectorizer to the `model/` folder
- Print accuracy and a full classification report

### 5. Test a Prediction
```bash
python predict.py
```
This runs a set of example complaints through the model and prints the results.

### 6. Run as an API (optional, for integration with Node.js backend)
```bash
uvicorn app:app --reload --port 8000
```
Then POST to `http://localhost:8000/classify`:
```json
{ "complaint": "There is a huge pothole on MG Road" }
```
Response:
```json
{
  "category": "PWD",
  "confidence": 0.94,
  "keywords": ["pothole", "road"]
}
```
