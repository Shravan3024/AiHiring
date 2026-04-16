"""
Summary Generator Module
Generates intelligent summaries for resumes, assessments, and interviews
"""
import os
import logging
import json
import re
from typing import Dict, List, Any, Optional
from google import genai
from dotenv import load_dotenv
from config import Config

load_dotenv()
logger = logging.getLogger(__name__)

class SummaryGenerator:
    """Generate comprehensive summaries using AI"""
    
    def __init__(self):
        """Initialize the summary generator with AI"""
        api_key = Config.GOOGLE_API_KEY or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not configured in environment")
        
        genai.configure(api_key=api_key)
        self.client = genai
        self.model = Config.GENAI_MODEL or "gemini-1.5-flash"
        logger.info(f"SummaryGenerator initialized with model: {self.model}")
    
    def generate_resume_summary(self, parsed_resume: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive resume summary
        
        Args:
            parsed_resume: Parsed resume data from ResumeParser
            
        Returns:
            Summary data with multiple perspectives
        """
        try:
            # Prepare context
            skills = self._format_skills(parsed_resume.get('skills', {}))
            education = self._format_education(parsed_resume.get('education', []))
            experience = self._format_experience(parsed_resume.get('experience', []))
            
            prompt = f"""Based on this candidate profile, generate comprehensive summaries:

Skills: {skills}
Education: {education}
Experience: {experience}
Raw Profile: {parsed_resume.get('raw_text', '')[:2000]}

Provide in JSON format:
{{
    "executive_summary": "Professional 2-3 sentence summary",
    "professional_overview": "Detailed paragraph about candidate",
    "key_strengths": ["strength1", "strength2", ...],
    "career_trajectory": "Description of career progression",
    "technical_proficiency": {{"level": "expert|advanced|intermediate|beginner", "areas": ["area1", ...]}},
    "leadership_qualities": ["quality1", ...] or [],
    "learning_agility": "Description of ability to learn new technologies",
    "recommended_roles": ["role1", "role2", ...],
    "growth_potential": "Assessment of future potential"
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
            
            return self._default_summary_response()
            
        except Exception as e:
            logger.error(f"Error generating resume summary: {e}")
            return self._default_summary_response()
    
    def generate_assessment_summary(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate technical assessment summary
        
        Args:
            assessment_data: Assessment results data
            
        Returns:
            Assessment summary with insights
        """
        try:
            prompt = f"""Analyze this technical assessment:

Assessment Data: {json.dumps(assessment_data, indent=2)}

Provide detailed analysis in JSON format:
{{
    "overall_performance": "excellent|good|average|poor",
    "performance_score": 0-100,
    "technical_domains": {{
        "domain_name": {{"score": 0-100, "remarks": "comment"}}
    }},
    "strengths": ["strength1", ...],
    "areas_for_improvement": ["area1", ...],
    "recommendations": ["recommendation1", ...],
    "learning_path": ["topic1", "topic2", ...],
    "estimated_skill_level": "junior|mid-level|senior",
    "readiness_for_role": {{"ready": true/false, "gap_analysis": "analysis"}},
    "next_steps": ["step1", "step2", ...]
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
            
            return self._default_assessment_response()
            
        except Exception as e:
            logger.error(f"Error generating assessment summary: {e}")
            return self._default_assessment_response()
    
    def generate_interview_summary(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate interview summary and feedback
        
        Args:
            interview_data: Interview transcript and metadata
            
        Returns:
            Interview summary with evaluation
        """
        try:
            transcript = interview_data.get('transcript', '')
            questions = interview_data.get('questions', [])
            
            prompt = f"""Analyze this interview session:

Interview Questions & Answers:
{json.dumps({'questions': questions}, indent=2)}

Transcript:
{transcript[:2000]}

Provide comprehensive evaluation in JSON format:
{{
    "interview_score": 0-100,
    "performance_rating": "excellent|good|average|poor",
    "communication_skills": {{"score": 0-100, "feedback": "comment"}},
    "technical_knowledge": {{"score": 0-100, "feedback": "comment"}},
    "problem_solving": {{"score": 0-100, "feedback": "comment"}},
    "cultural_fit_indicators": {{"score": 0-100, "feedback": "comment"}},
    "strengths_demonstrated": ["strength1", ...],
    "concerns": ["concern1", ...] or [],
    "follow_up_questions": ["question1", ...],
    "recommendation": "hire|reject|further_rounds_needed",
    "detailed_feedback": "Comprehensive feedback for candidate",
    "interview_insights": {{
        "communication_style": "description",
        "energy_level": "high|medium|low",
        "engagement": "highly_engaged|engaged|neutral|disengaged",
        "enthusiasm": "high|medium|low"
    }},
    "next_steps": ["step1", ...]
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
            
            return self._default_interview_response()
            
        except Exception as e:
            logger.error(f"Error generating interview summary: {e}")
            return self._default_interview_response()
    
    def generate_comparison_summary(self, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate comparative analysis of multiple candidates
        
        Args:
            candidates: List of candidate data
            
        Returns:
            Comparative analysis
        """
        try:
            candidate_profiles = []
            for i, candidate in enumerate(candidates, 1):
                candidate_profiles.append(f"Candidate {i}: {candidate.get('name', 'Unknown')}\n{json.dumps(candidate, indent=2)}")
            
            prompt = f"""Compare these candidates:

{chr(10).join(candidate_profiles)}

Provide comparison analysis in JSON format:
{{
    "comparison_summary": "Overall comparison",
    "ranked_candidates": [
        {{"rank": 1, "name": "candidate_name", "score": 0-100, "reason": "why ranked"}}
    ],
    "strengths_by_candidate": {{"candidate_name": ["strength1", ...]}},
    "weaknesses_by_candidate": {{"candidate_name": ["weakness1", ...]}},
    "best_for_role": {{"name": "candidate_name", "fit_percentage": 0-100}},
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
            
            return {
                'comparison_summary': 'Unable to generate comparison',
                'ranked_candidates': []
            }
            
        except Exception as e:
            logger.error(f"Error generating comparison summary: {e}")
            return {
                'comparison_summary': 'Error in comparison',
                'ranked_candidates': []
            }
    
    def generate_feedback(self, context: str, feedback_type: str) -> str:
        """
        Generate specific feedback for various contexts
        
        Args:
            context: Context information
            feedback_type: Type of feedback (assessment|interview|resume|general)
            
        Returns:
            Generated feedback
        """
        try:
            feedback_prompts = {
                'assessment': 'Generate constructive feedback for technical assessment performance:',
                'interview': 'Generate interview feedback focusing on improvements:',
                'resume': 'Generate resume improvement suggestions:',
                'general': 'Generate general feedback:'
            }
            
            prompt = feedback_prompts.get(feedback_type, '') + f"\n\nContext: {context}"
            
            response = self.client.GenerativeModel(self.model).generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                )
            )
            
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return "Unable to generate feedback."
    
    # Helper methods
    
    def _format_skills(self, skills: Dict[str, List[str]]) -> str:
        """Format skills for prompt"""
        formatted = []
        for category, skill_list in skills.items():
            formatted.append(f"{category}: {', '.join(skill_list)}")
        return "\n".join(formatted)
    
    def _format_education(self, education: List[Dict[str, Any]]) -> str:
        """Format education for prompt"""
        if not education:
            return "Not specified"
        formatted = []
        for edu in education:
            degree = edu.get('degree', 'Unknown')
            spec = edu.get('specialization', '')
            year = edu.get('year_of_passout', '')
            formatted.append(f"{degree} in {spec} ({year})")
        return "\n".join(formatted)
    
    def _format_experience(self, experience: List[Dict[str, Any]]) -> str:
        """Format experience for prompt"""
        if not experience:
            return "No experience specified"
        formatted = []
        for exp in experience:
            position = exp.get('position', 'Unknown')
            duration = exp.get('duration_years', 0)
            formatted.append(f"{position} - {duration} years")
        return "\n".join(formatted)
    
    def _default_summary_response(self) -> Dict[str, Any]:
        """Default resume summary response"""
        return {
            'executive_summary': 'Unable to generate summary',
            'professional_overview': 'Insufficient data',
            'key_strengths': [],
            'career_trajectory': '',
            'technical_proficiency': {'level': 'unknown', 'areas': []},
            'leadership_qualities': [],
            'learning_agility': '',
            'recommended_roles': [],
            'growth_potential': ''
        }
    
    def _default_assessment_response(self) -> Dict[str, Any]:
        """Default assessment response"""
        return {
            'overall_performance': 'unknown',
            'performance_score': 0,
            'technical_domains': {},
            'strengths': [],
            'areas_for_improvement': [],
            'recommendations': [],
            'learning_path': [],
            'estimated_skill_level': 'unknown'
        }
    
    def _default_interview_response(self) -> Dict[str, Any]:
        """Default interview response"""
        return {
            'interview_score': 0,
            'performance_rating': 'unknown',
            'communication_skills': {'score': 0, 'feedback': ''},
            'technical_knowledge': {'score': 0, 'feedback': ''},
            'problem_solving': {'score': 0, 'feedback': ''},
            'cultural_fit_indicators': {'score': 0, 'feedback': ''},
            'strengths_demonstrated': [],
            'concerns': [],
            'recommendation': 'further_rounds_needed',
            'detailed_feedback': 'Unable to generate feedback'
        }
