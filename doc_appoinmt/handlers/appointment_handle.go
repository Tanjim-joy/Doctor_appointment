package handlers

import (
	"doc_appoinmt/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Get all Appointment details user admin
func GetAllAppointments(c *gin.Context) {
	query := `
		SELECT  doctor_id, patient_id, appointment_date, status, symptoms FROM appointments `

	// execute query
	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch appointments : " + err.Error(),
		})
		return
	}
	defer rows.Close()

	var appointments []map[string]interface{}

	for rows.Next() {
		var doctorID, patientID int
		var appointmentDate, status, symptoms string
		err := rows.Scan(&doctorID, &patientID, &appointmentDate, &status, &symptoms)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read appointment data: " + err.Error(),
			})
			return
		}
		appointment := map[string]interface{}{
			"doctor_id":        doctorID,
			"patient_id":       patientID,
			"appointment_date": appointmentDate,
			"status":           status,
			"symptoms":         symptoms,
		}
		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
	})
}
