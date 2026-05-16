package handlers

import (
	"doc_appoinmt/config"
	models "doc_appoinmt/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Get all Appointment details user admin
func GetAllAppointments(c *gin.Context) {
	query := `
			SELECT 
				a.id,
				a.doctor_id,
				a.patient_id,
				a.appointment_date,
				a.status,
				a.symptoms,
				d.consultation_fee,
				d.specialization,
				patient_user.username AS patient_name,
				doctor_user.username AS doctor_name
			FROM appointments a
			JOIN patients p ON a.patient_id = p.id
			JOIN users patient_user ON p.user_id = patient_user.id
			JOIN doctors d ON a.doctor_id = d.id
			JOIN users doctor_user ON d.user_id = doctor_user.id
			ORDER BY a.appointment_date DESC
		 `

	// execute query
	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch appointments : " + err.Error(),
		})
		return
	}
	defer rows.Close()

	var appointments []models.Appointment

	for rows.Next() {
		var appointmentDate string
		var appointment models.Appointment
		err := rows.Scan(
			&appointment.ID,
			&appointment.DoctorID,
			&appointment.PatientID,
			&appointmentDate,
			&appointment.Status,
			&appointment.Symptoms,
			&appointment.Consultation_fee,
			&appointment.Specialization,
			&appointment.Patient_name,
			&appointment.Doctor_name,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read appointment data: " + err.Error(),
			})
			return
		}
		appointment.Appointment_date = appointmentDate
		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
	})
}

// Create a new appointment
func CreateAppointment(c *gin.Context) {
	var req models.AppointmentRequest

	// Bind the JSON body to the struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data: " + err.Error(),
		})
		return
	}

	// Validation
	if req.PatientID <= 0 || req.DoctorID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PatientID and DoctorID must be greater than zero",
		})
		return
	}

	// Default status to pending if not provided
	if req.Status == "" {
		req.Status = "pending"
	}

	// Insert the new appointment into the database
	insertQuery := `INSERT INTO appointments (patient_id, doctor_id, appointment_date, symptoms, status)
		VALUES (?, ?, ?, ?, ?)`
	result, err := config.DB.Exec(insertQuery, req.PatientID, req.DoctorID, req.Appointment_date, req.Symptoms, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create appointment: " + err.Error(),
		})
		return
	}

	appointmentID, _ := result.LastInsertId()

	c.JSON(http.StatusCreated, gin.H{
		"message": "Appointment created successfully",
		"id":      appointmentID,
	})
}

// Get appointment details by ID (user-scoped - shows only if user is patient/doctor/admin)
func GetAppointmentByID(c *gin.Context) {
	appointmentID := c.Param("id")

	query := `SELECT 
				a.id,
				a.doctor_id,
				a.patient_id,
				a.appointment_date,
				a.status,    
				a.symptoms,
				d.consultation_fee,
				d.specialization,
				patient_user.username AS patient_name,
				doctor_user.username AS doctor_name
			FROM appointments a
			JOIN patients p ON a.patient_id = p.id
			JOIN users patient_user ON p.user_id = patient_user.id
			JOIN doctors d ON a.doctor_id = d.id
			JOIN users doctor_user ON d.user_id = doctor_user.id
			WHERE a.id = ?`

	var appointmentDate string
	var appointment models.Appointment

	err := config.DB.QueryRow(query, appointmentID).Scan(
		&appointment.ID,
		&appointment.DoctorID,
		&appointment.PatientID,
		&appointmentDate,
		&appointment.Status,
		&appointment.Symptoms,
		&appointment.Consultation_fee,
		&appointment.Specialization,
		&appointment.Patient_name,
		&appointment.Doctor_name,
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Appointment not found",
		})
		return
	}

	appointment.Appointment_date = appointmentDate

	c.JSON(http.StatusOK, gin.H{
		"appointment": appointment,
	})
}

// Get all appointments for authenticated user (as patient or doctor)
func GetUserAppointments(c *gin.Context) {
	userID := c.Param("user_id")

	// একটাই কোয়েরি সব কাজ করবে
	query := `
		SELECT 
			a.id,
			a.doctor_id,
			a.patient_id,
			a.appointment_date,
			a.status,    
			a.symptoms,
			d.consultation_fee,
			d.specialization,
			COALESCE(patient_user.username, '') AS patient_name,
			COALESCE(doctor_user.username, '') AS doctor_name,
			CASE 
				WHEN d.id IS NOT NULL THEN 'doctor'
				WHEN p.id IS NOT NULL THEN 'patient'
				ELSE 'unknown'
			END as user_type
		FROM users u
		LEFT JOIN doctors d ON d.user_id = u.id
		LEFT JOIN patients p ON p.user_id = u.id
		LEFT JOIN appointments a ON (a.doctor_id = d.id OR a.patient_id = p.id)
		LEFT JOIN patients p2 ON a.patient_id = p2.id
		LEFT JOIN users patient_user ON p2.user_id = patient_user.id
		LEFT JOIN doctors d2 ON a.doctor_id = d2.id
		LEFT JOIN users doctor_user ON d2.user_id = doctor_user.id
		WHERE u.id = ? AND a.id IS NOT NULL
		ORDER BY a.appointment_date DESC
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch appointments: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	var appointments []models.Appointment
	var userType string

	for rows.Next() {
		var appointmentDate string
		var appointment models.Appointment
		err := rows.Scan(
			&appointment.ID,
			&appointment.DoctorID,
			&appointment.PatientID,
			&appointmentDate,
			&appointment.Status,
			&appointment.Symptoms,
			&appointment.Consultation_fee,
			&appointment.Specialization,
			&appointment.Patient_name,
			&appointment.Doctor_name,
			&userType,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read appointment data: " + err.Error(),
			})
			return
		}
		appointment.Appointment_date = appointmentDate
		appointments = append(appointments, appointment)
	}

	// যদি কোনো অ্যাপয়েন্টমেন্ট না পাওয়া যায়
	if len(appointments) == 0 {
		// ইউজার টাইপ চেক করুন
		var exists bool
		var typeCheck string
		typeQuery := `SELECT 
			CASE 
				WHEN EXISTS (SELECT 1 FROM doctors WHERE user_id = ?) THEN 'doctor'
				WHEN EXISTS (SELECT 1 FROM patients WHERE user_id = ?) THEN 'patient'
				ELSE 'unknown'
			END as user_type`
		config.DB.QueryRow(typeQuery, userID, userID).Scan(&typeCheck)

		c.JSON(http.StatusOK, gin.H{
			"appointments": []models.Appointment{},
			"user_type":    typeCheck,
			"message":      "No appointments found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"user_type":    userType,
	})
}

// Update appointment (status, symptoms, or appointment_date)
func UpdateAppointment(c *gin.Context) {
	appointmentID := c.Param("id")

	var updateReq map[string]interface{}

	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data: " + err.Error(),
		})
		return
	}

	// Build dynamic UPDATE query based on provided fields
	updateQuery := "UPDATE appointments SET "
	args := []interface{}{}
	fields := 0

	if status, exists := updateReq["status"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "status = ?"
		args = append(args, status)
		fields++
	}

	if symptoms, exists := updateReq["symptoms"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "symptoms = ?"
		args = append(args, symptoms)
		fields++
	}

	if appointment_date, exists := updateReq["appointment_date"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "appointment_date = ?"
		args = append(args, appointment_date)
		fields++
	}

	if fields == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No valid fields to update",
		})
		return
	}

	updateQuery += " WHERE id = ?"
	args = append(args, appointmentID)

	result, err := config.DB.Exec(updateQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update appointment: " + err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Appointment not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment updated successfully",
	})
}

// Delete/Cancel appointment
func DeleteAppointment(c *gin.Context) {
	appointmentID := c.Param("id")

	// Soft delete by setting status to 'cancelled'
	updateQuery := "UPDATE appointments SET status = 'cancelled' WHERE id = ?"

	result, err := config.DB.Exec(updateQuery, appointmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to cancel appointment: " + err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Appointment not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment cancelled successfully",
	})
}
