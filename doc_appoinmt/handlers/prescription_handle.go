package handlers

import (
	"database/sql"
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

func CreateOrUpdatePrescription(c *gin.Context) {
	var req models.CreatePrescriptionRequest

	contentType := c.GetHeader("Content-Type")

	var err error
	if contentType == "application/json" {
		err = c.ShouldBindJSON(&req)
	} else {
		err = c.ShouldBind(&req)
	}

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data: " + err.Error(),
		})
		return
	}

	// validate doctor and patient existence
	var doctorExists, patientExists bool
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM doctors WHERE id = ?)", req.DoctorID).Scan(&doctorExists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to validate doctor: " + err.Error(),
		})
		return
	}
	if !doctorExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Doctor not found",
		})
		return
	}
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM patients WHERE id = ?)", req.PatientID).Scan(&patientExists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to validate patient: " + err.Error(),
		})
		return
	}
	if !patientExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Patient not found",
		})
		return
	}

	// validate appointment existence and association

	var appointmentExists bool
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM appointments WHERE id = ? AND doctor_id = ? AND patient_id = ?)", req.Appointment_id, req.DoctorID, req.PatientID).Scan(&appointmentExists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to validate appointment: " + err.Error(),
		})
		return
	}

	if !appointmentExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Appointment not found or does not match doctor/patient",
		})
		return
	}

	if req.ID > 0 {
		var prescriptionExists bool
		err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM prescriptions WHERE id = ?)", req.ID).Scan(&prescriptionExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to validate prescription ID: " + err.Error(),
			})
			return
		}

		updateQuery := `UPDATE prescriptions SET patient_id = ?, doctor_id = ?, appointment_id = ?, diagnosis = ?, blood_pressure = ?, medicines = ?, instructions = ?, follow_up = ? WHERE id = ?`
		_, err = config.DB.Exec(updateQuery, req.PatientID, req.DoctorID, req.Appointment_id, req.Diagnosis, req.Blood_pressure, req.Medicines, req.Instructions, req.Follow_up, req.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update prescription: " + err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Prescription updated successfully",
			"id":      req.ID,
		})
		return
	} else {

		// Prevent duplicate prescriptions for the same appointment
		var existingPrescID int
		err = config.DB.QueryRow("SELECT id FROM prescriptions WHERE appointment_id = ?", req.Appointment_id).Scan(&existingPrescID)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error":           "Prescription already exists for this appointment",
				"prescription_id": existingPrescID,
			})
			return
		} else if err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to check existing prescription: " + err.Error(),
			})
			return
		}

		// Insert the new prescription into the database
		insertQuery := `INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, diagnosis, blood_pressure, medicines, instructions, follow_up) 
						VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		result, err := config.DB.Exec(insertQuery, req.PatientID, req.DoctorID, req.Appointment_id, req.Diagnosis, req.Blood_pressure, req.Medicines, req.Instructions, req.Follow_up)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create prescription: " + err.Error(),
			})
			return
		}

		prescriptionID, err := result.LastInsertId()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to retrieve inserted prescription id: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success":         true,
			"message":         "Prescription created successfully",
			"prescription_id": prescriptionID,
		})
	}
}
