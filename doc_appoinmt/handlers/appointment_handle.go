package handlers

import (
	"database/sql"
	"doc_appoinmt/config"
	models "doc_appoinmt/model"
	"net/http"
	"time"

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
				a.ref_name,
				a.ref_phone,
				a.age,
				a.remarks,
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
			&appointment.Ref_name,
			&appointment.Ref_phone,
			&appointment.Age,
			&appointment.Remarks,
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

// Get appointment details by ID
// func GetAppointmentByID(c *gin.Context) {
// 	appointmentID := c.Param("id")
// 	if appointmentID == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Appointment ID is required"})
// 		return
// 	}

// 	query := `
// 		SELECT
// 			a.id,
// 			a.doctor_id,
// 			a.patient_id,
// 			a.appointment_date,
// 			a.status,
// 			a.symptoms,
// 			d.consultation_fee,
// 			d.specialization,
// 			patient_user.username AS patient_name,
// 			doctor_user.username AS doctor_name
// 		FROM appointments a
// 		JOIN patients p ON a.patient_id = p.id
// 		JOIN users patient_user ON p.user_id = patient_user.id
// 		JOIN doctors d ON a.doctor_id = d.id
// 		JOIN users doctor_user ON d.user_id = doctor_user.id
// 		WHERE a.id = ?
// 	`

// 	var appointmentDate string
// 	var appointment models.Appointment

// 	err := config.DB.QueryRow(query, appointmentID).Scan(
// 		&appointment.ID,
// 		&appointment.DoctorID,
// 		&appointment.PatientID,
// 		&appointmentDate,
// 		&appointment.Status,
// 		&appointment.Symptoms,
// 		&appointment.Consultation_fee,
// 		&appointment.Specialization,
// 		&appointment.Patient_name,
// 		&appointment.Doctor_name,
// 	)
// 	if err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{
// 			"error": "Appointment not found",
// 		})
// 		return
// 	}

// 	appointment.Appointment_date = appointmentDate
// 	c.JSON(http.StatusOK, gin.H{"appointment": appointment})
// }

// Get appointments for a specific user
func GetAppointmentsByUser(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	roleQuery := `SELECT role FROM users WHERE id = ?`
	var role string
	if err := config.DB.QueryRow(roleQuery, userID).Scan(&role); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var whereClause string
	if role == "patient" {
		whereClause = `patient_user.id = ?`
	} else if role == "doctor" {
		whereClause = `doctor_user.id = ?`
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	query := `
		SELECT
			a.id,
			a.appointment_date,
			a.status,
			a.symptoms,
			a.patient_id,
			a.ref_name,
			a.ref_phone,
			a.age,
			a.remarks,
			patient_user.id AS patient_user_id,
			patient_user.username AS patient_name,
			a.doctor_id,
			doctor_user.id AS doctor_user_id,
			doctor_user.username AS doctor_name,
			d.consultation_fee,
			d.specialization
		FROM appointments a
		LEFT JOIN patients p ON a.patient_id = p.id
		LEFT JOIN users patient_user ON p.user_id = patient_user.id
		LEFT JOIN doctors d ON a.doctor_id = d.id
		LEFT JOIN users doctor_user ON d.user_id = doctor_user.id
		WHERE ` + whereClause + `
		ORDER BY a.appointment_date DESC
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments: " + err.Error()})
		return
	}
	defer rows.Close()

	var appointments []models.Appointment
	for rows.Next() {
		var appointmentDate string
		var appointment models.Appointment

		if err := rows.Scan(
			&appointment.ID,
			&appointmentDate,
			&appointment.Status,
			&appointment.Symptoms,
			&appointment.PatientID,
			&appointment.Ref_name,
			&appointment.Ref_phone,
			&appointment.Age,
			&appointment.Remarks,
			&appointment.Patient_user_id,
			&appointment.Patient_name,
			&appointment.DoctorID,
			&appointment.Doctor_user_id,
			&appointment.Doctor_name,
			&appointment.Consultation_fee,
			&appointment.Specialization,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read appointment data: " + err.Error()})
			return
		}
		appointment.Appointment_date = appointmentDate
		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, gin.H{"appointments": appointments})
}

// Create a new appointment
func CreateAppointment(c *gin.Context) {
	var req models.AppointmentRequest

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

	// Validation
	if req.PatientID <= 0 || req.DoctorID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PatientID and DoctorID must be greater than zero",
		})
		return
	}

	var existsID int
	if err := config.DB.QueryRow("SELECT id FROM doctors WHERE id = ?", req.DoctorID).Scan(&existsID); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor_id: doctor not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate doctor: " + err.Error()})
		return
	}

	if err := config.DB.QueryRow("SELECT id FROM patients WHERE id = ?", req.PatientID).Scan(&existsID); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient_id: patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate patient: " + err.Error()})
		return
	}

	// Default status to pending if not provided
	if req.Status == "" {
		req.Status = "pending"
	}

	// Validate appointment date
	if req.Appointment_date == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Appointment date is required",
		})
		return
	}

	appointmentDate, err := time.Parse("2006-01-02 15:04:05", req.Appointment_date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid appointment date format: " + err.Error(),
		})
		return
	}

	now := time.Now()
	if appointmentDate.Before(now) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Appointment date cannot be in the past",
		})
		return
	}

	// Insert the new appointment into the database
	insertQuery := `INSERT INTO appointments (patient_id, doctor_id, appointment_date, symptoms, status, ref_name, ref_phone, age, remarks)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := config.DB.Exec(insertQuery, req.PatientID, req.DoctorID, req.Appointment_date, req.Symptoms, req.Status, req.Ref_name, req.Ref_phone, req.Age, req.Remarks)
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

	// Appointment date update is allowed only if status is pending  & can't to set appointment date in past
	if appoint_dateRAW, exists := updateReq["appointment_date"]; exists {

		appoint_date_str, ok := appoint_dateRAW.(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Appointment Date must be a string",
			})
			return
		}
		appoint_date, err := time.Parse("2006-01-02 15:04:05", appoint_date_str)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid appointment date format: " + err.Error(),
			})
			return
		}
		now := time.Now()

		if appoint_date.Before(now) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Appointment date cannot be in the past",
			})
			return
		}

		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "appointment_date = ?"
		args = append(args, appoint_date)
		fields++

	}

	if ref_name, exists := updateReq["ref_name"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "ref_name = ?"
		args = append(args, ref_name)
		fields++
	}

	if ref_phone, exists := updateReq["ref_phone"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "ref_phone = ?"
		args = append(args, ref_phone)
		fields++
	}

	if age, exists := updateReq["age"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "age = ?"
		args = append(args, age)
		fields++
	}

	if remarks, exists := updateReq["remarks"]; exists {
		if fields > 0 {
			updateQuery += ", "
		}
		updateQuery += "remarks = ?"
		args = append(args, remarks)
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
