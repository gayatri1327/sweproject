import unittest
from flask import Flask, template_rendered, url_for
from contextlib import contextmanager
from main import app, pincode_df
import json
from unittest.mock import patch
import io

@contextmanager
def captured_templates(app):
    recorded = []
    def record(sender, template, context, **extra):
        recorded.append((template, context))
    template_rendered.connect(record, app)
    try:
        yield recorded
    finally:
        template_rendered.disconnect(record, app)

class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
        
    # Helper method for creating test PDF data
    def get_pdf_data(self):
        return {
            "name": "Test User",
            "weight": "70",
            "date": "2024-01-01",
            "disease": "Test Disease",
            "description": "Test Description",
            "precautions": ["precaution1", "precaution2"],
            "medications": ["med1", "med2"],
            "diet": ["diet1", "diet2"],
            "workout": ["workout1", "workout2"]
        }

    # Test index route
    def test_index_route(self):
        with captured_templates(app) as templates:
            response = self.app.get('/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(templates), 1)
            template, context = templates[0]
            self.assertEqual(template.name, 'index.html')

    # Test prediction endpoint with valid symptoms
    @patch('main.svc.predict')
    def test_valid_prediction(self, mock_predict):
        mock_predict.return_value = [15]  # Fungal infection
        
        response = self.app.post('/predict', data={
            'symptoms': 'itching,skin_rash'
        })
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['disease'], 'Fungal infection')
        self.assertTrue(len(data['description']) > 0)
        self.assertEqual(len(data['precautions']), 4)

    # Test prediction endpoint with invalid symptoms
    def test_invalid_prediction(self):
        response = self.app.post('/predict', data={
            'symptoms': 'invalid_symptom'
        })
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', data)

    # Test pincode lookup with valid pincode
    def test_valid_pincode(self):
        test_pincode = pincode_df.iloc[0]['Pincode']
        response = self.app.get(f'/pincode?pin={test_pincode}')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(data['Pincode']), str(test_pincode))
        self.assertIn('StateName', data)

    # Test pincode lookup with invalid pincode
    def test_invalid_pincode(self):
        response = self.app.get('/pincode?pin=000000')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', data)

    # Test PDF generation
    def test_pdf_generation(self):
        test_data = self.get_pdf_data()
        response = self.app.post('/generate_pdf',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, 'application/pdf')
        self.assertIn('prescription.pdf', response.headers['Content-Disposition'])

    # Test medical records persistence
    def test_medical_records_storage(self):
        # This would test the localStorage interactions in the frontend
        # Might need Selenium or other browser automation for full testing
        pass
    def test_symptom_validation(self):
        # Test empty symptoms
        response = self.app.post('/predict', data={'symptoms': ''})
        self.assertEqual(response.status_code, 400)
    
        # Test minimum symptoms
        response = self.app.post('/predict', data={'symptoms': 'itching'})
        self.assertEqual(response.status_code, 200)
    
        # Test maximum symptoms (4)
        response = self.app.post('/predict', data={
            'symptoms': 'itching,skin_rash,nausea,headache'
        })
        self.assertEqual(response.status_code, 200)

    @patch('main.svc.predict')
    def test_prediction_error_handling(self, mock_predict):
        # Test model prediction failure
        mock_predict.side_effect = Exception("Model error")
        response = self.app.post('/predict', data={'symptoms': 'itching'})
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    def test_invalid_pincode(self):
        response = self.app.get('/pincode?pin=000000')
        self.assertEqual(response.status_code, 404)
    

    def test_pincode_route_missing_parameter(self):
        """Test pincode endpoint without required pin parameter"""
        response = self.app.get('/pincode')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    # Test authentication flow
    def test_auth_flow(self):
        # Test registration
        reg_data = {
            'regName': 'Test User',
            'regAge': '30',
            'regEmail': 'test@example.com',
            'regWeight': '70',
            'regPincode': '500001',
            'regPassword': 'Test@123',
            'regConfirm': 'Test@123'
        }
        
        # Would need to mock localStorage or test through browser automation
        pass
    
    @patch('main.FPDF')
    def test_pdf_content_structure(self, mock_fpdf):
        test_data = self.get_pdf_data()
        
        # Call the PDF generation endpoint
        self.app.post('/generate_pdf', json=test_data)
        
        # Verify PDF structure
        mock_instance = mock_fpdf.return_value
        mock_instance.add_page.assert_called_once()
        mock_instance.set_font.assert_any_call("Arial", size=12)
        mock_instance.cell.assert_any_call(200, 10, txt="e-Prescription", ln=1, align='C')  
    def test_max_symptoms(self):
        response = self.app.post('/predict', data={
            'symptoms': 'symptom1,symptom2,symptom3,symptom4,symptom5'
        })
        self.assertEqual(response.status_code, 400)
    
    if __name__ == '__main__':
        unittest.main()