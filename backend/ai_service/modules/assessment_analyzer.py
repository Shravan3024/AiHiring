"""
Assessment Analyzer Module
Analyzes technical assessments and coding challenges
"""
import os
import logging
import json
import re
from typing import Dict, List, Any, Optional
import google.genai as genai
from google.genai import types
from utils import strip_markdown
from dotenv import load_dotenv
from config import Config

load_dotenv()
logger = logging.getLogger(__name__)

class AssessmentAnalyzer:
    """Analyze technical assessments and coding challenges"""
    
    ASSESSMENT_TYPES = {
        'coding': 'Programming/Coding Challenge',
        'mcq': 'Multiple Choice Questions',
        'design': 'System Design',
        'case_study': 'Case Study Analysis',
        'technical_round': 'Technical Interview',
        'aptitude': 'Aptitude Test'
    }
    
    SKILL_LEVELS = {
        'junior': (0, 40),
        'mid_level': (40, 70),
        'senior': (70, 85),
        'expert': (85, 100)
    }
    
    def __init__(self):
        """Initialize the assessment analyzer with AI"""
        api_key = Config.GOOGLE_API_KEY or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not configured in environment")
        
        self.client = genai.Client(api_key=api_key)
        self.model = Config.GENAI_MODEL or "gemini-2.5-flash"
        logger.info(f"AssessmentAnalyzer initialized with model: {self.model}")
    
    def analyze_coding_solution(self, code: str, problem_description: str) -> Dict[str, Any]:
        """
        Analyze a coding solution
        
        Args:
            code: Source code
            problem_description: Problem statement
            
        Returns:
            Code quality and functionality analysis
        """
        try:
            prompt = f"""Analyze this coding solution:

Problem:
{problem_description[:1000]}

Code:
{code[:2000]}

Provide detailed analysis in JSON format. DO NOT use markdown like asterisks (**). Return plain text only.
{{
    "correctness_score": 0-100,
    "code_quality_score": 0-100,
    "efficiency_score": 0-100,
    "readability_score": 0-100,
    "overall_score": 0-100,
    "time_complexity": "description",
    "space_complexity": "description",
    "correctness_feedback": ["feedback1", ...],
    "code_quality_issues": ["issue1", ...],
    "optimization_suggestions": ["suggestion1", ...],
    "strengths": ["Detailed performance strength 1", "Detailed performance strength 2", "Detailed performance strength 3", "Detailed performance strength 4", "Detailed performance strength 5"],
    "weaknesses": ["Detailed technical weakness 1", "Detailed technical weakness 2", "Detailed technical weakness 3", "Detailed technical weakness 4", "Detailed technical weakness 5"],
    "skill_level": "junior|mid_level|senior|expert",
    "estimated_experience_years": 0-30,
    "problem_solving_approach": "description",
    "recommendations": ["recommendation1", ...]
}}"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return strip_markdown(json.loads(json_match.group()))
            
            return self._default_coding_analysis()
            
        except Exception as e:
            logger.error(f"Error analyzing coding solution: {e}")
            return self._default_coding_analysis()
    
    def analyze_mcq_responses(self, questions: List[Dict[str, Any]], answers: List[str]) -> Dict[str, Any]:
        """
        Analyze MCQ test responses
        
        Args:
            questions: List of questions with options
            answers: List of selected answers
            
        Returns:
            MCQ analysis and scoring
        """
        try:
            # Calculate score
            correct_count = 0
            if 'correct_answers' in questions[0] if questions else False:
                for i, answer in enumerate(answers):
                    if i < len(questions) and answer == questions[i].get('correct_answer'):
                        correct_count += 1
            
            score_percentage = (correct_count / len(answers) * 100) if answers else 0
            
            prompt = f"""Analyze these MCQ responses:

Question Count: {len(questions)}
Correct Answers: {correct_count}
Score: {score_percentage:.1f}%

Questions and Answers:
{json.dumps({'questions': questions[:5], 'answers': answers[:5]}, indent=2)}

Provide analysis in JSON format:
{{
    "score_percentage": {score_percentage:.1f},
    "correct_answers": {correct_count},
    "total_questions": {len(questions)},
    "performance_level": "excellent|good|average|poor",
    "topics_strengths": ["Strong topic 1", "Strong topic 2", "Strong topic 3", "Strong topic 4", "Strong topic 5"],
    "topics_weaknesses": ["Weak topic 1", "Weak topic 2", "Weak topic 3", "Weak topic 4", "Weak topic 5"],
    "knowledge_assessment": "description",
    "learning_recommendations": ["recommendation1", ...],
    "estimated_skill_level": "junior|mid_level|senior",
    "preparation_suggestions": ["suggestion1", ...],
    "study_plan": ["topic1", "topic2", ...]
}}"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return strip_markdown(json.loads(json_match.group()))
            
            return self._default_mcq_analysis(score_percentage, correct_count, len(questions))
            
        except Exception as e:
            logger.error(f"Error analyzing MCQ responses: {e}")
            return self._default_mcq_analysis(0, 0, len(questions) if questions else 0)
    
    def analyze_system_design(self, design_description: str, requirements: str) -> Dict[str, Any]:
        """
        Analyze system design solution
        
        Args:
            design_description: Design description/explanation
            requirements: System requirements
            
        Returns:
            Design analysis
        """
        try:
            prompt = f"""Analyze this system design solution:

Requirements:
{requirements[:1000]}

Design:
{design_description[:2000]}

Provide analysis in JSON format:
{{
    "requirements_coverage": 0-100,
    "architecture_quality": 0-100,
    "scalability_score": 0-100,
    "reliability_score": 0-100,
    "overall_score": 0-100,
    "design_patterns_used": ["pattern1", ...],
    "strengths": ["Design strength 1", "Design strength 2", "Design strength 3", "Design strength 4", "Design strength 5"],
    "weaknesses": ["Design weakness 1", "Design weakness 2", "Design weakness 3", "Design weakness 4", "Design weakness 5"],
    "potential_bottlenecks": ["bottleneck1", ...],
    "improvements": ["improvement1", ...],
    "scalability_considerations": "description",
    "failure_handling": "description",
    "estimated_seniority": "junior|mid|senior|principal",
    "recommendations": ["recommendation1", ...]
}}"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return strip_markdown(json.loads(json_match.group()))
            
            return self._default_design_analysis()
            
        except Exception as e:
            logger.error(f"Error analyzing design: {e}")
            return self._default_design_analysis()
    
    def analyze_case_study(self, case_description: str, candidate_solution: str) -> Dict[str, Any]:
        """
        Analyze case study response
        
        Args:
            case_description: Case study details
            candidate_solution: Candidate's solution/analysis
            
        Returns:
            Case study analysis
        """
        try:
            prompt = f"""Analyze this case study response:

Case Study:
{case_description[:1500]}

Candidate Solution:
{candidate_solution[:2000]}

Provide analysis in JSON format:
{{
    "problem_understanding": 0-100,
    "analytical_thinking": 0-100,
    "solution_quality": 0-100,
    "business_acumen": 0-100,
    "communication_clarity": 0-100,
    "overall_score": 0-100,
    "strengths": ["Case strength 1", "Case strength 2", "Case strength 3", "Case strength 4", "Case strength 5"],
    "areas_for_improvement": ["Area 1", "Area 2", "Area 3", "Area 4", "Area 5"],
    "critical_insights_missed": ["insight1", ...] or [],
    "alternative_approaches": ["approach1", ...],
    "commercial_awareness": "description",
    "estimated_experience_level": "junior|mid|senior|lead",
    "follow_up_questions": ["question1", ...],
    "recommendations": ["recommendation1", ...]
}}"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return strip_markdown(json.loads(json_match.group()))
            
            return self._default_case_analysis()
            
        except Exception as e:
            logger.error(f"Error analyzing case study: {e}")
            return self._default_case_analysis()
    
    def generate_assessment_report(self, assessment_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive assessment report
        
        Args:
            assessment_results: Results from all assessments
            
        Returns:
            Comprehensive report
        """
        try:
            prompt = f"""Generate a comprehensive assessment report:

Assessment Results:
{json.dumps(assessment_results, indent=2)[:2000]}

Provide report in JSON format. DO NOT use markdown like asterisks (**). Return plain text only.
{{
    "executive_summary": "Overall assessment summary",
    "competency_matrix": {{"competency": {{"score": 0-100, "level": "advanced|intermediate|basic"}}}},
    "strengths": ["Key overall strength 1", "Key overall strength 2", "Key overall strength 3", "Key overall strength 4", "Key overall strength 5"],
    "development_areas": ["Key development area 1", "Key development area 2", "Key development area 3", "Key development area 4", "Key development area 5"],
    "recommended_role_level": "junior|mid|senior|lead",
    "estimated_seniority": "years_of_experience_number",
    "hiring_recommendation": "strong_hire|hire|maybe|no_hire",
    "training_needs": ["need1", ...],
    "next_steps": ["step1", ...],
    "overall_assessment": "description"
}}"""
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return strip_markdown(json.loads(json_match.group()))
            
            return self._default_report()
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return self._default_report()
    
    # Helper methods
    
    def _default_coding_analysis(self) -> Dict[str, Any]:
        """Default coding analysis response"""
        return {
            'correctness_score': 0,
            'code_quality_score': 0,
            'efficiency_score': 0,
            'overall_score': 0,
            'strengths': [
                "Baseline syntax correctness", "Functional logic attempt",
                "Problem understanding", "Standard naming conventions", "Code compartmentalization"
            ],
            'weaknesses': [
                "Advanced optimization missing", "Edge case handling required",
                "Scalability considerations", "Detailed error handling", "Unit test coverage"
            ],
            'skill_level': 'junior'
        }
    
    def _default_mcq_analysis(self, score: float, correct: int, total: int) -> Dict[str, Any]:
        """Default MCQ analysis response"""
        return {
            'score_percentage': score,
            'correct_answers': correct,
            'total_questions': total,
            'performance_level': 'poor' if score < 40 else 'average' if score < 60 else 'good' if score < 80 else 'excellent',
            'topics_strengths': [
                "General concept awareness", "Sectional completion",
                "Baseline matching", "Attempted broad range", "Foundation knowledge"
            ],
            'topics_weaknesses': [
                "Deep technical accuracy", "Niche topic mastery",
                "Detailed precision", "Advanced application", "Time management optimization"
            ]
        }
    
    def _default_design_analysis(self) -> Dict[str, Any]:
        """Default design analysis response"""
        return {
            'requirements_coverage': 0,
            'architecture_quality': 0,
            'overall_score': 0,
            'strengths': [],
            'weaknesses': [],
            'recommendations': []
        }
    
    def _default_case_analysis(self) -> Dict[str, Any]:
        """Default case study analysis response"""
        return {
            'problem_understanding': 0,
            'analytical_thinking': 0,
            'overall_score': 0,
            'strengths': [],
            'areas_for_improvement': []
        }
    
    def _default_report(self) -> Dict[str, Any]:
        """Default assessment report"""
        return {
            'executive_summary': 'Assessment report pending',
            'competency_matrix': {},
            'strengths': [],
            'development_areas': [],
            'recommended_role_level': 'junior',
            'hiring_recommendation': 'maybe'
        }
