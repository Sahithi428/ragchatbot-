import json
from datetime import datetime, timedelta

def get_seed_opportunities():
    today = datetime.now()
    
    def date_in_days(days):
        return (today + timedelta(days=days)).strftime("%Y-%m-%d")

    data = [
        # Tech & Data Science Internships
        {
            "title": "Data Science Summer Intern 2027",
            "org": "Google",
            "type": "internship",
            "deadline": date_in_days(5),  # Urgent red (<7 days)
            "min_gpa": 3.5,
            "majors": ["Computer Science", "Data Science", "Statistics", "Applied Math"],
            "class_years": ["Sophomore", "Junior"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "Remote",
            "amount_stipend": "$55 / hour + $4,000 relocation stipend",
            "description": "Work on cutting-edge machine learning pipelines, predictive modeling, and large-scale data analytics under direct mentorship from Google Research engineers.",
            "application_url": "https://careers.google.com/jobs/results/data-science-intern",
            "tags": ["Data Science", "Machine Learning", "Python", "Remote"]
        },
        {
            "title": "Software Engineering Intern - Frontend",
            "org": "Meta",
            "type": "internship",
            "deadline": date_in_days(18),  # Amber (<30 days)
            "min_gpa": 3.2,
            "majors": ["Computer Science", "Software Engineering", "Computer Engineering"],
            "class_years": ["Junior", "Senior"],
            "citizenship_req": "US Citizen",
            "location_type": "onsite",
            "location": "Menlo Park, CA",
            "amount_stipend": "$58 / hour",
            "description": "Build high-impact user interfaces using React, TypeScript, and Relay across Facebook and Instagram web products.",
            "application_url": "https://www.metacareers.com/v2/jobs/swe-intern",
            "tags": ["Frontend", "React", "TypeScript", "Onsite"]
        },
        {
            "title": "AI/ML Research Intern",
            "org": "Anthropic",
            "type": "internship",
            "deadline": date_in_days(25),
            "min_gpa": 3.6,
            "majors": ["Computer Science", "Data Science", "Artificial Intelligence", "Physics", "Math"],
            "class_years": ["Junior", "Senior", "Graduate"],
            "citizenship_req": "Any",
            "location_type": "hybrid",
            "location": "San Francisco, CA",
            "amount_stipend": "$65 / hour + housing allowance",
            "description": "Collaborate with alignment research teams to evaluate and train frontier large language models with RLHF and Constitutional AI techniques.",
            "application_url": "https://www.anthropic.com/careers/aiml-intern",
            "tags": ["AI", "LLM", "Research", "PyTorch", "Hybrid"]
        },
        {
            "title": "Cybersecurity Operations Intern",
            "org": "CrowdStrike",
            "type": "internship",
            "deadline": date_in_days(42),
            "min_gpa": 3.0,
            "majors": ["Cybersecurity", "Computer Science", "Information Technology"],
            "class_years": ["Sophomore", "Junior", "Senior"],
            "citizenship_req": "US Citizen",
            "location_type": "remote",
            "location": "Remote",
            "amount_stipend": "$40 / hour",
            "description": "Analyze cloud infrastructure threat vectors, participate in incident response simulations, and build automated threat detection playbooks.",
            "application_url": "https://www.crowdstrike.com/careers/internships",
            "tags": ["Cybersecurity", "Cloud", "Python", "Remote"]
        },
        {
            "title": "Cloud Solutions Developer Intern",
            "org": "Amazon Web Services (AWS)",
            "type": "internship",
            "deadline": date_in_days(12),
            "min_gpa": 3.0,
            "majors": ["Computer Science", "Information Systems", "Software Engineering"],
            "class_years": ["Sophomore", "Junior"],
            "citizenship_req": "Any",
            "location_type": "hybrid",
            "location": "Seattle, WA",
            "amount_stipend": "$50 / hour",
            "description": "Architect scalable microservices on AWS Lambda, DynamoDB, and ECS. Design API gateways and serverless backend services.",
            "application_url": "https://www.amazon.jobs/en/teams/internships",
            "tags": ["Cloud", "AWS", "Backend", "Python", "Java"]
        },

        # Scholarships
        {
            "title": "Women in STEM Leadership Scholarship",
            "org": "Society of Women Engineers (SWE)",
            "type": "scholarship",
            "deadline": date_in_days(4),  # Urgent red (<7 days)
            "min_gpa": 3.5,
            "majors": ["Computer Science", "Data Science", "Electrical Engineering", "Mechanical Engineering", "Biomedical Engineering"],
            "class_years": ["Sophomore", "Junior", "Senior"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$10,000 annual grant",
            "description": "Awarded to outstanding female undergraduate students pursuing degrees in science, technology, engineering, or mathematics who demonstrate academic excellence and campus leadership.",
            "application_url": "https://swe.org/scholarships",
            "tags": ["Scholarship", "STEM", "Diversity", "Women in Tech"]
        },
        {
            "title": "National Undergraduate Tech Excellence Award",
            "org": "National Science Foundation",
            "type": "scholarship",
            "deadline": date_in_days(14),
            "min_gpa": 3.8,
            "majors": ["Computer Science", "Engineering", "Data Science", "Physics", "Mathematics"],
            "class_years": ["Freshman", "Sophomore", "Junior", "Senior"],
            "citizenship_req": "US Citizen",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$15,000 fellowship grant",
            "description": "Merit-based national award for undergraduate students exhibiting exceptional academic performance and research promise in technology and exact sciences.",
            "application_url": "https://www.nsf.gov/grants/undergraduate",
            "tags": ["Merit", "NSF", "Research", "Scholarship"]
        },
        {
            "title": "First-Gen College Pioneer Scholarship",
            "org": "Pioneer Education Trust",
            "type": "scholarship",
            "deadline": date_in_days(28),
            "min_gpa": 2.8,
            "majors": ["All Majors"],
            "class_years": ["Freshman", "Sophomore"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$7,500 / year",
            "description": "Supporting first-generation college students from diverse backgrounds with tuition stipends, professional mentorship, and career networking events.",
            "application_url": "https://pioneeredu.org/scholarships",
            "tags": ["First-Gen", "Need-Based", "Mentorship", "All Majors"]
        },
        {
            "title": "Future Hispanic Leaders in Technology Fellowship",
            "org": "SHPE Foundation",
            "type": "scholarship",
            "deadline": date_in_days(35),
            "min_gpa": 3.0,
            "majors": ["Computer Science", "Information Systems", "Industrial Engineering", "Data Science"],
            "class_years": ["Sophomore", "Junior", "Senior", "Graduate"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$8,000 award",
            "description": "Empowering Hispanic and Latino students pursuing STEM majors with financial awards and attendance stipends for the annual SHPE National Convention.",
            "application_url": "https://shpe.org/students/scholarships",
            "tags": ["Hispanic", "Diversity", "Tech", "SHPE"]
        },

        # Healthcare & Bio
        {
            "title": "Bioinformatics & Health AI Research Intern",
            "org": "Broad Institute of MIT and Harvard",
            "type": "internship",
            "deadline": date_in_days(21),
            "min_gpa": 3.4,
            "majors": ["Bioinformatics", "Computational Biology", "Computer Science", "Biomedical Engineering"],
            "class_years": ["Junior", "Senior", "Graduate"],
            "citizenship_req": "Any",
            "location_type": "onsite",
            "location": "Cambridge, MA",
            "amount_stipend": "$4,500 / month + housing stipend",
            "description": "Analyze genomic sequence datasets using deep learning models to identify cancer biomarker mutations and target drug pathways.",
            "application_url": "https://www.broadinstitute.org/careers/internships",
            "tags": ["Bioinformatics", "Genomics", "AI", "Healthcare"]
        },
        {
            "title": "Medical Tech Innovation Scholarship",
            "org": "MedTech Scholars Network",
            "type": "scholarship",
            "deadline": date_in_days(45),
            "min_gpa": 3.2,
            "majors": ["Biomedical Engineering", "Bioinformatics", "Biology", "Pre-Med"],
            "class_years": ["Sophomore", "Junior", "Senior"],
            "citizenship_req": "Permanent Resident",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$5,000",
            "description": "Financial support for students working at the intersection of medicine, hardware engineering, and digital health diagnostic solutions.",
            "application_url": "https://medtechscholars.org/apply",
            "tags": ["MedTech", "Biomedical", "Scholarship"]
        },

        # Business & Finance
        {
            "title": "Financial Quantitative Analytics Intern",
            "org": "Goldman Sachs",
            "type": "internship",
            "deadline": date_in_days(8),
            "min_gpa": 3.6,
            "majors": ["Financial Engineering", "Finance", "Economics", "Computer Science", "Applied Math"],
            "class_years": ["Junior"],
            "citizenship_req": "US Citizen",
            "location_type": "onsite",
            "location": "New York, NY",
            "amount_stipend": "$52 / hour",
            "description": "Develop algorithmic trading models, risk mitigation frameworks, and statistical arbitrage tools alongside quantitative strategists.",
            "application_url": "https://www.goldmansachs.com/careers/students/programs",
            "tags": ["Finance", "Quant", "Math", "New York"]
        },
        {
            "title": "Product Management Undergraduate Fellow",
            "org": "Microsoft",
            "type": "internship",
            "deadline": date_in_days(19),
            "min_gpa": 3.3,
            "majors": ["Computer Science", "Business Administration", "Information Systems", "Human-Computer Interaction"],
            "class_years": ["Junior", "Senior"],
            "citizenship_req": "Any",
            "location_type": "hybrid",
            "location": "Redmond, WA",
            "amount_stipend": "$48 / hour",
            "description": "Define product specs, lead customer user research, prioritize feature roadmaps, and coordinate with engineering squads across Azure AI platform.",
            "application_url": "https://careers.microsoft.com/students/us/en/pm-intern",
            "tags": ["Product Management", "Business", "UX", "Hybrid"]
        },

        # Additional Tech & Design Internships & Scholarships
        {
            "title": "UX/UI Product Design Summer Intern",
            "org": "Figma",
            "type": "internship",
            "deadline": date_in_days(30),
            "min_gpa": 3.0,
            "majors": ["Design", "Human-Computer Interaction", "Computer Science", "Digital Media"],
            "class_years": ["Sophomore", "Junior"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "Remote",
            "amount_stipend": "$45 / hour",
            "description": "Craft intuitive interaction patterns, design web components, and conduct usability tests for collaborative design software features.",
            "application_url": "https://www.figma.com/careers",
            "tags": ["UI/UX", "Design", "Figma", "Remote"]
        },
        {
            "title": "Black Tech Creators Scholarship",
            "org": "Black in Tech Foundation",
            "type": "scholarship",
            "deadline": date_in_days(6),  # Urgent red (<7 days)
            "min_gpa": 2.7,
            "majors": ["Computer Science", "Software Engineering", "Graphic Design", "Data Science"],
            "class_years": ["Freshman", "Sophomore", "Junior", "Senior"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$6,000 scholarship + free laptop",
            "description": "Designed to support Black college students building digital tools, open source projects, or tech startups with tuition grants and hardware.",
            "application_url": "https://blackintech.org/scholarships",
            "tags": ["Diversity", "Scholarship", "BlackInTech", "Hardware"]
        },
        {
            "title": "DevOps & SRE Infrastructure Intern",
            "org": "Datadog",
            "type": "internship",
            "deadline": date_in_days(33),
            "min_gpa": 3.0,
            "majors": ["Computer Science", "Computer Engineering", "System Administration"],
            "class_years": ["Junior", "Senior"],
            "citizenship_req": "US Citizen",
            "location_type": "remote",
            "location": "Remote",
            "amount_stipend": "$46 / hour",
            "description": "Deploy Kubernetes clusters, automate Terraform infrastructure workflows, and optimize real-time telemetry metrics pipelines.",
            "application_url": "https://www.datadoghq.com/careers/internships",
            "tags": ["DevOps", "Kubernetes", "Infrastructure", "Remote"]
        },
        {
            "title": "Quantum Computing Undergraduate Fellowship",
            "org": "IBM Research",
            "type": "internship",
            "deadline": date_in_days(40),
            "min_gpa": 3.7,
            "majors": ["Physics", "Computer Science", "Mathematics", "Electrical Engineering"],
            "class_years": ["Junior", "Senior", "Graduate"],
            "citizenship_req": "Any",
            "location_type": "onsite",
            "location": "Yorktown Heights, NY",
            "amount_stipend": "$55 / hour",
            "description": "Implement Qiskit quantum algorithms, optimize superconducting qubit pulse calibrations, and simulate quantum error correction codes.",
            "application_url": "https://www.ibm.com/quantum/careers",
            "tags": ["Quantum", "Physics", "Qiskit", "Research"]
        },
        {
            "title": "Environmental Science & Climate Tech Grant",
            "org": "Earth Clean Energy Trust",
            "type": "scholarship",
            "deadline": date_in_days(50),
            "min_gpa": 3.1,
            "majors": ["Environmental Engineering", "Civil Engineering", "Data Science", "Chemistry"],
            "class_years": ["Sophomore", "Junior", "Senior"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$9,000 project grant",
            "description": "Awarded to undergraduate student initiatives leveraging data modeling or hardware prototyping to combat climate change.",
            "application_url": "https://earthcleanenergy.org/grants",
            "tags": ["ClimateTech", "Sustainability", "Engineering", "Scholarship"]
        },
        {
            "title": "Mobile App Engineering Intern (iOS/Android)",
            "org": "Uber",
            "type": "internship",
            "deadline": date_in_days(16),
            "min_gpa": 3.3,
            "majors": ["Computer Science", "Software Engineering"],
            "class_years": ["Sophomore", "Junior"],
            "citizenship_req": "Any",
            "location_type": "hybrid",
            "location": "San Francisco, CA",
            "amount_stipend": "$54 / hour",
            "description": "Build high-throughput mobile UI components in Swift and Kotlin for millions of Uber drivers and riders globally.",
            "application_url": "https://www.uber.com/careers/internships",
            "tags": ["Mobile", "iOS", "Android", "Swift", "Kotlin"]
        },
        {
            "title": "High School to College Bridge Tech Scholarship",
            "org": "NextGen Innovators",
            "type": "scholarship",
            "deadline": date_in_days(22),
            "min_gpa": 2.5,
            "majors": ["All Majors"],
            "class_years": ["Freshman"],
            "citizenship_req": "Any",
            "location_type": "remote",
            "location": "National",
            "amount_stipend": "$3,500 direct grant",
            "description": "Transition grant for incoming college freshmen entering accredited STEM or digital arts degree programs.",
            "application_url": "https://nextgeninnovators.org/bridge-scholarship",
            "tags": ["Freshman", "Bridge", "Scholarship", "All Majors"]
        }
    ]

    # Dynamically generate additional realistic records to reach 50+ items
    base_titles = [
        ("Full Stack Web Developer Intern", "Stripe", "internship", ["Computer Science", "Information Systems"], ["Sophomore", "Junior"], 3.2, "remote", "Remote", "$48/hr", ["Web", "React", "Node", "Remote"]),
        ("Machine Learning Infrastructure Intern", "Snowflake", "internship", ["Computer Science", "Data Science"], ["Junior", "Senior"], 3.5, "onsite", "San Mateo, CA", "$56/hr", ["MLOps", "Python", "C++"]),
        ("Robotics & Perception Intern", "NVIDIA", "internship", ["Computer Engineering", "Mechanical Engineering", "Computer Science"], ["Junior", "Senior", "Graduate"], 3.6, "onsite", "Santa Clara, CA", "$60/hr", ["Robotics", "C++", "CUDA", "AI"]),
        ("Cyber Defense Fellowship", "Department of Homeland Security", "scholarship", ["Cybersecurity", "Computer Science"], ["Junior", "Senior"], 3.3, "remote", "National", "$12,000 stipend", ["Cybersecurity", "Federal", "US Citizen"]),
        ("Empowerment in STEM Scholarship", "Google & Thurgood Marshall Fund", "scholarship", ["Computer Science", "Electrical Engineering"], ["Freshman", "Sophomore", "Junior", "Senior"], 3.0, "remote", "National", "$10,000 grant", ["HBCU", "Diversity", "Google"]),
        ("Backend Services Engineering Intern", "DoorDash", "internship", ["Computer Science", "Software Engineering"], ["Sophomore", "Junior"], 3.1, "remote", "Remote", "$47/hr", ["Backend", "Go", "Kotlin"]),
        ("Data Analytics & Business Intelligence Intern", "Salesforce", "internship", ["Data Science", "Business Analytics", "Information Systems"], ["Sophomore", "Junior"], 3.0, "hybrid", "San Francisco, CA", "$44/hr", ["SQL", "Tableau", "Analytics"]),
        ("Future Engineers Leadership Award", "Boeing Foundation", "scholarship", ["Aerospace Engineering", "Mechanical Engineering", "Electrical Engineering"], ["Sophomore", "Junior", "Senior"], 3.4, "remote", "National", "$8,500 grant", ["Aerospace", "Engineering", "Scholarship"]),
        ("Game Engine Developer Intern", "Epic Games", "internship", ["Computer Science", "Game Development", "Digital Media"], ["Junior", "Senior"], 3.3, "hybrid", "Cary, NC", "$42/hr", ["Unreal Engine", "C++", "Gaming"]),
        ("FinTech Innovation Summer Scholar", "Plaid", "internship", ["Computer Science", "Economics", "Finance"], ["Junior"], 3.4, "remote", "Remote", "$50/hr", ["FinTech", "APIs", "Remote"])
    ]

    for i in range(1, 35):
        base = base_titles[i % len(base_titles)]
        days_offset = (i * 3) + 2
        opp_type = base[2]
        
        item = {
            "title": f"{base[0]} #{i+1}",
            "org": f"{base[1]}",
            "type": opp_type,
            "deadline": date_in_days(days_offset),
            "min_gpa": round(min(3.9, max(2.5, base[5] + ((i % 5 - 2) * 0.1))), 2),
            "majors": base[3],
            "class_years": base[4],
            "citizenship_req": "US Citizen" if i % 3 == 0 else "Any",
            "location_type": base[6],
            "location": base[7],
            "amount_stipend": base[8],
            "description": f"Targeted program by {base[1]} designed for motivated students looking to excel in {base[0]}. Provides hands-on projects, industry mentorship, and career growth opportunities.",
            "application_url": f"https://example.com/apply/{opp_type}/{i+1}",
            "tags": base[9]
        }
        data.append(item)

    return data
