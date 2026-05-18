package models

import "database/sql"

type Appointment struct {
	ID               int            `json:"id"`
	PatientID        int            `json:"patient_id"`
	DoctorID         int            `json:"doctor_id"`
	Appointment_date string         `json:"appointment_date"`
	Status           string         `json:"status"`
	Symptoms         string         `json:"symptoms"`
	Created_at       string         `json:"created_at"`
	Consultation_fee string         `json:"consultation_fee"`
	Specialization   string         `json:"specialization"`
	Patient_name     string         `json:"patient_name"`
	Doctor_name      string         `json:"doctor_name"`
	Doctor_user_id   int            `json:"doctor_user_id"`
	Patient_user_id  int            `json:"patient_user_id"`
	Ref_name         sql.NullString `json:"ref_name"`
	Ref_phone        sql.NullString `json:"ref_phone"`
	Age              sql.NullInt64  `json:"age"`
	Remarks          sql.NullString `json:"remarks"`
	// Updated_at string `json:"updated_at"`
}

type AppointmentRequest struct {
	PatientID        int    `json:"patient_id" binding:"required"`
	DoctorID         int    `json:"doctor_id" binding:"required"`
	Appointment_date string `json:"appointment_date" binding:"required"`
	Symptoms         string `json:"symptoms" binding:"required"`
	Status           string `json:"status" default:"pending"`
	Ref_name         string `json:"ref_name"`
	Ref_phone        string `json:"ref_phone"`
	Age              int    `json:"age"`
	Remarks          string `json:"remarks"`
}
