-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS doc_appointments;
USE doc_appointments;

-- 2. Users Table (Core for Authentication & RBAC)
-- This table stores login credentials and assigns roles.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'patient', 'staff') NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Doctors Table
-- Linked to Users table. Stores professional details.
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Patients Table
-- Linked to Users table. Stores medical history basics.
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    blood_group VARCHAR(5),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Appointments Table
-- Manages the schedule between patients and doctors.
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    symptoms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
) ENGINE=InnoDB;

-- 6. Prescriptions Table
-- Created after an appointment is completed.
CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE,
    medicine_details TEXT NOT NULL, -- Format: Medicine Name, Dosage, Duration
    diagnosis TEXT,
    advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB;


--- Insert Demo Data
INSERT INTO users (username, email, password_hash, role) VALUES
('admin1', 'admin1@example.com', 'hashed_pass_1', 'admin'),
('dr_smith', 'dr.smith@example.com', 'hashed_pass_2', 'doctor'),
('dr_rahman', 'dr.rahman@example.com', 'hashed_pass_3', 'doctor'),
('patient_ali', 'ali@example.com', 'hashed_pass_4', 'patient'),
('patient_nila', 'nila@example.com', 'hashed_pass_5', 'patient'),
('staff_john', 'john.staff@example.com', 'hashed_pass_6', 'staff');


INSERT INTO users (username, email, password_hash, role) VALUES
('dr_mamun', 'dr.mamun@example.com', 'hashed_pass_7', 'doctor'),
('dr_karim', 'dr.karim@example.com', 'hashed_pass_8', 'doctor'),
('dr_begum', 'dr.begum@example.com', 'hashed_pass_9', 'doctor'),
('dr_sultana', 'dr.sultana@example.com', 'hashed_pass_10', 'doctor'),
('dr_hassan', 'dr.hassan@example.com', 'hashed_pass_11', 'doctor'),
('dr_akhtar', 'dr.akhtar@example.com', 'hashed_pass_12', 'doctor'),
('dr_rahim', 'dr.rahim@example.com', 'hashed_pass_13', 'doctor'),
('dr_noor', 'dr.noor@example.com', 'hashed_pass_14', 'doctor'),
('dr_jahan', 'dr.jahan@example.com', 'hashed_pass_15', 'doctor'),
('dr_tania', 'dr.tania@example.com', 'hashed_pass_16', 'doctor'),
('dr_imran', 'dr.imran@example.com', 'hashed_pass_17', 'doctor'),
('dr_farida', 'dr.farida@example.com', 'hashed_pass_18', 'doctor'),
('dr_rashed', 'dr.rashed@example.com', 'hashed_pass_19', 'doctor');

INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee, bio) VALUES
(2, 'Cardiology', 10, 1500.00, 'Experienced heart specialist'),
(3, 'Dermatology', 7, 1000.00, 'Skin and allergy expert');


INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee, bio) VALUES
(27, 'Neurology', 12, 1800.00, 'Brain and nervous system expert'),
(28, 'Gynecology', 8, 1300.00, 'Women''s health and reproductive care specialist'),
(29, 'Orthopedics', 11, 1400.00, 'Musculoskeletal surgery and joint care expert'),
(30, 'Ophthalmology', 6, 1100.00, 'Eye care and vision correction specialist'),
(31, 'ENT', 10, 1250.00, 'Ear, nose, and throat specialist'),
(32, 'General Medicine', 15, 1000.00, 'Primary care physician for adults'),
(33, 'Psychiatry', 7, 1500.00, 'Mental health diagnosis and therapy specialist'),
(34, 'Pulmonology', 13, 1700.00, 'Respiratory and lung disease specialist'),
(35, 'Gastroenterology', 10, 1550.00, 'Digestive system specialist'),
(36, 'Endocrinology', 9, 1500.00, 'Hormonal and metabolic disorder expert'),
(37, 'Nephrology', 8, 1600.00, 'Kidney and urinary tract specialist'),
(38, 'Dermatology', 5, 1100.00, 'Cosmetic and clinical skin care specialist'),
(39, 'Neurology', 10, 1800.00, 'Specialist in stroke and neurodegenerative diseases');

INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address) VALUES
(4, '1995-06-15', 'male', 'A+', 'Dhaka, Bangladesh'),
(5, '1998-02-20', 'female', 'B+', 'Chittagong, Bangladesh');

INSERT INTO appointments (doctor_id, patient_id, appointment_date, status, symptoms) VALUES
(1, 1, '2026-05-15 10:00:00', 'pending', 'Chest pain and shortness of breath'),
(1, 2, '2026-05-16 11:30:00', 'confirmed', 'Irregular heartbeat'),
(2, 1, '2026-05-17 09:00:00', 'completed', 'Skin rash and itching'),
(2, 2, '2026-05-18 14:00:00', 'pending', 'Acne problem'),
(1, 1, '2026-05-20 16:00:00', 'cancelled', 'Follow-up visit');

INSERT INTO prescriptions (appointment_id, medicine_details, diagnosis, advice) VALUES
(3, 
 'Cetirizine 10mg - Once daily for 7 days', 
 'Allergic dermatitis', 
 'Avoid dust, keep skin clean');

 SELECT * FROM users;
 SELECT * FROM doctors;
 SELECT * FROM patients;
 SELECT * FROM appointments;
 SELECT * FROM prescriptions;

 -- Most Usable Query

SELECT id, username, email, password_hash, role
FROM users
WHERE (username = 'dr_smith' OR email = 'dr.smith@example.com');

SELECT role
FROM users
WHERE id = 2;

-- All Doctor With Profile info
SELECT 
    d.id AS doctor_id,
    u.username,
    d.specialization,
    d.experience_years,
    d.consultation_fee
FROM doctors d
JOIN users u ON d.user_id = u.id;

-- Find Doctor Specialization
SELECT u.username, d.specialization, d.consultation_fee
FROM doctors d
JOIN users u ON d.user_id = u.id
WHERE d.specialization = 'Cardiology';

-- Patient Query
SELECT 
    u.username,
    p.date_of_birth,
    p.gender,
    p.blood_group,
    p.address
FROM patients p
JOIN users u ON p.user_id = u.id
WHERE p.id = 1;

SELECT doctor_id, patient_id, appointment_date, status, symptoms FROM appointments

-- Create New Appointment
INSERT INTO appointments (doctor_id, patient_id, appointment_date, symptoms)
VALUES (1, 2, '2026-05-25 11:00:00', 'Fever and headache');

-- All Appointment Doctor
SELECT 
    a.id,
    a.appointment_date,
    a.status,
    u.username AS patient_name,
    d.specialization AS doctor_specialization,
    d.consultation_fee AS doctor_consultation_fee,
    u.username AS doctor_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u ON p.user_id = u.id
JOIN doctors d ON a.doctor_id = d.id
ORDER BY a.appointment_date;

-- All Appointments - Simple Version
SELECT 
    a.id,
    a.appointment_date,
    a.status,    
    a.symptoms,
    d.consultation_fee,
    d.specialization,
    patient_user.username AS patient_name,
    doctor_user.username AS doctor_name,
    d.specialization
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users patient_user ON p.user_id = patient_user.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users doctor_user ON d.user_id = doctor_user.id
WHERE a.patient_id = 1
ORDER BY a.appointment_date DESC;

SELECT
a.id,
a.appointment_date,
a.status,
a.symptoms,
a.patient_id,
patient_user.id AS patient_user_id,
patient_user.username AS patient_name,
a.doctor_id,
doctor_user.id AS doctor_user_id,
doctor_user.username AS doctor_name,
d.consultation_fee,
d.specialization
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN users patient_user ON p.user_id = patient_user.id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN users doctor_user ON d.user_id = doctor_user.id
WHERE 1=4
ORDER BY a.appointment_date DESC;

SELECT * FROM patients;
SELECT * FROM users;
SELECT 
    a.id,
    a.doctor_id,
    a.patient_id,
    a.appointment_date,
    a.status,    
    a.symptoms,
    d.consultation_fee,
    d.specialization,
    COALESCE(patient_user.username, '') AS patient_name,
    COALESCE(doctor_user.username, '') AS doctor_name,
    CASE 
        WHEN d.id IS NOT NULL THEN 'doctor'
        WHEN p.id IS NOT NULL THEN 'patient'
        ELSE 'unknown'
    END as user_type
    FROM users u
    LEFT JOIN doctors d ON d.user_id = u.id
    LEFT JOIN patients p ON p.user_id = u.id
    LEFT JOIN appointments a ON (a.doctor_id = d.id OR a.patient_id = p.id)
    LEFT JOIN patients p2 ON a.patient_id = p2.id
    LEFT JOIN users patient_user ON p2.user_id = patient_user.id
    LEFT JOIN doctors d2 ON a.doctor_id = d2.id
    LEFT JOIN users doctor_user ON d2.user_id = doctor_user.id
    WHERE u.id = 1 AND a.id IS NOT NULL
    ORDER BY a.appointment_date DESC;


SELECT role FROM users WHERE 1 = 1;

-- All Appointment Patient
SELECT 
    a.appointment_date,
    a.status,
    u.username AS doctor_name
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
JOIN users u ON d.user_id = u.id
WHERE a.patient_id = 1;

UPDATE appointments
SET status = 'confirmed'
WHERE id = 2;

-- Prescription 
INSERT INTO prescriptions (appointment_id, medicine_details, diagnosis, advice)
VALUES (
    4,
    'Paracetamol 500mg - Twice daily for 5 days',
    'Viral fever',
    'Drink plenty of water'
);

-- View prescription with doctor & patient name
SELECT 
    u_doc.username AS doctor_name,
    u_pat.username AS patient_name,
    p.medicine_details,
    p.diagnosis,
    p.advice
FROM prescriptions p
JOIN appointments a ON p.appointment_id = a.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users u_doc ON d.user_id = u_doc.id
JOIN patients pa ON a.patient_id = pa.id
JOIN users u_pat ON pa.user_id = u_pat.id;

-- dashBoard
SELECT 
    (SELECT COUNT(*) FROM doctors) AS total_doctors,
    (SELECT COUNT(*) FROM patients) AS total_patients,
    (SELECT COUNT(*) FROM appointments) AS total_appointments;

SELECT status, COUNT(*) AS total
FROM appointments
GROUP BY status;

SELECT DATE(appointment_date) AS day, COUNT(*) AS total
FROM appointments
GROUP BY DATE(appointment_date);

-- check upComing
SELECT *
FROM appointments
WHERE appointment_date > NOW()
ORDER BY appointment_date;

-- test users
INSERT INTO users (username, email, password_hash, role)
VALUES ('testuser', 'test@example.com', 'test123', 'patient');

SELECT * FROM users;

SELECT username, role, password_hash
 FROM users WHERE username ="admin1" OR email = "admin1@example.com" AND password_hash = "hashed_pass_1";