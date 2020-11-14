'use strict';

var app = angular.module('hirepoolApp');

app.factory('ConstantsFactory', function () {
  return {
    OpportunitySourceDropdownOptions: [
      {
        optgroup: 'Job Boards',
        options: [
          'AngelList',
          'Craigslist',
          'Glassdoor',
          'Google',
          'Indeed',
          'LinkedIn',
          'Monster',
          'SimplyHired',
          'TheLadders'
        ],
      },
      {
        optgroup: 'Networking',
        options: [
          'Meetup',
          'Facebook',
          'Twitter',
          'LinkedIn',
          'Recruiter',
          'Referral'
        ]
      },
      {
        optgroup: 'Company Direct',
        options: [
          'Career site',
          'Company reached out to me'
        ]
      },
      {
        options: [
          'Career Fair',
          'Other'
        ]
      },
    ],
    OpportunityRoleAutoCompleteOptions: [
      {
        role: 'Operations',
      },
      {
        role: 'Business Operations',
      },
      {
        role: 'Sales Operations',
      },
      {
        role: 'Customer Success',
      },
      {
        role: 'Android Development',
      },
      {
        role: 'Data Analytics',
      },
      {
        role: 'Data Science',
      },
      {
        role: 'Digital Marketing',
      },
      {
        role: 'iOS Development',
      },
      {
        role: 'Machine Learning',
      },
      {
        role: 'Mobile App Development',
      },
      {
        role: 'Software Engineering',
      },
      {
        role: 'Virtual Reality',
      },
      {
        role: 'Web Development',
      },
      {
        role: 'Front-End Web Development',
      },
      {
        role: 'Full Stack Web Development',
      },
      {
        role: 'Augmented Reality',
      },
      {
        role: 'Robotics',
      },
      {
        role: 'Deep Learning',
      },
      {
        role: 'Artificial Intelligence',
      },
      {
        role: 'Unmanned Autonomous Vehicles',
      },
      {
        role: 'Self-Driving Cars',
      },
      {
        role: 'Business Systems Analysis',
      },
      {
        role: 'Social Media Management',
      },
      {
        role: 'Marketing Operations',
      },
      {
        role: 'SEO Management',
      },
      {
        role: 'Web Analytics Developer',
      },
      {
        role: 'Growth Hacking',
      },
      {
        role: 'Content Management',
      },
      {
        role: 'Information Architecture',
      },
      {
        role: 'UX Design',
      },
      {
        role: 'UX Research',
      },
      {
        role: 'UI Design',
      },
      {
        role: 'Accessibility',
      },
      {
        role: 'Interaction Design',
      },
      {
        role: 'Wordpress Development',
      },
      {
        role: 'Systems Engineering',
      },
      {
        role: 'Systems Administration',
      },
      {
        role: 'Database Administration',
      },
      {
        role: 'Data Architecture',
      },
      {
        role: 'Data Modeling',
      },
      {
        role: 'Cloud Architecture',
      },
      {
        role: 'DevOps Management',
      },
      {
        role: 'Agile Project Management',
      },
      {
        role: 'Product Management',
      },
      {
        role: 'Product Design',
      },
      {
        role: 'Technical Account Management',
      },
      {
        role: 'Game Development',
      },
      {
        role: 'Computer Graphics Animation',
      },
      {
        role: 'Security',
      },
      {
        role: 'Corporate Executive Management',
      },
      {
        role: 'Accounting',
      },
      {
        role: 'Finance',
      },
      {
        role: 'Supply Chain Management',
      },
      {
        role: 'Sales',
      },
      {
        role: 'Marketing',
      },
      {
        role: 'Business Development',
      },
      {
        role: 'Investment Banking',
      },
      {
        role: 'Customer Service',
      },
      {
        role: 'Administrative',
      },
      {
        role: 'Communications',
      },
      {
        role: 'Human Resources',
      },
      {
        role: 'People Operations',
      },
      {
        role: 'Project Management',
      },
      {
        role: 'Quality Management',
      },
      {
        role: 'Factory Operations Management',
      },
      {
        role: 'Facilities Management',
      },
      {
        role: 'Legal',
      },
      {
        role: 'Engineering',
      },
      {
        role: 'Architecture',
      },
      {
        role: 'Auto Mechanics',
      },
      {
        role: 'Bartending',
      },
      {
        role: 'Biology',
      },
      {
        role: 'Biomedical Engineering',
      },
      {
        role: 'Bookkeeping',
      },
      {
        role: 'Masonry',
      },
      {
        role: 'Cardiovascular',
      },
      {
        role: 'Cuisine',
      },
      {
        role: 'Chemical',
      },
      {
        role: 'Childcare',
      },
      {
        role: 'Chiropractic',
      },
      {
        role: 'Appriasal',
      },
      {
        role: 'Compensation and Benefits',
      },
      {
        role: 'Computer Programming',
      },
      {
        role: 'Computer Systems Analysis',
      },
      {
        role: 'Construction',
      },
      {
        role: 'Consulting',
      },
      {
        role: 'Cooking',
      },
      {
        role: 'Journalism',
      },
      {
        role: 'Dental',
      },
      {
        role: 'Sonography',
      },
      {
        role: 'Nutrition',
      },
      {
        role: 'Medical',
      },
      {
        role: 'Entertainment',
      },
      {
        role: 'Electric',
      },
      {
        role: 'Paramedics',
      },
      {
        role: 'Education',
      },
      {
        role: 'Epidemiology',
      },
      {
        role: 'Event Planning',
      },
      {
        role: 'Fashion',
      },
      {
        role: 'Firefighting',
      },
      {
        role: 'Fitness Training',
      },
      {
        role: 'Fundraising',
      },
      {
        role: 'Criminal Justice',
      },
      {
        role: 'Writing',
      },
      {
        role: 'Graphic Design',
      },
      {
        role: 'Counseling',
      },
      {
        role: 'Fashion',
      },
      {
        role: 'Housekeeping',
      },
      {
        role: 'Industrial Design',
      },
      {
        role: 'Interior Design',
      },
      {
        role: 'Industrial Production Management',
      },
      {
        role: 'Underwriting',
      },
      {
        role: 'Linguistics',
      },
      {
        role: 'Custodial',
      },
      {
        role: 'Loan Management',
      },
      {
        role: 'Market Research',
      },
      {
        role: 'Massage Therapy',
      },
      {
        role: 'Mechanical Engineering',
      },
      {
        role: 'Medical Assistance',
      },
      {
        role: 'Modeling',
      },
      {
        role: 'Nursing',
      },
      {
        role: 'Occupational Therapy',
      },
      {
        role: 'Personal Training',
      },
      {
        role: 'Pharmacueticals',
      },
      {
        role: 'Photography',
      },
      {
        role: 'Plumbing',
      },
      {
        role: 'Public Service',
      },
      {
        role: 'Production',
      },
      {
        role: 'Purchasing',
      },
      {
        role: 'Office Management',
      },
      {
        role: 'Retail',
      },
      {
        role: 'Roofing',
      },
      {
        role: 'Social Work',
      },
      {
        role: 'Special Education',
      },
      {
        role: 'Logistics',
      },
      {
        role: 'Technical Writing',
      },
      {
        role: 'Training and Development Management',
      },
      {
        role: 'Veterinary',
      },
      {
        role: 'Food Service',
      },
      {
        role: 'Learning and Development Management'
      },
      {
        role: 'Recruiting'
      },
      {
        role: 'Talent Acquisition'
      },
      {
        role: 'Staffing'
      },
      {
        role: 'Talent Operations'
      },
      {
        role: 'Recruiting Operations'
      },
    ],
    OfferStatusDropdownOptions: [
      'Verbal',
      'Written',
      'Accepted',
      'Declined',
      'Other'
    ],
    EventStyleDropdownOptions: [
      'In-person',
      'Online',
      'Phone',
      'Other'
    ],
    EventSubstyleDropdownOptions: [
      'Interview',
      'Networking',
      'Other'
    ],
    InteractionStyleDropdownOptions: [
      'Behavioral Interview',
      'Case Study',
      'Coding Challenge',
      'Coffee',
      'Cultural Interview',
      'Design Challenge',
      'Dinner',
      'Final Round',
      'Group Interview',
      'Lunch',
      'Pair Programming',
      'Portfolio Review',
      'Problem Solving',
      'Situational Interview',
      'Technical Interview',
      'Whiteboarding Challenge',
      'Other'
    ],
    ParticipantRelationshipDropdownOptions: [
      'My recruiter',
      'My recruiting coordinator',
      'My boss',
      'My boss\'s boss',
      'My peer',
      'My direct report',
      'My co-worker in another department',
      'My friend',
      'An executive from another department',
      'Other'
    ],
    EventModalStrings: {
      add_event_date: 'When will this happen?'
    },
    EventModalTitles: {
      add_event_and_opportunity: 'Add Event',
      opportunity_details: 'Add Opportunity Details',
      event_details: 'Add Event Details',
      poc: 'Point of Contact',
      add_interaction: 'Add Interactions',
      summary: 'Summary'
    },
    EventModalSubtitles: {
      add_event_and_opportunity: 'Describe the event and tie it to an opportunity.',
      opportunity_details: 'Describe the opportunity.',
      event_details: 'Describe the event.',
      poc: 'Who is the person you primarily have contact with?',
      add_interaction: 'Break the event down into individual interactions.',
      summary: 'Summary of your event and interactions.'
    },
    JobTitleAutoCompleteOptions: [
      { job_title: 'Accessibility Specialist' },
      { job_title: 'Account Coordinator' },
      { job_title: 'Account Manager' },
      { job_title: 'Accountant' },
      { job_title: 'Administrative Associate' },
      { job_title: 'Agile Project Manager' },
      { job_title: 'AI Engineer' },
      { job_title: 'AIX Administrator' },
      { job_title: 'Analyst' },
      { job_title: 'Analytics Lead' },
      { job_title: 'Android Developer' },
      { job_title: 'Android Software Engineer' },
      { job_title: 'Application Developer' },
      { job_title: 'Application Engineer' },
      { job_title: 'Application Security Architect' },
      { job_title: 'Application Support Analyst' },
      { job_title: 'Application Support Engineer' },
      { job_title: 'Applications Engineer' },
      { job_title: 'Apprentice' },
      { job_title: 'Art Director' },
      { job_title: 'Art Supervisor' },
      { job_title: 'Automation Engineer' },
      { job_title: 'AWS Systems Engineer' },
      { job_title: 'Back End Developer' },
      { job_title: 'Back End Web Developer' },
      { job_title: 'Backend Software Engineer' },
      { job_title: 'BI Business Analyst' },
      { job_title: 'BI Data Analyst' },
      { job_title: 'BI Engineer' },
      { job_title: 'Big Data Analyst' },
      { job_title: 'Big Data Architect' },
      { job_title: 'Big Data Engineer' },
      { job_title: 'Billing Analyst' },
      { job_title: 'Bioinfo Engineer' },
      { job_title: 'Bioinformatician' },
      { job_title: 'Bioinformatics Analyst' },
      { job_title: 'Bioinformatics Developer' },
      { job_title: 'Brand Designer' },
      { job_title: 'Brand Marketing Manager' },
      { job_title: 'Budget Analyst' },
      { job_title: 'Business Analyst' },
      { job_title: 'Business Data Analyst' },
      { job_title: 'Business Intelligence Analyst' },
      { job_title: 'Business Intelligence Analyst' },
      { job_title: 'Business Intelligence Manager' },
      { job_title: 'Business Operations Analyst' },
      { job_title: 'C++ Developer' },
      { job_title: 'CAD Developer' },
      { job_title: 'Chief Information Officer (CIO)' },
      { job_title: 'Chief Operating Officer' },
      { job_title: 'Chief Product Officer' },
      { job_title: 'Chief Technology Officer (CTO)' },
      { job_title: 'CIS Technical Support Analyst' },
      { job_title: 'Claims Operations Data Analyst' },
      { job_title: 'Client Development Coordinator' },
      { job_title: 'Client Experience' },
      { job_title: 'Client Service Administrator' },
      { job_title: 'Client Solutions Manager' },
      { job_title: 'Clinical Data Analyst' },
      { job_title: 'Cloud Application Engineer' },
      { job_title: 'Cloud Architect' },
      { job_title: 'Cloud Services Developer' },
      { job_title: 'Cloud System Administrator' },
      { job_title: 'Cloud System Engineer' },
      { job_title: 'Compliance Data Analyst' },
      { job_title: 'Computational Biologist' },
      { job_title: 'Computational Scientist' },
      { job_title: 'Computational Social Scientist' },
      { job_title: 'Computer Graphics Animator' },
      { job_title: 'Computer Network Architect' },
      { job_title: 'Content Marketing Lead' },
      { job_title: 'Content Marketing Manager' },
      { job_title: 'Content Strategist' },
      { job_title: 'Corporate Communications Manager' },
      { job_title: 'Corporate Strategy Analyst' },
      { job_title: 'Creative Resource Manager' },
      { job_title: 'CTO' },
      { job_title: 'Customer Data Analyst' },
      { job_title: 'Customer Experience Specialist' },
      { job_title: 'Customer Insight Analyst' },
      { job_title: 'Data Analyst' },
      { job_title: 'Data Analyst Intern' },
      { job_title: 'Data Architect' },
      { job_title: 'Data Center Support Specialist' },
      { job_title: 'Data Engineer' },
      { job_title: 'Data Modeler' },
      { job_title: 'Data Science Lead' },
      { job_title: 'Data Scientist' },
      { job_title: 'Data Visualization Engineer' },
      { job_title: 'Data Warehouse Architect' },
      { job_title: 'Database Administrator' },
      { job_title: 'Deep Learning Engineer' },
      { job_title: 'Design Researcher' },
      { job_title: 'Designer' },
      { job_title: 'Desktop Administrator' },
      { job_title: 'Desktop Support Analyst' },
      { job_title: 'Desktop Support Manager' },
      { job_title: 'Desktop Support Specialist' },
      { job_title: 'DevOps Architect' },
      { job_title: 'DevOps Engineer' },
      { job_title: 'DevOps Manager' },
      { job_title: 'Digital Content Coordinator' },
      { job_title: 'Digital Marketing Analyst' },
      { job_title: 'Digital Marketing Coordinator' },
      { job_title: 'Digital Marketing Manager' },
      { job_title: 'Digital Marketing Specialist' },
      { job_title: 'Digital Media Manager' },
      { job_title: 'Digital Project Manager' },
      { job_title: 'Director of Communications' },
      { job_title: 'Director of Content Marketing' },
      { job_title: 'Director of Customer Success' },
      { job_title: 'Director of Education' },
      { job_title: 'Director Of Engineering' },
      { job_title: 'Director of Enterprise Sales' },
      { job_title: 'Director of IT' },
      { job_title: 'Director of Marketing' },
      { job_title: 'Director of Operations' },
      { job_title: 'Director of People Ops (HR)' },
      { job_title: 'Director of Product Management' },
      { job_title: 'Director of Research' },
      { job_title: 'Director of Sales' },
      { job_title: 'Director of Talent (Recruiting)' },
      { job_title: 'Director of Tech Ops' },
      { job_title: 'Director Of Technical Operations' },
      { job_title: 'Director of Technology' },
      { job_title: 'Drupal Developer' },
      { job_title: 'Engineering Manager' },
      { job_title: 'ETL Analyst' },
      { job_title: 'Event Manager' },
      { job_title: 'Expense Analyst' },
      { job_title: 'Filmmaker Associate' },
      { job_title: 'Finance Analyst' },
      { job_title: 'Finance Manager' },
      { job_title: 'Financial Analyst' },
      { job_title: 'Financial Reporting Analyst' },
      { job_title: 'Freelance Designer' },
      { job_title: 'Freelance Developer' },
      { job_title: 'Front End Developer' },
      { job_title: 'Front End Engineer' },
      { job_title: 'Front End Web Developer' },
      { job_title: 'Full Stack Developer' },
      { job_title: 'Game Developer' },
      { job_title: 'General Manager' },
      { job_title: 'Global Marketing Manager' },
      { job_title: 'Graphic Designer' },
      { job_title: 'Growth Hacker' },
      { job_title: 'Growth Marketing Manager' },
      { job_title: 'Help Desk Administrator' },
      { job_title: 'Help Desk Specialist' },
      { job_title: 'Help Desk Technician' },
      { job_title: 'Home Device Developer' },
      { job_title: 'HTML Developer' },
      { job_title: 'Image Processing Engineer' },
      { job_title: 'Information Architect' },
      { job_title: 'Information Research Scientist' },
      { job_title: 'Information Security' },
      { job_title: 'Information Security Engineer' },
      { job_title: 'Information Systems Manager' },
      { job_title: 'Information Technology Analyst' },
      { job_title: 'Infrastructure Specialist' },
      { job_title: 'Insights Analyst' },
      { job_title: 'Integration Engineer' },
      { job_title: 'Integration Specialist' },
      { job_title: 'Interaction Designer' },
      { job_title: 'iOS Application Developer' },
      { job_title: 'iOS Architect' },
      { job_title: 'iOS Developer Intern' },
      { job_title: 'iOS Engineer' },
      { job_title: 'IT Analyst' },
      { job_title: 'IT Applications Specialist' },
      { job_title: 'IT Architect' },
      { job_title: 'IT Business Analyst' },
      { job_title: 'IT Coordinator' },
      { job_title: 'IT Customer Service Technician' },
      { job_title: 'IT Data Specialist' },
      { job_title: 'IT Experience Lead' },
      { job_title: 'IT Finance Analyst' },
      { job_title: 'IT Infrastructure Administrator' },
      { job_title: 'IT Manager' },
      { job_title: 'IT Security Analyst' },
      { job_title: 'IT Specialist' },
      { job_title: 'IT Support Engineer' },
      { job_title: 'IT Support Manager' },
      { job_title: 'Java Developer' },
      { job_title: 'Javascript Engineer' },
      { job_title: 'JRV DATA ANALYST' },
      { job_title: 'Lead Designer' },
      { job_title: 'Lead Developer' },
      { job_title: 'Machine Learning Engineer' },
      { job_title: 'Machine Learning Scientist' },
      { job_title: 'Magento Developer' },
      { job_title: 'Market Research Analyst' },
      { job_title: 'Market Research Associate' },
      { job_title: 'Marketing Content Manager' },
      { job_title: 'Marketing Coordinator' },
      { job_title: 'Marketing Data Analyst' },
      { job_title: 'Marketing Insight Analyst' },
      { job_title: 'Marketing Manager' },
      { job_title: 'Marketing Operations Manager' },
      { job_title: 'Marketing Technologist' },
      { job_title: 'Marketing Web Designer' },
      { job_title: 'Mobile Application Developer' },
      { job_title: 'Mobile Developer' },
      { job_title: 'Mobile Engineer' },
      { job_title: 'Network Administrator' },
      { job_title: 'Network Architect' },
      { job_title: 'Network Engineer' },
      { job_title: 'Network Systems Administrator' },
      { job_title: 'Operations Analyst' },
      { job_title: 'Operations Associate' },
      { job_title: 'Payments Analyst' },
      { job_title: 'Product Business Analyst' },
      { job_title: 'Product Data Analyst' },
      { job_title: 'Product Designer' },
      { job_title: 'Product Insights Analyst' },
      { job_title: 'Product Manager' },
      { job_title: 'Product Marketing Manager' },
      { job_title: 'Product Specialist' },
      { job_title: 'Program Manager' },
      { job_title: 'Project Manager' },
      { job_title: 'Python Developer' },
      { job_title: 'QA Engineer' },
      { job_title: 'Quantitative Analyst' },
      { job_title: 'Recruiter' },
      { job_title: 'Recruiting Coordinator' },
      { job_title: 'Recruiting Operations' },
      { job_title: 'Remote' },
      { job_title: 'Reporting Analyst' },
      { job_title: 'Research Scientist' },
      { job_title: 'Risk Management Analyst' },
      { job_title: 'Ruby on Rails Developer' },
      { job_title: 'Sales Development Representative (SDR)' },
      { job_title: 'Sales Engineer (SE)' },
      { job_title: 'Sales Executive' },
      { job_title: 'Sales Operations Analyst' },
      { job_title: 'Sales Operations Lead' },
      { job_title: 'Sales Operations Specialist' },
      { job_title: 'Security Analyst' },
      { job_title: 'Security Specialist' },
      { job_title: 'Server Administrator' },
      { job_title: 'Service Desk Analyst (Mobile Device Services)' },
      { job_title: 'ServiceNow Engineer' },
      { job_title: 'SES Software Developer' },
      { job_title: 'Site Reliability Engineer - Enterprise Solutions' },
      { job_title: 'SoC Architect -' },
      { job_title: 'Social Media Coordinator' },
      { job_title: 'Social Media Data Research Intern' },
      { job_title: 'Social Media Manager' },
      { job_title: 'Soft Engineer' },
      { job_title: 'Software Architect' },
      { job_title: 'Software Configuration Management Telecommute' },
      { job_title: 'Software Developer' },
      { job_title: 'Software Developer in Test' },
      { job_title: 'Software Developer Internship' },
      { job_title: 'Software Development Engineer' },
      { job_title: 'Software Development Manager' },
      { job_title: 'Software Engineering Manager' },
      { job_title: 'Solution Engineer' },
      { job_title: 'SQL Developer' },
      { job_title: 'Supervisor' },
      { job_title: 'Support Specialist' },
      { job_title: 'System Administrator' },
      { job_title: 'System Architect' },
      { job_title: 'System Engineer' },
      { job_title: 'System Support Engineer' },
      { job_title: 'Systems Administrator' },
      { job_title: 'Systems Analyst' },
      { job_title: 'Systems Designer' },
      { job_title: 'Systems Engineer' },
      { job_title: 'Systems Network Administrator' },
      { job_title: 'Talent Advocate' },
      { job_title: 'Technical Account Manager' },
      { job_title: 'Technical Product Manager' },
      { job_title: 'Technical Program Manager' },
      { job_title: 'Technical Support Analyst' },
      { job_title: 'Technical Support Engineer' },
      { job_title: 'Technical Writer' },
      { job_title: 'UI Designer' },
      { job_title: 'UI Developer' },
      { job_title: 'UI Engineer' },
      { job_title: 'UI/UX Designer' },
      { job_title: 'University Recruiter' },
      { job_title: 'User Experience Designer' },
      { job_title: 'User Interface Developer' },
      { job_title: 'User Interface Engineer' },
      { job_title: 'UX Content Specialist' },
      { job_title: 'UX Designer' },
      { job_title: 'UX Researcher' },
      { job_title: 'Web Administrator' },
      { job_title: 'Web Analytics Developer' },
      { job_title: 'Web Designer' },
      { job_title: 'Web Developer' },
      { job_title: 'Webmaster' },
      { job_title: 'Windows System Administrator' },
      { job_title: 'Wordpress Developer' }
    ],
  };
});