"""
Flask API Server for AI Service
REST API endpoints for all AI operations
"""
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from ai_service import get_ai_service
from utils import setup_logging, is_valid_file, get_file_ext

# Setup logging
setup_logging(
    log_level=getattr(logging, Config.LOG_LEVEL, logging.INFO)
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_FILE_SIZE

# Get AI service
ai_service = get_ai_service()

# ===================== UTILITY ENDPOINTS =====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        status = ai_service.health_check()
        return jsonify(status), 200
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/capabilities', methods=['GET'])
def get_capabilities():
    """Get service capabilities"""
    try:
        capabilities = ai_service.get_capabilities()
        return jsonify({
            'success': True,
            'capabilities': capabilities
        }), 200
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===================== RESUME ENDPOINTS =====================

@app.route('/api/resume/parse', methods=['POST'])
def parse_resume():
    """Parse resume from file upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Parse resume
        result = ai_service.parse_resume(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error parsing resume: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resume/score', methods=['POST'])
def score_resume():
    """Score resume against job requirements"""
    try:
        data = request.get_json()
        
        if not data or 'parsed_resume' not in data or 'job_requirements' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = ai_service.score_resume(
            data['parsed_resume'],
            data['job_requirements']
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error scoring resume: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resume/summary', methods=['POST'])
def generate_resume_summary():
    """Generate resume summary"""
    try:
        data = request.get_json()
        
        if not data or 'parsed_resume' not in data:
            return jsonify({'success': False, 'error': 'Missing parsed_resume'}), 400
        
        result = ai_service.generate_resume_summary(data['parsed_resume'])
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating resume summary: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===================== ASSESSMENT ENDPOINTS =====================

@app.route('/api/assessment/coding', methods=['POST'])
def analyze_coding():
    """Analyze coding solution"""
    try:
        data = request.get_json()
        
        if not data or 'code' not in data or 'problem' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = ai_service.analyze_coding_challenge(
            data['code'],
            data['problem']
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/assessment/mcq', methods=['POST'])
def analyze_mcq():
    """Analyze MCQ test responses"""
    try:
        data = request.get_json()
        
        if not data or 'questions' not in data or 'answers' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = ai_service.analyze_mcq_test(
            data['questions'],
            data['answers']
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing MCQ: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/assessment/design', methods=['POST'])
def analyze_design():
    """Analyze system design"""
    try:
        data = request.get_json()
        
        if not data or 'design' not in data or 'requirements' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = ai_service.analyze_system_design(
            data['design'],
            data['requirements']
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing design: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/assessment/case-study', methods=['POST'])
def analyze_case():
    """Analyze case study response"""
    try:
        data = request.get_json()
        
        if not data or 'case' not in data or 'solution' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = ai_service.analyze_case_study(
            data['case'],
            data['solution']
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing case study: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/assessment/report', methods=['POST'])
def generate_report():
    """Generate assessment report"""
    try:
        data = request.get_json()
        
        if not data or 'results' not in data:
            return jsonify({'success': False, 'error': 'Missing assessment results'}), 400
        
        result = ai_service.generate_assessment_report(data['results'])
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===================== INTERVIEW ENDPOINTS =====================

@app.route('/api/interview/analyze', methods=['POST'])
def analyze_interview():
    """Analyze interview session"""
    try:
        data = request.get_json()
        
        if not data or 'transcript' not in data:
            return jsonify({'success': False, 'error': 'Missing transcript'}), 400
        
        result = ai_service.analyze_interview(
            data['transcript'],
            data.get('details', {})
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing interview: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/interview/answer', methods=['POST'])
def analyze_answer():
    """Analyze individual interview answer"""
    try:
        data = request.get_json()
        
        if not data or 'question' not in data or 'answer' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = ai_service.analyze_interview_answer(
            data['question'],
            data['answer']
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing answer: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/interview/performance-prediction', methods=['POST'])
def predict_performance():
    """Predict on-job performance"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Missing interview data'}), 400
        
        result = ai_service.predict_interview_performance(data)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error predicting performance: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/interview/speaking-patterns', methods=['POST'])
def analyze_patterns():
    """Analyze speaking patterns"""
    try:
        data = request.get_json()
        
        if not data or 'transcript' not in data:
            return jsonify({'success': False, 'error': 'Missing transcript'}), 400
        
        result = ai_service.analyze_speaking_patterns(data['transcript'])
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing patterns: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===================== SUMMARY ENDPOINTS =====================

@app.route('/api/summary/assessment', methods=['POST'])
def assessment_summary():
    """Generate assessment summary"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Missing assessment data'}), 400
        
        result = ai_service.generate_assessment_summary(data)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating assessment summary: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/summary/interview', methods=['POST'])
def interview_summary():
    """Generate interview summary"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'Missing interview data'}), 400
        
        result = ai_service.generate_interview_summary(data)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating interview summary: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/candidates/compare', methods=['POST'])
def compare_candidates():
    """Compare multiple candidates"""
    try:
        data = request.get_json()
        
        if not data or 'candidates' not in data:
            return jsonify({'success': False, 'error': 'Missing candidates'}), 400
        
        result = ai_service.compare_candidates(data['candidates'])
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error comparing candidates: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/feedback/generate', methods=['POST'])
def generate_feedback():
    """Generate feedback"""
    try:
        data = request.get_json()
        
        if not data or 'context' not in data:
            return jsonify({'success': False, 'error': 'Missing context'}), 400
        
        feedback_type = data.get('type', 'general')
        result = ai_service.generate_feedback(data['context'], feedback_type)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating feedback: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===================== ERROR HANDLERS =====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"Server error: {error}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info(f"Starting AI Service on {Config.HOST}:{Config.PORT}")
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
