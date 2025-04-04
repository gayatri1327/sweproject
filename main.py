from flask import Flask, request, render_template, jsonify, Response
import numpy as np
import pandas as pd
import pickle
from fpdf import FPDF

app = Flask(__name__)

# Load datasets
sym_des = pd.read_csv("dataset/symtom_df.csv")
precautions = pd.read_csv("dataset/precautions_df.csv")
workout = pd.read_csv("dataset/workout_df.csv")
description = pd.read_csv("dataset/description.csv")
medications = pd.read_csv("dataset/medications.csv")
diets = pd.read_csv("dataset/diets.csv")
hospitals_df = pd.read_csv("dataset/HospitalsInIndia.csv")
hospitals_df['Pincode'] = (
    hospitals_df['Pincode']
    .astype(str)
    .str.strip()
    .str.replace(r'\.0$', '', regex=True)  # Remove trailing .0
)

# Load pincode dataset (globally available)
pincode_df = pd.read_csv("dataset/pincode.csv")

# Load model
svc = pickle.load(open('models/svc.pkl', 'rb'))

# -------------------------------
# Helper function for additional info
# -------------------------------
def helper(dis):
    # Get disease description
    desc = description[description['Disease'] == dis]['Description']
    desc = " ".join([w for w in desc])

    # Get precautions (filter out NaN)
    pre = precautions[precautions['Disease'] == dis][['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']]
    pre = [col for col in pre.values[0] if pd.notnull(col)]

    # Get medications list
    med = medications[medications['Disease'] == dis]['Medication']
    med = [m for m in med.values if m]

    # Get diet recommendations
    die = diets[diets['Disease'] == dis]['Diet']
    die = [d for d in die.values if d]

    # Get workout suggestions
    wrkout = workout[workout['disease'] == dis]['workout']
    wrkout = [w for w in wrkout.values if w]

    return desc, pre, med, die, wrkout

# -------------------------------
# Dictionaries for prediction
# -------------------------------
symptoms_dict = {
    'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3,
    'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8,
    'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12,
    'spotting_ urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16,
    'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20,
    'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24,
    'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28,
    'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32,
    'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36,
    'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40,
    'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44,
    'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47,
    'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51,
    'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55,
    'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58, 'pain_during_bowel_movements': 59,
    'pain_in_anal_region': 60, 'bloody_stool': 61, 'irritation_in_anus': 62, 'neck_pain': 63,
    'dizziness': 64, 'cramps': 65, 'bruising': 66, 'obesity': 67, 'swollen_legs': 68,
    'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71,
    'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74,
    'extra_marital_contacts': 75, 'drying_and_tingling_lips': 76, 'slurred_speech': 77,
    'knee_pain': 78, 'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81,
    'swelling_joints': 82, 'movement_stiffness': 83, 'spinning_movements': 84,
    'loss_of_balance': 85, 'unsteadiness': 86, 'weakness_of_one_body_side': 87,
    'loss_of_smell': 88, 'bladder_discomfort': 89, 'foul_smell_of urine': 90,
    'continuous_feel_of_urine': 91, 'passage_of_gases': 92, 'internal_itching': 93,
    'toxic_look_(typhos)': 94, 'depression': 95, 'irritability': 96, 'muscle_pain': 97,
    'altered_sensorium': 98, 'red_spots_over_body': 99, 'belly_pain': 100,
    'abnormal_menstruation': 101, 'dischromic _patches': 102, 'watering_from_eyes': 103,
    'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107,
    'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110,
    'receiving_blood_transfusion': 111, 'receiving_unsterile_injections': 112, 'coma': 113,
    'stomach_bleeding': 114, 'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116,
    'fluid_overload.1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119,
    'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123,
    'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127,
    'inflammatory_nails': 128, 'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131
}

diseases_list = {
    15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis',
    14: 'Drug Reaction', 33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes',
    17: 'Gastroenteritis', 6: 'Bronchial Asthma', 23: 'Hypertension', 30: 'Migraine',
    7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)', 28: 'Jaundice',
    29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A',
    19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E',
    3: 'Alcoholic hepatitis', 36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia',
    13: 'Dimorphic hemmorhoids(piles)', 18: 'Heart attack', 39: 'Varicose veins',
    26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia', 31: 'Osteoarthristis',
    5: 'Arthritis', 0: '(vertigo) Paroymsal  Positional Vertigo', 2: 'Acne',
    38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'
}

# -------------------------------
# Routes
# -------------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route('/about')
def about():
    return render_template("about.html")

@app.route('/contact')
def contact():
    return render_template("contact.html")

@app.route('/developer')
def developer():
    return render_template("developer.html")

@app.route('/blog')
def blog():
    return render_template("blog.html")

# -------------------------------
# Pincode Lookup Endpoint
# -------------------------------
@app.route('/pincode', methods=['GET'])
def get_pincode_details():
    pin = request.args.get('pin')
    if not pin:
        return jsonify({"error": "Please provide a pincode"}), 400

    # Filter the dataframe for the given pincode (convert to string)
    details = pincode_df[pincode_df['Pincode'].astype(str) == pin]
    if details.empty:
        return jsonify({"error": "Pincode not found"}), 404

    return jsonify(details.iloc[0].to_dict())

# -------------------------------
# Prediction Endpoint
# -------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        symptoms = request.form.get('symptoms')
        if not symptoms or symptoms.lower() == "symptoms":
            return jsonify({"error": "Please enter valid symptoms"}), 400

        # Split user input into individual symptoms
        user_symptoms = [s.strip() for s in symptoms.split(',')]
        valid_symptoms = [sym for sym in user_symptoms if sym in symptoms_dict]
        
        if not valid_symptoms:  # Add this validation
            return jsonify({"error": "No valid symptoms recognized"}),400

        # Create an input vector (all zeros) and mark reported symptoms as 1
        input_vector = np.zeros(len(symptoms_dict))
        for sym in user_symptoms:
            if sym in symptoms_dict:
                input_vector[symptoms_dict[sym]] = 1
            else:
                print(f"Warning: Symptom '{sym}' not recognized. Skipping.")

        prediction = svc.predict([input_vector])[0]
        predicted_disease = diseases_list[prediction]

        # Retrieve additional information for the predicted disease
        dis_des, precautions_list, medications_list, rec_diet, workout_list = helper(predicted_disease)

        return jsonify({
            "disease": predicted_disease,
            "description": dis_des,
            "precautions": precautions_list,
            "medications": medications_list,
            "diet": rec_diet,
            "workout": workout_list
        })

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({"error": "Failed to process request"}), 500
@app.route('/search_hospitals', methods=['GET'])
def search_hospitals():
    pincode = request.args.get('pincode', '').strip()
    pincode = ''.join(filter(str.isdigit, pincode)).replace('.0', '')[:6]
    
    try:
        matches = hospitals_df[hospitals_df['Pincode'] == pincode]
        
        if not matches.empty:
            hospitals = (
                matches[['Hospital', 'State', 'City', 'LocalAddress', 'Pincode']]
                .fillna('Not Available')
                .rename(columns={
                    'Hospital': 'name',
                    'State': 'state',        # Lowercase
                    'City': 'city',          # Lowercase
                    'LocalAddress': 'address',
                    'Pincode': 'pincode'     # Lowercase
                })
                .to_dict(orient='records')
            )
            return jsonify({"hospitals": hospitals})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    #abbout
   
# -------------------------------
# PDF Generation Endpoint
# -------------------------------
@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.json
        
        # Create PDF with FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Title
        pdf.cell(200, 10, txt="e-Prescription", ln=1, align='C')
        pdf.ln(10)
        
        # Patient Info
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Patient Information", ln=1)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Name: {data['name']}", ln=1)
        pdf.cell(200, 10, txt=f"Weight: {data['weight']} kg", ln=1)
        pdf.cell(200, 10, txt=f"Date: {data['date']}", ln=1)
        pdf.ln(10)
        
        # Diagnosis Section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Diagnosis", ln=1)
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, txt=f"Disease: {data['disease']}\nDescription: {data['description']}")
        pdf.ln(10)
        
        # Medications Section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Medications", ln=1)
        pdf.set_font("Arial", size=12)
        for med in data['medications']:
            pdf.cell(0, 10, txt=f"- {med}", ln=1)
        pdf.ln(10)
        
        # Recommendations Section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Recommendations", ln=1)
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, txt=f"Precautions: {', '.join(data['precautions'])}")
        pdf.multi_cell(0, 10, txt=f"Diet: {', '.join(data['diet'])}")
        pdf.multi_cell(0, 10, txt=f"Exercise: {', '.join(data['workout'])}")
        
        # Generate PDF output and return as downloadable response
        pdf_output = pdf.output(dest='S').encode('latin1')
        return Response(
            pdf_output,
            mimetype="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=prescription.pdf",
                "Content-Type": "application/pdf"
            }
        )
        
    except Exception as e:
        print(f"PDF Generation Error: {str(e)}")
        return jsonify({"error": "Failed to generate PDF"}), 500

if __name__ == '__main__':
    app.run(debug=True)
