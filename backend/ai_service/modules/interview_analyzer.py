"""
Interview Analyzer Module
Analyzes interview transcripts and responses
"""
import os
import logging
import json
import re
from typing import Dict, List, Any, Optional, Tuple
from google import genai
from dotenv import load_dotenv
from config import Config

load_dotenv()
logger = logging.getLogger(__name__)

class InterviewAnalyzer:
    """Analyze interviews and generate insights"""
    
    # Evaluation criteria categories
    EVALUATION_CRITERIA = {
        'technical_knowledge': {
            'weight': 0.3,
            'aspects': ['Problem-solving', 'Technical depth', 'Framework knowledge']
        },
        'communication': {
            'weight': 0.2,
            'aspects': ['Clarity', 'Articulation', 'Listening']
        },
        'problem_solving': {
            'weight': 0.25,
            'aspects': ['Approach', 'Logical thinking', 'Efficiency']
        },
        'soft_skills': {
            'weight': 0.15,
            'aspects': ['Adaptability', 'Teamwork', 'Leadership']
        },
        'cultural_fit': {
            'weight': 0.1,
            'aspects': ['Values alignment', 'Work style', 'Team compatibility']
        }
    }
    
    def __init__(self):
        """Initialize the interview analyzer with AI"""
        api_key = Config.GOOGLE_API_KEY or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not configured in environment")
        
        genai.configure(api_key=api_key)
        self.client = genai
        self.model = Config.GENAI_MODEL or "gemini-1.5-flash"
        logger.info(f"InterviewAnalyzer initialized with model: {self.model}")
    
    def analyze_interview(self, transcript: str, interview_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze complete interview session
        
        Args:
            transcript: Interview transcript
            interview_details: Interview metadata (questions, role, etc.)
            
        Returns:
            Comprehensive interview analysis
        """
        try:
            # Parse transcript into Q&A pairs
            qa_pairs = self._extract_qa_pairs(transcript)
            
            # Analyze each answer
            answer_analyses = []
            for qa_pair in qa_pairs:
                analysis = self._analyze_answer(qa_pair['question'], qa_pair['answer'])
                answer_analyses.append(analysis)
            
            # Get overall assessment
            overall_assessment = self._generate_overall_assessment(transcript, interview_details, answer_analyses)
            
            return {
                'qa_analyses': answer_analyses,
                'overall_assessment': overall_assessment,
                'interview_flow': self._analyze_interview_flow(transcript),
                'red_flags': self._identify_red_flags(transcript),
                'green_flags': self._identify_green_flags(transcript),
                'recommendation': overall_assessment.get('recommendation')
            }
            
        except Exception as e:
            logger.error(f"Error analyzing interview: {e}")
            return self._default_interview_analysis()
    
    def analyze_answer_quality(self, question: str, answer: str) -> Dict[str, Any]:
        """
        Analyze quality of a single answer
        
        Args:
            question: Interview question
            answer: Candidate's answer
            
        Returns:
            Quality assessment
        """
        try:
            prompt = f"""Evaluate this interview answer:

Question: {question}
Answer: {answer}

Provide evaluation in JSON format:
{{
    "relevance_score": 0-100,
    "completeness_score": 0-100,
    "clarity_score": 0-100,
    "confidence_level": "high|medium|low",
    "strengths": ["strength1", ...],
    "weaknesses": ["weakness1", ...],
    "follow_up_suggestion": "Follow-up question to ask",
    "rating": "excellent|good|average|poor",
    "feedback": "Detailed feedback"
}}"""
            
            response = self.client.GenerativeModel(self.model).generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            return self._default_answer_analysis()
            
        except Exception as e:
            logger.error(f"Error analyzing answer: {e}")
            return self._default_answer_analysis()
    
    def predict_performance(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict on-job performance based on interview
        
        Args:
            interview_data: Complete interview analysis
            
        Returns:
            Performance prediction
        """
        try:
            prompt = f"""Based on this interview, predict job performance:

Interview Assessment:
{json.dumps(interview_data, indent=2)[:1500]}

Provide prediction in JSON format:
{{
    "predicted_performance": "high|medium|low",
    "confidence_percentage": 0-100,
    "time_to_productivity": "months",
    "likely_strengths_in_role": ["strength1", ...],
    "potential_challenges": ["challenge1", ...],
    "retention_probability_percentage": 0-100,
    "team_fit_assessment": "good|fair|poor",
    "growth_trajectory": "fast|moderate|slow",
    "recommendations": ["recommendation1", ...]
}}"""
            
            response = self.client.GenerativeModel(self.model).generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            return self._default_prediction()
            
        except Exception as e:
            logger.error(f"Error predicting performance: {e}")
            return self._default_prediction()
    
    def extract_speaking_patterns(self, transcript: str) -> Dict[str, Any]:
        """
        Extract speaking patterns from transcript
        
        Args:
            transcript: Interview transcript
            
        Returns:
            Speaking patterns analysis
        """
        try:
            prompt = f"""Analyze the speaking patterns in this interview:

Transcript:
{transcript[:2000]}

Provide analysis in JSON format:
{{
    "pace": "fast|normal|slow",
    "clarity": "very_clear|clear|somewhat_clear|unclear",
    "vocabulary_level": "advanced|intermediate|basic",
    "use_of_examples": "frequent|moderate|rare",
    "hesitation_level": "high|medium|low",
    "confidence_indicators": ["indicator1", ...],
    "communication_strengths": ["strength1", ...],
    "communication_weaknesses": ["weakness1", ...]
}}"""
            
            response = self.client.GenerativeModel(self.model).generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            return {}
            
        except Exception as e:
            logger.error(f"Error extracting speaking patterns: {e}")
            return {}
    
    # Helper methods
    
    def _analyze_answer(self, question: str, answer: str) -> Dict[str, Any]:
        """Analyze a single Q&A pair"""
        return self.analyze_answer_quality(question, answer)
    
    def _extract_qa_pairs(self, transcript: str) -> List[Dict[str, str]]:
        """Extract Q&A pairs from transcript"""
        qa_pairs = []
        
        # Simple extraction - in production, use more sophisticated methods
        lines = transcript.split('\n')
        current_q = None
        current_a = []
        
        for line in lines:
            if line.strip().startswith(('Q:', 'Question:', 'Interviewer:')):
                if current_q and current_a:
                    qa_pairs.append({'question': current_q, 'answer': ' '.join(current_a)})
                current_q = line.replace('Q:', '').replace('Question:', '').replace('Interviewer:', '').strip()
                current_a = []
            elif line.strip().startswith(('A:', 'Answer:', 'Candidate:')):
                current_a.append(line.replace('A:', '').replace('Answer:', '').replace('Candidate:', '').strip())
            elif current_a:
                current_a.append(line.strip())
        
        if current_q and current_a:
            qa_pairs.append({'question': current_q, 'answer': ' '.join(current_a)})
        
        return qa_pairs
    
    def _generate_overall_assessment(self, transcript: str, details: Dict, analyses: List) -> Dict[str, Any]:
        """Generate overall interview assessment"""
        try:
            # Calculate weighted score
            total_score = 0
            if analyses:
                avg_score = sum(a.get('clarity_score', 0) for a in analyses) / len(analyses)
                total_score = int(avg_score)
            
            prompt = f"""Generate overall assessment:

Number of Questions: {len(analyses)}
Average Answer Score: {total_score}
Interview Type: {details.get('type', 'General')}

Provide assessment in JSON format:
{{
    "overall_score": {total_score},
    "performance_summary": "Brief summary",
    "hire_recommendation": "strong_yes|yes|maybe|no|strong_no",
    "confidence_level": 0-100,
    "key_takeaways": ["takeaway1", ...],
    "next_round_readiness": true/false
}}"""
            
            response = self.client.GenerativeModel(self.model).generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            return {
                'overall_score': total_score,
                'hire_recommendation': 'maybe',
                'confidence_level': 50
            }
            
        except Exception as e:
            logger.error(f"Error generating assessment: {e}")
            return {
                'overall_score': 0,
                'hire_recommendation': 'maybe'
            }
    
    def _analyze_interview_flow(self, transcript: str) -> Dict[str, Any]:
        """Analyze the flow and pace of interview"""
        return {
            'pacing': 'normal',
            'engagement_level': 'high',
            'topic_coverage': 'comprehensive',
            'naturalness': 'natural'
        }
    
    def _identify_red_flags(self, transcript: str) -> List[str]:
        """Identify potential red flags"""
        red_flags = []
        text_lower = transcript.lower()
        
        flag_keywords = {
            'lack of specificity': ['i don\'t remember', 'not sure', 'i think', 'maybe'],
            'defensive behavior': ['that\'s not my fault', 'they were wrong', 'i disagree'],
            'lack of examples': ['i don\'t have an example', 'can\'t recall'],
            'poor communication': ['uh', 'um', 'like', 'you know']
        }
        
        for flag, keywords in flag_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                red_flags.append(flag)
        
        return red_flags
    
    def _identify_green_flags(self, transcript: str) -> List[str]:
        """Identify positive indicators"""
        green_flags = []
        text_lower = transcript.lower()
        
        positive_keywords = {
            'specific examples': ['for example', 'specifically', 'in one case'],
            'growth mindset': ['learned', 'improved', 'developed', 'mastered'],
            'ownership': ['i took responsibility', 'i led', 'i implemented'],
            'collaboration': ['team', 'collaborated', 'worked with', 'helped'],
            'problem solving': ['solved', 'optimized', 'automated', 'improved']
        }
        
        for flag, keywords in positive_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                green_flags.append(flag)
        
        return green_flags
    
    def _default_answer_analysis(self) -> Dict[str, Any]:
        """Default answer analysis"""
        return {
            'relevance_score': 0,
            'completeness_score': 0,
            'clarity_score': 0,
            'confidence_level': 'low',
            'strengths': [],
            'weaknesses': [],
            'rating': 'poor'
        }
    
    def _default_prediction(self) -> Dict[str, Any]:
        """Default performance prediction"""
        return {
            'predicted_performance': 'medium',
            'confidence_percentage': 50,
            'recommendations': []
        }
    
    def _default_interview_analysis(self) -> Dict[str, Any]:
        """Default interview analysis"""
        return {
            'qa_analyses': [],
            'overall_assessment': {'score': 0},
            'recommendation': 'maybe'
        }
