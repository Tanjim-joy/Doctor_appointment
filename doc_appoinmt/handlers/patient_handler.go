package handlers

import (
	"doc_appoinmt/config"
	models "doc_appoinmt/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AllPatients(c *gin.Context) { 
	var patients []models.Patient

	rows, err := config.DB.Query(`
		SELECT id, user_id, date_of_birth, gender, blood_group, address 
		FROM patients
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var patient models.Patient

		err := rows.Scan(
			&patient.ID,
			&patient.UserID,
			&patient.DateOfBirth,
			&patient.Gender,
			&patient.BloodGroup,
			&patient.Address,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		patients = append(patients, patient)
	}

	c.JSON(http.StatusOK, patients)
}
