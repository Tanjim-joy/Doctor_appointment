package model

type Appointment struct {
	ID               int    `json:"id"`
	PatientID        int    `json:"patient_id"`
	DoctorID         int    `json:"doctor_id"`
	Appointment_date string `json:"appointment_date_time"`
	Status           string `json:"status"`
	Symptoms         string `json:"symptoms"`
	Created_at       string `json:"created_at"`
	// Updated_at string `json:"updated_at"`
}

type AppointmentRequest struct {
	PatientID        int    `json:"patient_id" binding:"required"`
	DoctorID         int    `json:"doctor_id" binding:"required"`
	Appointment_date string `json:"appointment_date_time"`
	Symptoms         string `json:"symptoms" binding:"required"`
	Status           string `json:"status"`
}
