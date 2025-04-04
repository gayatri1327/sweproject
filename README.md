# 🏥 Expert Doctor - AI-Powered Healthcare Platform  
**Revolutionizing healthcare through machine learning and web technologies**  
*By Gayatri Nutubilli*  

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0.1-green)](https://flask.palletsprojects.com/)

🌐 **Live Demo**: [Expert Doctor Live](https://expert-doctor.herokuapp.com) | 💻 **GitHub**: [github.com/gayatri1327/SWE-ExpertDoctor](https://github.com/gayatri1327/SWE-ExpertDoctor)

![System Demo](demo.gif) <!-- Add your demo GIF here -->

## 🌟 Key Features
- **AI Disease Prediction** (41 diseases, 97% accuracy)
- **Digital Prescription Generation** (PDF download)
- **Medical Records Management** (CRUD operations)
- **Pincode-Based Hospital Search** (50km radius)
- **Secure User Authentication** (JWT/localStorage)
- **Real-Time Symptom Analysis** (132+ symptoms)

## 🚀 Installation
```bash
# Clone repository
git clone https://github.com/gayatri1327/SWE-ExpertDoctor.git

# Install dependencies
pip install -r requirements.txt

# Run Flask application
python main.py
Access at: http://localhost:5000

🛠 Tech Stack
Component	Technologies
Frontend	HTML5, CSS3, JavaScript
Backend	Python Flask
ML Engine	Scikit-learn SVM Classifier
Database	localStorage, CSV datasets
PDF Generator	FPDF Library
Security	JWT, Input Sanitization
📂 Project Structure
Copy
SWE-ExpertDoctor/
├── static/
│   ├── css/              # Style sheets
│   │   └── style.css     # Main CSS
│   └── js/               # Core functionality
│       └── script.js     # Main JavaScript
├── templates/            # UI Components
│   ├── index.html        # Landing page
│   ├── auth-modals/      # Authentication UI
│   └── prescription.html # E-Prescription
├── dataset/              # Medical data
│   ├── HospitalsInIndia.csv
│   ├── medications.csv
│   └── symptoms.csv
├── models/               # ML Models
│   └── svc.pkl          # Trained SVM model
├── requirements.txt     # Dependencies
└── main.py              # Flask entry point
🔗 API Endpoints
Endpoint	Method	Description
/predict	POST	Disease prediction from symptoms
/search_hospitals	GET	Hospital search by pincode
/generate_pdf	POST	Generate PDF prescription
/pincode	GET	Validate Indian pincodes
📊 Machine Learning
SVM Classifier (Accuracy: 97%)

python
Copy
# Prediction workflow
symptoms = ["itching", "skin_rash"]
input_vector = create_feature_vector(symptoms)  # 132-dimension vector
prediction = svc_model.predict([input_vector])
📸 Screenshots
Feature	Preview
Symptom Input	Symptom Input
Prescription	Prescription
Medical Records	Records
🤝 Contributing
Fork the repository

Create feature branch: git checkout -b feature/new-feature

Commit changes: git commit -m 'Add new feature'

Push to branch: git push origin feature/new-feature

Open Pull Request

📜 License
Distributed under MIT License - see LICENSE file

📧 Contact
Gayatri Nutubilli
📧 gayatrinutubilli@gmail.com
🔗 LinkedIn Profile

