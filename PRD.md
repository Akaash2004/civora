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

## 5. Project Modules

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 1 | **User Module** | Allows users to register, login, and access the system. | ✅ Done |
| 2 | **Complaint Submission Module** | Enables users to submit civic complaints using text or images. | ✅ Done |
| 3 | **AI Processing Module** | Automatically detects and classifies complaints using YOLOv8 and NLP. | 🔲 Pending |
| 4 | **Geotagging Module** | Captures and stores the exact location of the reported issue. | ✅ Done |
| 5 | **Voting & Priority Module** | Allows citizens to vote on complaints to highlight important issues. | ✅ Done |
| 6 | **Complaint Tracking Module** | Displays real-time status updates of complaints. | 🔲 Pending |
| 7 | **Admin Module** | Enables authorities to manage, update, and resolve complaints. | 🔲 Pending |

## 6. User Registration & Authentication
### 6.1 Citizens (Public Users)
* Register using phone number and password
* OTP verification during signup
* Login using phone number and password
* Access to citizen dashboard

### 6.2 Department Authorities
* Managed by Admin
* Assigned unique ID and password
* Specific department access

### 6.3 Admin
* Full system access

## 7. Key Features
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
