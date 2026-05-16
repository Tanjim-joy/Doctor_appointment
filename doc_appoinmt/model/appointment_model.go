package models

import "time"

type Appointment struct {
	ID               int    `json:"id"`
	PatientID        int    `json:"patient_id"`
	DoctorID         int    `json:"doctor_id"`
	Appointment_date string `json:"appointment_date"`
	Status           string `json:"status"`
	Symptoms         string `json:"symptoms"`
	Created_at       string `json:"created_at"`
	Consultation_fee string `json:"consultation_fee"`
	Specialization   string `json:"specialization"`
	Patient_name     string `json:"patient_name"`
	Doctor_name      string `json:"doctor_name"`
	// Updated_at string `json:"updated_at"`
}

type AppointmentRequest struct {
	PatientID        int       `json:"patient_id" binding:"required"`
	DoctorID         int       `json:"doctor_id" binding:"required"`
	Appointment_date time.Time `json:"appointment_date" binding:"required"`
	Symptoms         string    `json:"symptoms" binding:"required"`
	Status           string    `json:"status"`
}
