package models

import "time"

type Prescription struct {
	ID             int    `json:"id"`
	PatientID      int    `json:"patient_id"`
	DoctorID       int    `json:"doctor_id"`
	Appointment_id int    `json:"appointment_id"`
	Diagnosis      string `json:"diagnosis"`
	Blood_pressure string `json:"blood_pressure"`
	Medicines      string `json:"medicines"`
	Instructions   string `json:"instructions"`
	Follow_up      string `json:"follow_up"`
	Created_at     string `json:"created_at"`
	Updated_at     string `json:"updated_at"`
}

type CreatePrescriptionRequest struct {
	ID             int    `json:"id"`
	PatientID      int    `json:"patient_id" binding:"required"`
	DoctorID       int    `json:"doctor_id" binding:"required"`
	Appointment_id int    `json:"appointment_id" binding:"required"`
	Diagnosis      string `json:"diagnosis" binding:"required"`
	Blood_pressure string `json:"blood_pressure" binding:"required"`
	Medicines      string `json:"medicines" binding:"required"`
	Instructions   string `json:"instructions" binding:"required"`
	Follow_up      string `json:"follow_up" binding:"required"`
}

type PatientPrescription struct {
	PrescriptionID   *int       `json:"prescription_id"`
	Diagnosis        *string    `json:"diagnosis"`
	BloodPressure    *string    `json:"blood_pressure"`
	Medicines        *string    `json:"medicines"`
	Instructions     *string    `json:"instructions"`
	FollowUp         *string    `json:"follow_up"`
	PrescriptionDate *time.Time `json:"prescription_date"`
	AppointmentID    int        `json:"appointment_id"`
	AppointmentDate  time.Time  `json:"appointment_date"`
	Status           string     `json:"status"`
	Symptoms         string     `json:"symptoms"`
	PatientName      string     `json:"patient_name"`
	DoctorName       string     `json:"doctor_name"`
	Specialization   string     `json:"specialization"`
	ConsultationFee  float64    `json:"consultation_fee"`
}
