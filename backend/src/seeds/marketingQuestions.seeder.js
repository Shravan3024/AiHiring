/**
 * Question Bank Seeder for AI Hiring System - Marketing Roles
 * Covers 3 levels: Trainee, Executive, Assistant Manager
 * Maps to job roles: SENIOR_AI_ENGINEER (placeholder for marketing roles)
 * Total: 90 interview questions
 */

// Note: For production AI Hiring System, these would map to actual Marketing roles
// This is a demonstration with generic job role enums
const ROLE_MAPPING = {
  MANAGEMENT_TRAINEE: "FULL_STACK_DEVELOPER", // Junior level
  EXECUTIVE_MARKETING: "SENIOR_AI_ENGINEER", // Mid-level
  ASSISTANT_MANAGER_MARKETING: "DEVOPS_ENGINEER", // Senior level
};

const MARKETING_QUESTIONS = {
  MANAGEMENT_TRAINEE: [
    {
      questionId: "mt_intro_001",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "INTRODUCTORY",
      difficulty: "EASY",
      question: "Welcome to the interview! To start, could you please introduce yourself and tell us what interests you about a career in polymer marketing at AI Hiring System?",
      expectedAnswer: "Candidate should introduce themselves, their educational background, and show genuine interest in the polymer industry/marketing role.",
      keywords: ["introduction", "background", "interest", "polymers", "marketing"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_001",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "EASY",
      question: "What are polymers and how are they classified?",
      expectedAnswer:
        "Polymers are long-chain molecules made of repeating units (monomers). They are classified into: 1) Natural (cellulose, rubber) vs Synthetic (plastic, nylon), 2) Thermoplastics vs Thermosets, 3) By structure: linear, branched, cross-linked.",
      keywords: ["polymers", "monomers", "classification", "thermoplastics", "thermosets"],
      followUpQuestions: [
        {
          question: "Give real-world examples of each polymer type",
          expectedKeywords: ["PET", "polyester", "rubber", "epoxy"],
        },
      ],
      scoringRubric: {
        excellent: "Clear definitions with 3+ classification types",
        good: "Correct with 2 classification methods",
        average: "Basic understanding of structure",
        poor: "Incomplete or incorrect",
      },
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_002",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "EASY",
      question: "Difference between thermoplastics and thermosetting plastics.",
      expectedAnswer:
        "Thermoplastics: Can be remelted, reshaped multiple times. Examples: PE, PP, PVC. Thermosets: Cannot be remelted once set. Stronger, more brittle. Examples: Epoxy, Bakelite. Difference: molecular structure - thermoplastics have weak intermolecular forces, thermosets have cross-linked networks.",
      keywords: ["thermoplastic", "thermoset", "remelting", "cross-linked", "PE", "PP", "epoxy"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_003",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "EASY",
      question: "What is polymer compounding?",
      expectedAnswer:
        "Polymer compounding is the process of mixing base polymers with additives (fillers, colorants, stabilizers) to achieve desired properties. Used to customize materials for specific applications. Example: Adding glass fibers to nylon increases strength.",
      keywords: ["compounding", "additives", "fillers", "customization", "properties"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_004",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "EASY",
      question: "Why are additives used in polymers?",
      expectedAnswer:
        "Additives improve polymer properties: 1) Colorants (aesthetics), 2) UV stabilizers (prevent degradation), 3) Fillers (strength, cost reduction), 4) Plasticizers (flexibility), 5) Flame retardants (safety), 6) Antioxidants (durability). Each serves specific functional requirement.",
      keywords: ["additives", "colorants", "stabilizers", "fillers", "flame retardant"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_005",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What are fillers and reinforcements?",
      expectedAnswer:
        "Fillers: Inert materials (talc, CaCO3) that reduce cost and density. Reinforcements: Active materials (glass fiber, carbon fiber) that enhance mechanical properties. Both reduce material cost and modify properties. Reinforcements typically increase strength, while fillers mainly reduce cost.",
      keywords: ["fillers", "reinforcements", "talc", "glass fiber", "carbon fiber", "mechanical properties"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_006",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is masterbatch and its applications?",
      expectedAnswer:
        "Masterbatch is a polymer-additive concentrate (e.g., 50% pigment + 50% carrier polymer) used to add color or properties to virgin polymer efficiently. Applications: color matching, UV protection, conductive compounds. Advantage: easier handling, better dispersion, cost-effective.",
      keywords: ["masterbatch", "concentrate", "pigment", "dispersion", "additive"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_007",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "Explain basic properties of polymers (tensile strength, impact strength).",
      expectedAnswer:
        "Tensile Strength: Maximum stress a material can withstand while being stretched. Impact Strength: Ability to absorb shock without breaking. These properties depend on: polymer type, molecular weight, temperature, processing conditions. Example: ABS has high impact strength (good for casings), while PET has high tensile strength (good for bottles).",
      keywords: ["tensile strength", "impact strength", "stress", "shock", "molecular weight"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_008",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What factors affect polymer selection for an application?",
      expectedAnswer:
        "Key factors: 1) Required properties (strength, flexibility, temperature), 2) Cost constraints, 3) Processing method (injection, extrusion), 4) Environmental conditions (UV, moisture, chemicals), 5) Regulations (FDA, RoHS), 6) Volume requirements. Must balance performance vs cost vs manufacturability.",
      keywords: ["selection criteria", "properties", "processing", "regulations", "cost-performance"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_009",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is melt flow index (MFI)?",
      expectedAnswer:
        "MFI measures polymer flowability at specific temperature/pressure. Higher MFI = lower viscosity = better flow = easier processing. Measured in g/10min. Example: LDPE (MFI 2-4) flows easily, HDPE (MFI 0.3-1) needs higher pressure. Critical for process optimization.",
      keywords: ["MFI", "melt flow index", "viscosity", "flowability", "processing"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_010",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "Why is MFI important for customers?",
      expectedAnswer:
        "MFI determines: 1) Processing conditions (temperature, pressure, speed), 2) Cycle time (affects productivity), 3) Part quality (surface finish, dimensional accuracy), 4) Cost per part. Wrong MFI = scrap, delays, increased costs. Customers need consistent MFI for stable production.",
      keywords: ["MFI", "processing parameters", "cycle time", "quality", "productivity"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_011",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is extrusion and where is it used?",
      expectedAnswer:
        "Extrusion: Polymer is heated, melted, and forced through a die to create continuous shapes. Used for: films, sheets, pipes, profiles, fibers. Advantages: high speed, continuous production, cost-effective. Example: plastic wrap, water pipes, fishing line.",
      keywords: ["extrusion", "die", "continuous", "films", "pipes", "profiles"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_012",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "Difference between injection molding and blow molding.",
      expectedAnswer:
        "Injection Molding: Molten polymer injected into closed mold. Used for: small parts, complex geometry. Example: bottle caps, phone cases. Blow Molding: Hollow shape created by blowing air. Used for: hollow containers, bottles. Injection: precise small parts. Blow: hollow containers.",
      keywords: ["injection molding", "blow molding", "mold", "hollow", "complex"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_013",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What role does temperature play in polymer processing?",
      expectedAnswer:
        "Temperature controls: 1) Polymer viscosity (fluidity), 2) Processing speed, 3) Part quality, 4) Energy consumption. Too low: polymer won't flow (incomplete fill). Too high: degradation, discoloration, weak properties. Optimal temperature range varies by polymer type and application.",
      keywords: ["temperature", "viscosity", "processing", "degradation", "optimization"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_014",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What defects can occur during polymer processing?",
      expectedAnswer:
        "Common defects: 1) Warping (uneven cooling), 2) Flow lines (temperature/pressure imbalance), 3) Weld lines (polymer streams meet improperly), 4) Burn marks (high temperature), 5) Voids (trapped air). Causes: improper temperature, pressure, mold design, cooling rate. Prevention: optimize parameters, improve mold design.",
      keywords: ["warping", "flow lines", "weld lines", "burn marks", "voids", "defects"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_015",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "Why is drying required for some polymers?",
      expectedAnswer:
        "Some polymers (PET, nylon, ABS) absorb moisture from air. Moisture causes: 1) Hydrolysis (chain breaking), 2) Weak parts, 3) Surface defects (splay), 4) Reduced properties. Solution: Dry at specific temperature/time before processing. Example: Nylon dried 80°C / 2-4 hours. Dry polymer = quality parts.",
      keywords: ["drying", "moisture", "hydrolysis", "nylon", "surface defects"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_016",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is quality control in polymer manufacturing?",
      expectedAnswer:
        "QC ensures: 1) Consistency (batch-to-batch), 2) Compliance with specs (MFI, color, tensile strength), 3) Safety standards (FDA, RoHS), 4) Customer satisfaction. Methods: Physical tests (tensile, impact), Analytical (FTIR, GPC), Visual inspection. Critical for industry reputation and customer retention.",
      keywords: ["quality control", "consistency", "compliance", "testing", "standards"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_017",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "Why are certifications like ISO important?",
      expectedAnswer:
        "ISO certifications (ISO 9001, ISO 14001, ISO 45001) provide: 1) Standardized processes, 2) Reduced defects, 3) Customer confidence, 4) Market access (some customers require it), 5) Legal compliance. ISO = systematic approach to quality = business advantage. Essential for exports and premium customers.",
      keywords: ["ISO", "certification", "standards", "quality", "compliance"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_018",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is batch consistency?",
      expectedAnswer:
        "Batch consistency = every batch meets same specs (MFI, color, properties). Critical because: 1) Customer processes rely on predictable material, 2) Variation = scrap/rework, 3) Customer confidence, 4) Repeat business. Achieved through: raw material control, process monitoring, QC testing. Consistency = reliability = sales.",
      keywords: ["consistency", "batch", "specs", "variation", "quality"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_019",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is color matching in plastics?",
      expectedAnswer:
        "Color matching = producing exact color shade consistently. Methods: 1) Masterbatch system (predefined colors), 2) Spectrophotometer (L*a*b* values), 3) Visual comparison under standard light. Challenges: lighting conditions, batch variation, customer perception. Critical for branding and customer satisfaction.",
      keywords: ["color", "matching", "masterbatch", "spectrophotometer", "consistency"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_020",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What are customer quality complaints commonly related to?",
      expectedAnswer:
        "Common complaints: 1) Color variation (batch inconsistency), 2) Weak/brittle parts (wrong grade), 3) Surface defects (processing issues), 4) Non-compliance with specs (MFI, tensile strength), 5) Dimensional variations (shrinkage), 6) Unexpected failures (environmental exposure). Each requires root cause analysis and corrective action.",
      keywords: ["complaints", "color", "weakness", "defects", "non-compliance"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_021",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      question: "How would you explain a polymer grade to a non-technical client?",
      expectedAnswer:
        "Simple explanation: 'Our polymer is like choosing a car type. Different grades have different capabilities - some are flexible (soft plastics for toys), others are strong (hard plastics for bumpers). We have grades for different applications, prices, and durability levels. Let me show you which grade fits your need and why it's the best choice.'",
      keywords: ["communication", "simplification", "analogy", "client understanding"],
      estimatedTime: 3,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_022",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      question: "How do technical specs influence sales?",
      expectedAnswer:
        "Technical specs = customer's decision criteria. They need: 1) Reassurance product fits their process, 2) Confidence in quality/consistency, 3) Proof of value (cost savings, performance), 4) Compliance with their standards. Marketing must translate specs into benefits: 'This MFI helps your cycle time by 10%, reducing production cost.' Specs = trust = sales.",
      keywords: ["specifications", "benefits", "customer needs", "value", "trust"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_023",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      question: "What information do customers usually ask before buying polymer material?",
      expectedAnswer:
        "Customers ask: 1) Price & volume discounts, 2) Technical specs (MFI, tensile strength), 3) Processing recommendations, 4) Lead time & availability, 5) Certifications (ISO, FDA), 6) Previous customer references, 7) Compliance (RoHS, REACH), 8) Color/customization options, 9) Sample availability, 10) Technical support post-sale. Prepare answers to all before sales call.",
      keywords: ["customer questions", "price", "specs", "certifications", "support"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_024",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "HARD",
      question: "What is application-based selling?",
      expectedAnswer:
        "Application-based selling = recommend products based on customer's END APPLICATION, not just polymer type. Example: For automotive bumpers, recommend: impact-resistant ABS (high impact strength) + UV protection + specific color. For food packaging, recommend: FDA-compliant PET + clarity. This approach: 1) Solves customer problems, 2) Justifies premium pricing, 3) Builds trust, 4) Increases repeat business.",
      keywords: ["application selling", "end-use", "customer problem", "solution", "value"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_025",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      question: "How does pricing depend on raw material cost?",
      expectedAnswer:
        "Pricing structure: Raw Material Cost (60-70%) + Processing (10-15%) + Additives (5-10%) + Overhead (5-10%) + Profit Margin (5-15%). Raw material fluctuates with crude oil prices. When crude ↑ = costs ↑ = pressure to increase selling price. Customer pressure = need to explain cost structure. Competitive advantage = efficient processing + bulk purchasing.",
      keywords: ["pricing", "raw material", "cost structure", "margin", "crude oil"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_026",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "HARD",
      question: "What is value-added selling in polymers?",
      expectedAnswer:
        "Value-added selling = offer more than just polymer material: 1) Technical consultation (which grade fits your need?), 2) Process optimization (how to reduce cycle time?), 3) Cost reduction solutions (how to reduce scrap?), 4) Custom formulations (R&D support), 5) Long-term partnership. Benefit: Customers pay premium, competitive moat, higher margins, loyalty. Requires deep technical knowledge + customer understanding.",
      keywords: ["value-added", "consulting", "optimization", "partnership", "premium"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_027",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "MEDIUM",
      question: "How do technical datasheets help marketing?",
      expectedAnswer:
        "Technical datasheets (TDS) provide: 1) Objective proof of quality, 2) Comparison with competitors, 3) Compliance documentation, 4) Processing guidelines, 5) Application recommendations. Marketing use: 1) Share with prospects to build credibility, 2) Highlight competitive advantages, 3) Support sales pitches, 4) Answer technical objections, 5) Certify compliance. Good TDS = sales tool.",
      keywords: ["datasheet", "TDS", "proof", "compliance", "competitive"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_028",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "PROBLEM_SOLVING",
      difficulty: "HARD",
      question: "What challenges can occur while selling industrial materials?",
      expectedAnswer:
        "Challenges: 1) Long decision cycles (multiple approvals), 2) High customer risk tolerance (product MUST work), 3) Strict compliance requirements (FDA, RoHS), 4) Batch consistency pressure (customers need predictability), 5) Technical buyers (need deep knowledge), 6) Price sensitivity (bulk purchasing = negotiation), 7) Relationships matter more than features. Solution: Build trust, prove reliability, technical expertise, long-term partnership mindset.",
      keywords: ["challenges", "compliance", "consistency", "technical", "trust"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_029",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "REAL_WORLD_SCENARIO",
      difficulty: "HARD",
      question: "How do you coordinate with the production team for customer requirements?",
      expectedAnswer:
        "Coordination process: 1) Understand customer need (specs, volume, timeline), 2) Check with production feasibility (machines, capacity, cost), 3) Share customer requirements with R&D (if customization needed), 4) Confirm lead time & cost, 5) Get production sign-off before committing to customer. Communication = sales + production alignment = customer satisfaction. Never promise without production confirmation.",
      keywords: ["coordination", "feasibility", "communication", "commitment", "quality"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "mt_q_030",
      jobRole: "MANAGEMENT_TRAINEE_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "HARD",
      question: "Why is technical knowledge important for marketing in polymer companies?",
      expectedAnswer:
        "Technical knowledge = credibility with customers. Without it: Can't answer technical questions → lose trust → lose sale. With it: 1) Understand customer problems deeply, 2) Recommend right solution, 3) Troubleshoot issues, 4) Build long-term partnerships, 5) Become trusted advisor (not just salesperson), 6) Negotiate better deals (understand costs). Technical marketing = highest value-add.",
      keywords: ["technical knowledge", "credibility", "trust", "solution", "advisor"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
  ],

  EXECUTIVE_MARKETING: [
    // 30 questions for Executive level (3-6 years)
    {
      questionId: "em_intro_001",
      jobRole: "EXECUTIVE_MARKETING",
      category: "INTRODUCTORY",
      difficulty: "MEDIUM",
      question: "Good to see you. With several years of experience under your belt, could you give us an overview of your professional journey in industrial marketing and how you think you would add value to AI Hiring System?",
      expectedAnswer: "Summarizes career journey, emphasizes industrial marketing experience, and connects personal skills to AI Hiring System' needs.",
      keywords: ["journey", "experience", "value", "industrial", "professional"],
      estimatedTime: 4,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_001",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "Difference between PE, PP, PVC, ABS, and Nylon.",
      expectedAnswer:
        "PE (Polyethylene): Low cost, flexible, common use (bags, films). Density: LDPE (0.92), HDPE (0.95). PP (Polypropylene): Higher stiffness, chemical resistant, automotive use. PVC (Polyvinyl Chloride): Rigid, electrical insulation, pipes. ABS (Acrylonitrile Butadiene Styrene): High impact, aesthetic, appliances. Nylon: Strong, engineering applications. Choice depends on: performance needs, cost, processing, end-use.",
      keywords: ["PE", "PP", "PVC", "ABS", "Nylon", "properties", "applications"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_002",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "How does polymer structure affect properties?",
      expectedAnswer:
        "Polymer structure impacts: 1) Crystallinity - higher crystallinity = stronger, higher melting point, less flexible. 2) Molecular weight - higher MW = better properties but harder processing. 3) Branching - branched = lower density, easier processing, lower strength. 4) Cross-linking - more cross-links = stronger, more brittle. Example: HDPE (linear) vs LDPE (branched) - HDPE stronger but LDPE more flexible.",
      keywords: ["structure", "crystallinity", "molecular weight", "branching", "cross-linking"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_003",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What is impact modification?",
      expectedAnswer:
        "Impact modification = adding elastomeric particles to rigid polymers to improve impact strength without losing stiffness. Example: Impact-modified polystyrene (HIPS) or impact-modified ABS. Mechanism: rubber particles absorb energy, preventing crack propagation. Benefit: tough, durable parts (phone cases, helmets). Trade-off: slight reduction in stiffness, transparency.",
      keywords: ["impact", "modification", "elastomer", "tough", "energy absorption"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_004",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "Explain flame retardant compounds.",
      expectedAnswer:
        "Flame retardants reduce polymer flammability. Types: 1) Halogenated (effective, environmental concern), 2) Phosphorus-based (better environmental profile), 3) Mineral fillers. Mechanism: absorb heat, release non-flammable gas, form protective char layer. Applications: electrical, aerospace, automotive. Requirement: Pass standards like UL94, LOI testing. Trade-off: often increases cost, can affect processing.",
      keywords: ["flame retardant", "halogenated", "phosphorus", "UL94", "safety"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_005",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "MEDIUM",
      question: "What is UV stabilization and why is it needed?",
      expectedAnswer:
        "UV radiation degrades polymers (chain breaking, discoloration, brittle). UV stabilizers prevent this through: 1) UV absorbers (convert to heat), 2) Hindered amine light stabilizers (HALS - trap free radicals). Applications: outdoor products (pipes, automotive, outdoor furniture). Without UV protection: product fails in 1-2 years outdoors. With protection: 10+ year lifespan. Cost: worth it for outdoor applications.",
      keywords: ["UV", "stabilization", "outdoor", "degradation", "protection"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_006",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What are biodegradable polymers?",
      expectedAnswer:
        "Biodegradable polymers break down via microbes/environment. Types: 1) PLA (polylactic acid - from corn), 2) PHA (polyhydroxyalkanoate), 3) Starch-based blends. Advantages: eco-friendly, compostable. Limitations: higher cost (2-3x regular), slower processing, lower properties. Market: packaging, agriculture. Challenge: need specific conditions (industrial composting) to truly biodegrade. Not a silver bullet, but part of sustainability solution.",
      keywords: ["biodegradable", "PLA", "compostable", "eco-friendly", "sustainability"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_007",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "Explain rheology in polymer processing.",
      expectedAnswer:
        "Rheology = how polymer flows under stress. Key concepts: 1) Viscosity - resistance to flow. Higher temp = lower viscosity = easier flow. 2) Shear thinning - viscosity decreases with faster flow (good for processing), 3) Non-Newtonian - viscosity depends on shear rate. Importance: determines processing conditions, cycle time, part quality. Measured via melt flow index (MFI) or rheometer. Understanding rheology = optimize processes = reduce costs.",
      keywords: ["rheology", "viscosity", "shear thinning", "flow", "processing"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_008",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What is shrinkage and warpage?",
      expectedAnswer:
        "Shrinkage: Polymer contracts as it cools (density increase). Typical: 0.3-2%. Causes: volume loss from crystallization, thermal contraction. Warpage: Non-uniform shrinkage = distortion. Causes: uneven cooling, mold design, thick sections. Impact: dimensional tolerance issues, part defects. Solutions: mold temperature control, gate location design, cooling channel optimization, material selection. Critical for precision parts (connectors, automotive).",
      keywords: ["shrinkage", "warpage", "cooling", "crystallization", "tolerance"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_009",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "How do additives affect final product performance?",
      expectedAnswer:
        "Additives can: 1) Improve properties (UV stabilizers, impact modifiers), 2) Enable processing (plasticizers, flow aids), 3) Reduce cost (fillers, recycled content), 4) Add function (conductive carbon for ESD). Careful formulation needed: right combination, right quantities. Example: Too much UV stabilizer = yellowing. Wrong plasticizer = migration. Deep knowledge of additive chemistry = competitive advantage.",
      keywords: ["additives", "formulation", "synergy", "optimization", "performance"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "em_q_010",
      jobRole: "EXECUTIVE_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What is lot-to-lot variation?",
      expectedAnswer:
        "Lot-to-lot variation = differences between production batches. Causes: 1) Raw material variation (different suppliers, batches), 2) Process variations (temperature, pressure drift), 3) Seasonal factors (ambient humidity). Impact: Customer processes unstable, part quality fluctuates, complaints increase. Solution: 1) Strict raw material spec, 2) Process controls, 3) QC testing each batch, 4) Statistical monitoring. Consistency = customer confidence = loyalty.",
      keywords: ["variation", "batch", "consistency", "quality control", "process"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
  ],

  ASSISTANT_MANAGER_MARKETING: [
    // 30 questions for Assistant Manager level (6-12+ years)
    {
      questionId: "am_intro_001",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "INTRODUCTORY",
      difficulty: "HARD",
      question: "Welcome to the senior level assessment. As a candidate for Assistant Manager, could you detail your experience in managing complex industrial client portfolios and your vision for driving polymer sales in emerging markets?",
      expectedAnswer: "Details portfolio management, mentions leadership/management skills, and provides a strategic vision for market growth.",
      keywords: ["portfolio", "management", "vision", "strategy", "leadership"],
      estimatedTime: 5,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_001",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "How do polymer molecular weight and distribution affect performance?",
      expectedAnswer:
        "Molecular weight (MW): Higher MW = stronger, higher melting point, better chemical resistance, but harder processing. Molecular weight distribution (MWD): Narrow MWD = consistent properties, easier processing. Wide MWD = processable but broader property range. Optimization requires: 1) Right average MW for application, 2) Controlled MWD for consistency, 3) Testing across batches. Advanced: Use gel permeation chromatography (GPC) to characterize. Strategic advantage: Understanding MW/MWD = design better products = higher margin.",
      keywords: ["molecular weight", "distribution", "GPC", "performance", "optimization"],
      estimatedTime: 7,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_002",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "Explain compounding formulation design.",
      expectedAnswer:
        "Formulation design = selecting base polymer + additives to meet target properties. Process: 1) Understand customer requirements (specs, cost, processing), 2) Select base polymer (PE, PP, etc.), 3) Add additives strategically (stabilizers, colorants, modifiers), 4) Prototype + test, 5) Optimize vs cost. Challenges: Additives interact (synergies/antagonisms), processing constraints, regulatory compliance. Advanced: Use DOE (Design of Experiments) to optimize formulations. Competitive advantage: Proprietary formulations = differentiation = premium pricing.",
      keywords: ["formulation", "design", "additives", "optimization", "testing"],
      estimatedTime: 8,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_003",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "How do fillers influence mechanical and thermal properties?",
      expectedAnswer:
        "Fillers (talc, CaCO3, glass fiber) affect properties: 1) Mechanical: Reinforcing fillers ↑ stiffness/strength, but ↓ impact. Example: 30% glass-filled nylon significantly stronger. 2) Thermal: Fillers ↑ heat deflection temperature, ↓ thermal expansion. 3) Cost reduction: Fillers cheaper than polymers. Key: Filler loading (5-50%), particle size, surface treatment. Optimization: Balance performance + cost. Advanced: Computer modeling to predict properties.",
      keywords: ["fillers", "reinforcement", "mechanical", "thermal", "loading"],
      estimatedTime: 7,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_004",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "PROBLEM_SOLVING",
      difficulty: "HARD",
      question: "Trade-offs between cost and performance in compound design.",
      expectedAnswer:
        "Design challenge: More performance (fillers, additives) = higher cost. Less cost (lower fillers) = lower performance. Strategy: 1) Understand customer's true need (premium performance vs cost-driven), 2) Test multiple formulations (cost vs property matrix), 3) Find sweet spot (80% performance at 50% cost), 4) Educate customer (value-based pricing). Example: Medical-grade compound might cost 5x more than standard, justified by regulatory compliance. Business skill: Cost-benefit analysis, customer segmentation, value selling.",
      keywords: ["trade-off", "cost", "performance", "optimization", "value"],
      estimatedTime: 7,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_005",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What is compatibilization in polymer blends?",
      expectedAnswer:
        "Polymer blends: Mix two incompatible polymers to combine properties. Problem: Phase separation = poor interface = weak performance. Solution: Add compatibilizer (usually graft copolymer) that bridges phases. Example: PE + PVC blend needs LDPE-graft-maleic anhydride compatibilizer. Result: Improved adhesion, better properties. Applications: Cost reduction (blend expensive polymer with cheap one), tailor properties. Advanced technique: Requires R&D expertise. Business: Proprietary blends = differentiation.",
      keywords: ["blends", "compatibilization", "interface", "properties", "R&D"],
      estimatedTime: 7,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_006",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "REAL_WORLD_SCENARIO",
      difficulty: "HARD",
      question: "How do you optimize polymer formulations for specific industries?",
      expectedAnswer:
        "Industry optimization examples: 1) Automotive: Impact resistance + heat deflection + UV protection + cost competitive. 2) Medical: FDA compliance + sterilization resistance + low leaching. 3) Food packaging: FDA compliance + clarity + barrier properties. 4) Electrical: Flame retardancy + insulation + low smoke. Process: 1) Interview customer for requirements, 2) Design multiple candidates, 3) Run full testing (mechanical, thermal, regulatory), 4) Cost analysis, 5) Pilot production, 6) Launch. Timeline: 2-6 months per formulation. Business: Industry-specific solutions = premium pricing + loyalty.",
      keywords: ["industry", "optimization", "requirements", "compliance", "testing"],
      estimatedTime: 8,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_007",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "Explain heat aging and long-term performance testing.",
      expectedAnswer:
        "Heat aging = expose polymer to high temperature for extended time to simulate aging. Purpose: Predict real-world lifespan. Standard: ASTM D573 (air oven aging). Example: 1000 hours at 100°C. Measure: Property retention (% tensile strength remaining). Result: Estimate product lifespan. Applications: automotive, electrical (where heat stress is real). Advanced: Accelerated aging (higher temp) correlates with real-world aging via Arrhenius equation. Competitive advantage: Provide aged sample data → build customer confidence in durability.",
      keywords: ["heat aging", "long-term", "lifespan", "ASTM", "durability"],
      estimatedTime: 7,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_008",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "How do regulatory norms affect polymer formulation?",
      expectedAnswer:
        "Regulations require specific formulations: 1) FDA (food contact): Only approved additives allowed. 2) RoHS (electronics): No heavy metals. 3) REACH (EU): Restricted substances list. 4) Automotive: Heavy metal restrictions, flame standards. 5) Medical: Biocompatibility testing required. Impact: Some cheaper additives banned → cost ↑. Compliance testing: Expensive. Global sales = multiple certifications = complexity. Strategy: Design compliant formulations upfront. Business: Certified products = access to regulated markets = higher prices.",
      keywords: ["regulation", "FDA", "RoHS", "REACH", "compliance"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_009",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "TECHNICAL_DEEP_DIVE",
      difficulty: "HARD",
      question: "What are specialty polymers and their applications?",
      expectedAnswer:
        "Specialty polymers = high-performance materials for demanding applications. Examples: 1) Polyetheretherketone (PEEK): aerospace, medical, high temperature. 2) Polyimide (PI): electronics, aerospace. 3) Liquid Crystal Polymers (LCP): thin-wall molding, electronic components. 4) Polyphenylene Sulfide (PPS): electrical, automotive. Characteristics: High performance, biocompatibility, chemical resistance, high cost (10-100x regular polymers). Market: Premium, low volume, high margins. Business opportunity: Niche markets, technical differentiation, loyal customers.",
      keywords: ["specialty polymers", "PEEK", "performance", "aerospace", "premium"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
    {
      questionId: "am_q_010",
      jobRole: "ASSISTANT_MANAGER_MARKETING",
      category: "BEHAVIORAL",
      difficulty: "HARD",
      question: "How do you evaluate supplier raw materials technically?",
      expectedAnswer:
        "Supplier evaluation: 1) On-site audit (capacity, quality systems, certifications), 2) Technical testing (raw material specs vs claims), 3) Consistency checks (multiple batches), 4) Performance testing (compound made from their raw material), 5) Reference calls (other customers). Red flags: Inconsistent specs, missed deadlines, poor QC. Benefit: Reliable supply = product consistency = customer satisfaction. Risk mitigation: Qualify multiple suppliers. Business: Good suppliers = competitive advantage (cost, quality, reliability).",
      keywords: ["supplier", "evaluation", "quality", "consistency", "audit"],
      estimatedTime: 6,
      createdBy: "admin@maskpolymers.com",
    },
  ],
};

// Function to seed questions into database
async function seedQuestionBank(InterviewQuestionBank, TechnicalQuestionBank) {
  try {
    console.log("🌱 Seeding Interview Question Bank...");

    for (const [roleKey, questions] of Object.entries(MARKETING_QUESTIONS)) {
      for (const question of questions) {
        await InterviewQuestionBank.create(question);
      }
      console.log(`✅ Seeded ${questions.length} questions for ${roleKey}`);
    }

    console.log("✅ Question Bank seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
  }
}

module.exports = { MARKETING_QUESTIONS, seedQuestionBank };
