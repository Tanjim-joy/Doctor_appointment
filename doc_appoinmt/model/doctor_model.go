package models

type Doctor struct {
	DoctorID        int     `json:"doctor_id"`
	Username        string  `json:"username"`
	Email           string  `json:"email"`
	Specialization  string  `json:"specialization"`
	ExperienceYears int     `json:"experience_years"`
	ConsultationFee float64 `json:"consultation_fee"`
	Bio             string  `json:"bio"`
	Qualification   string  `json:"qualification"`
}
