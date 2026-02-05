# CIVORA Product Requirements Document (PRD)

## 1. Product Overview
CIVORA is a smart civic complaint registration and management platform that enables citizens to report civic issues easily while helping authorities resolve them efficiently using AI, geotagging, and public participation.

## 2. Problem Statement
Existing civic complaint systems are slow, lack automation, transparency, and citizen engagement, resulting in delayed issue resolution and reduced public trust.

## 3. Objectives
* Provide a unified platform for reporting and tracking civic issues
* Automate complaint detection and categorization using AI
* Improve transparency and response time
* Encourage citizen participation through voting

## 4. Target Users
* Citizens (Public Users)
* Department Authorities (PWD, Sanitation, Water Supply, Electricity, Drainage)
* System Administrators

## 5. User Registration & Authentication
### 5.1 Citizens (Public Users)
* Register using phone number and password
* OTP verification during signup
* Login using phone number and password
* Access to citizen dashboard

### 5.2 Department Authorities
* Managed by Admin
* Assigned unique ID and password
* specific department access

### 5.3 Admin
* Full system access

## 6. Key Features
* **Complaint Registration**: Image upload, YOLOv8 detection, NLP classification.
* **Location Mapping**: Geotagging and Map visualization.
* **Complaint Tracking**: Real-time status, history.
* **Public Dashboard**: Voting, visibility.
* **User Management**: Role-based access.

## 8. Technology Stack
* Frontend: React.js
* Backend: Node.js, Express.js
* Database: MongoDB
* AI/ML: YOLOv8, NLP (Python)
* Mapping: Geotagging, Maps API
