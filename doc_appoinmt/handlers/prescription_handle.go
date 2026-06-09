package handlers

import (
	"doc_appoinmt/config"
	models "doc_appoinmt/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPrescriptionsByUser(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if userIDStr == "" || err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user_id",
		})
		return
	}

	rolequery := `SELECT role FROM users WHERE id = ?`
	var role string
	err = config.DB.QueryRow(rolequery, userID).Scan(&role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user role: " + err.Error(),
		})
		return
	}

	if role != "patient" && role != "doctor" && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Access denied. Only authorized users can view their prescriptions.",
		})
		return
	}

	var whereClause string
	if role == "patient" {
		whereClause = "u.id = ?"
	} else if role == "doctor" {
		whereClause = "du.id = ?"
	} else if role == "admin" {
		whereClause = "1=1"
	}

	query := `
		SELECT 
			p.id,
			p.diagnosis,
			p.blood_pressure,
			p.medicines,
			p.instructions,
			p.follow_up,
			p.created_at,
			a.id,
			a.appointment_date,
			a.status,
			a.symptoms,
			u.username,
			du.username,
			d.specialization,
			d.consultation_fee
		FROM appointments a
		LEFT JOIN prescriptions p 
			ON p.appointment_id = a.id
		JOIN patients pat 
			ON a.patient_id = pat.id
		JOIN users u 
			ON pat.user_id = u.id
		JOIN doctors d 
			ON a.doctor_id = d.id
		JOIN users du 
			ON d.user_id = du.id
		WHERE ` + whereClause + `
		ORDER BY p.created_at DESC;
	`
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch prescriptions: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	var prescriptions []models.PatientPrescription

	for rows.Next() {
		var item models.PatientPrescription

		err := rows.Scan(
			&item.PrescriptionID,
			&item.Diagnosis,
			&item.BloodPressure,
			&item.Medicines,
			&item.Instructions,
			&item.FollowUp,
			&item.PrescriptionDate,
			&item.AppointmentID,
			&item.AppointmentDate,
			&item.Status,
			&item.Symptoms,
			&item.PatientName,
			&item.DoctorName,
			&item.Specialization,
			&item.ConsultationFee,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Scan error: " + err.Error(),
			})
			return
		}

		prescriptions = append(prescriptions, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    prescriptions,
	})
}

func GetPrescriptionsPatient(c *gin.Context) {
	query := `
		SELECT 
			p.id,
			p.diagnosis,
			p.blood_pressure,
			p.medicines,
			p.instructions,
			p.follow_up,
			p.created_at,
			a.id,
			a.appointment_date,
			a.status,
			a.symptoms,
			u.username,
			du.username,
			d.specialization,
			d.consultation_fee
		FROM appointments a
		LEFT JOIN prescriptions p 
			ON p.appointment_id = a.id
		JOIN patients pat 
			ON a.patient_id = pat.id
		JOIN users u 
			ON pat.user_id = u.id
		JOIN doctors d 
			ON a.doctor_id = d.id
		JOIN users du 
			ON d.user_id = du.id
		WHERE a.patient_id = ?
		ORDER BY p.created_at DESC;
	`
	patientIDStr := c.Param("patient_id")
	patientID, err := strconv.Atoi(patientIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid patient_id",
		})
		return
	}

	rows, err := config.DB.Query(query, patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch prescriptions: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	var prescriptions []models.PatientPrescription

	for rows.Next() {
		var item models.PatientPrescription

		err := rows.Scan(
			&item.PrescriptionID,
			&item.Diagnosis,
			&item.BloodPressure,
			&item.Medicines,
			&item.Instructions,
			&item.FollowUp,
			&item.PrescriptionDate,
			&item.AppointmentID,
			&item.AppointmentDate,
			&item.Status,
			&item.Symptoms,
			&item.PatientName,
			&item.DoctorName,
			&item.Specialization,
			&item.ConsultationFee,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Scan error: " + err.Error(),
			})
			return
		}

		prescriptions = append(prescriptions, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    prescriptions,
	})
}
func GetPrescriptionsDoctor(c *gin.Context) {
	query := `
		SELECT 
			p.id,
			p.diagnosis,
			p.blood_pressure,
			p.medicines,
			p.instructions,
			p.follow_up,
			p.created_at,
			a.id,
			a.appointment_date,
			a.status,
			a.symptoms,
			u.username,
			du.username,
			d.specialization,
			d.consultation_fee
		FROM appointments a
		LEFT JOIN prescriptions p 
			ON p.appointment_id = a.id
		JOIN patients pat 
			ON a.patient_id = pat.id
		JOIN users u 
			ON pat.user_id = u.id
		JOIN doctors d 
			ON a.doctor_id = d.id
		JOIN users du 
			ON d.user_id = du.id
		WHERE d.id = ?
		ORDER BY p.created_at DESC;
	`
	doctorIDStr := c.Param("doctor_id")
	doctorID, err := strconv.Atoi(doctorIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid doctor_id",
		})
		return
	}

	rows, err := config.DB.Query(query, doctorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch prescriptions: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	var prescriptions []models.PatientPrescription

	for rows.Next() {
		var item models.PatientPrescription

		err := rows.Scan(
			&item.PrescriptionID,
			&item.Diagnosis,
			&item.BloodPressure,
			&item.Medicines,
			&item.Instructions,
			&item.FollowUp,
			&item.PrescriptionDate,
			&item.AppointmentID,
			&item.AppointmentDate,
			&item.Status,
			&item.Symptoms,
			&item.PatientName,
			&item.DoctorName,
			&item.Specialization,
			&item.ConsultationFee,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Scan error: " + err.Error(),
			})
			return
		}

		prescriptions = append(prescriptions, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    prescriptions,
	})
}

func CreatePrescription(c *gin.Context) {
	var input models.PrescriptionInput // Define a struct to bind the incoming JSON data

	// Bind the JSON data to the struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Create a new Prescription instance using the input data
	prescription := models.Prescription{
		PatientID:      input.PatientID,
		DoctorID:       input.DoctorID,
		Appointment_id: input.Appointment_id,
		Diagnosis:      input.Diagnosis,
		Blood_pressure: input.Blood_pressure,
		Medicines:      input.Medicines,
		Instructions:   input.Instructions,
		Follow_up:      input.Follow_up,
	}

	// Here you would typically save the prescription to the database
	// For example: db.Create(&prescription)
	// Return a success response with the created prescription
	c.JSON(201, gin.H{"message": "Prescription created successfully", "prescription": prescription})
	return

}
