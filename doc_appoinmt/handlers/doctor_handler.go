package handlers

import (
	"doc_appoinmt/config"
	models "doc_appoinmt/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Get all doctors
func GetAllDoctors(c *gin.Context) {
	query := `
		SELECT 
			d.id AS doctor_id,
			u.username,
			u.email,
			d.specialization,
			d.experience_years,
			d.consultation_fee,
			d.bio
		FROM doctors d
		JOIN users u ON d.user_id = u.id
	`
	// execute query
	rows, err := config.DB.Query(query)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch doctors : " + err.Error(),
		})
		return
	}
	defer rows.Close()

	// Doctor slice
	var doctors []models.Doctor

	for rows.Next() {
		var d models.Doctor
		err := rows.Scan(
			&d.DoctorID,
			&d.Username,
			&d.Email,
			&d.Specialization,
			&d.ExperienceYears,
			&d.ConsultationFee,
			&d.Bio,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read doctor data: " + err.Error(),
			})
			return
		}
		doctors = append(doctors, d)
	}

	c.JSON(http.StatusOK, gin.H{
		"doctors": doctors,
	})

}
