const { Application, Candidate } = require('../src/models');
const path = require('path');
const fs = require('fs');

async function checkApp() {
  try {
    const app = await Application.findByPk(44, { include: [Candidate] });
    if (!app) {
      console.log("Application 44 not found");
      return;
    }
    console.log("App Status:", app.status);
    console.log("Resume Path in DB:", app.Candidate?.resume_path);
    
    const resumePath = app.Candidate?.resume_path;
    if (resumePath) {
        const cleanPath = resumePath.startsWith('/') ? resumePath.substring(1) : resumePath;
        const absolutePath = path.join(__dirname, cleanPath);
        const fallbackPath = path.join(__dirname, 'uploads', path.basename(cleanPath));
        
        console.log("Clean Path:", cleanPath);
        console.log("Checking Absolute Path:", absolutePath, "Exists:", fs.existsSync(absolutePath));
        console.log("Checking Fallback Path:", fallbackPath, "Exists:", fs.existsSync(fallbackPath));
        
        // List directory of uploads to be sure
        console.log("Contents of uploads/ folder:");
        const files = fs.readdirSync(path.join(__dirname, 'uploads'));
        console.log(files);

        if (fs.existsSync(path.join(__dirname, 'uploads/resumes'))) {
            console.log("Contents of uploads/resumes/ folder:");
            const rFiles = fs.readdirSync(path.join(__dirname, 'uploads/resumes'));
            console.log(rFiles);
        }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkApp();
