-- -------------------------
-- Create Database
-- -------------------------
CREATE DATABASE IF NOT EXISTS cia_new;
USE cia_new;

-- -------------------------
-- Departments table
-- -------------------------
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hod VARCHAR(100),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Programmes table
-- -------------------------
CREATE TABLE IF NOT EXISTS programmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department_id INT,
  duration VARCHAR(20) DEFAULT '2 years',
  total_semesters INT DEFAULT 4,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- -------------------------
-- Students table
-- -------------------------
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usn VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100),
  programme_id INT,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programme_id) REFERENCES programmes(id)
);

-- -------------------------
-- Faculty table
-- -------------------------
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- -------------------------
-- Courses table
-- -------------------------
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(100),
  course_code VARCHAR(20),
  programme_id INT,
  faculty_id INT,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programme_id) REFERENCES programmes(id),
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- -------------------------
-- CIA Components table
-- -------------------------
CREATE TABLE IF NOT EXISTS cia_components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  max_marks INT NOT NULL,
  weightage DECIMAL(5,2) DEFAULT 0,
  assessment_type ENUM('TEST','ASSIGNMENT','PRACTICAL','PROJECT') DEFAULT 'TEST',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- CIA Marks table
-- -------------------------
CREATE TABLE IF NOT EXISTS cia_marks_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  cia_component_id INT NOT NULL,
  usn VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  marks_obtained DECIMAL(5,2) DEFAULT 0,
  entered_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (cia_component_id) REFERENCES cia_components(id) ON DELETE CASCADE
);

-- -------------------------
-- Users table (Login System)
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin','faculty','student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Seed Departments
-- -------------------------
INSERT IGNORE INTO departments (name, hod, status) VALUES
('Computer Science (PG)', 'Dr. S. Irene Getzi', 'active'),
('Business Administration (PG)', 'Dr. Rajesh Kumar', 'active'),
('Commerce (PG)', 'Dr. Sandeep Joshi', 'active');

-- -------------------------
-- Seed CIA Components
-- -------------------------
INSERT IGNORE INTO cia_components (type, max_marks, weightage, assessment_type) VALUES
('CIA-1', 30, 20, 'TEST'),
('CIA-2', 30, 30, 'ASSIGNMENT'),
('CIA-3', 30, 50, 'TEST');

-- -------------------------
-- Seed Users
-- -------------------------
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@college.edu', 'admin123', 'admin'),
('Ramesh', 'ramesh@college.edu', 'faculty123', 'faculty'),
('Asha', 'asha@student.edu', 'student123', 'student');