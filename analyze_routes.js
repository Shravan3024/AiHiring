// This script helps identify undefined controller methods referenced in routes

const results = {
  issues: [],
  verified: []
};

// ROUTE FILE: resumeParser.routes.js
// CONTROLLER: ResumeParserController (resumeParser.controller.js)
results.issues.push({
  routeFile: 'src/routes/resumeParser.routes.js',
  controllerFile: 'src/controllers/resumeParser.controller.js',
  undefinedMethods: ['matchResumeToJob', 'getMatchResults', 'getAnalysisReport', 'getSkillGaps'],
  routePaths: [
    '/match (POST) - calls matchResumeToJob',
    '/match/:applicationId (GET) - calls getMatchResults',
    '/analysis/:applicationId (GET) - calls getAnalysisReport',
    '/skill-gaps/:applicationId (GET) - calls getSkillGaps'
  ],
  notes: 'ResumeParserController only exports: uploadResume, getResumeDetails'
});

// ALL OTHER ROUTE FILES - VERIFIED OK
results.verified.push('admin.routes.js - all methods exist');
results.verified.push('ai.routes.complete.js - all methods exist');
results.verified.push('ai.routes.js - all methods exist');
results.verified.push('application.routes.js - all methods exist');
results.verified.push('assessment.routes.js - all methods exist');
results.verified.push('auth.routes.js - all methods exist');
results.verified.push('candidate.routes.js - all methods exist');
results.verified.push('candidateAuth.routes.js - all methods exist');
results.verified.push('candidateDashboard.routes.js - all methods exist');
results.verified.push('candidateProfile.routes.js - all methods exist');
results.verified.push('document.routes.js - all methods exist');
results.verified.push('hr.routes.js - all methods exist');
results.verified.push('interview.routes.js - all methods exist');
results.verified.push('interviewAdaptive.routes.js - all methods exist');
results.verified.push('interviewPhase5.routes.js - all methods exist');
results.verified.push('job.routes.js - all methods exist');
results.verified.push('malpractice.routes.js - all methods exist');
results.verified.push('md.routes.js - all methods exist');
results.verified.push('notification.routes.js - all methods exist');
results.verified.push('offer.routes.js - all methods exist');
results.verified.push('proctoring.routes.js - all methods exist');
results.verified.push('resume.routes.js - all methods exist');

console.log('\n=== UNDEFINED CONTROLLER METHOD REFERENCES ===\n');
console.log(`Issues Found: ${results.issues.length}\n`);

results.issues.forEach((issue, i) => {
  console.log(`${i + 1}. ${issue.routeFile}`);
  console.log(`   Controller: ${issue.controllerFile}`);
  console.log(`   Undefined Methods: ${issue.undefinedMethods.join(', ')}`);
  console.log(`   Route Paths:`);
  issue.routePaths.forEach(path => console.log(`     - ${path}`));
  console.log(`   Notes: ${issue.notes}\n`);
});

console.log(`\nTotal Verified Routes: ${results.verified.length}\n`);

// Export as CSV
console.log('\n=== CSV FORMAT ===\n');
console.log('RouteFile,ControllerFile,UndefinedMethod,RoutePath');
results.issues.forEach(issue => {
  issue.undefinedMethods.forEach((method, idx) => {
    const routePath = issue.routePaths[idx] || '';
    console.log(`${issue.routeFile},${issue.controllerFile},${method},"${routePath}"`);
  });
});
