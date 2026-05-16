package main

import (
	"doc_appoinmt/config" // For database Connections
	"doc_appoinmt/handlers"
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize the Database
	config.ConnectDatabase()

	// Initialize the Gin Router
	r := gin.Default()

	// cors setup  React (localhost:5173) থেকে request আসতে দেবে
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Simple Test Route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Backend is running and DB is connected!",
		})
	})

	// Doctors Routes
	api := r.Group("/api")
	{
		api.GET("/doctors", handlers.GetAllDoctors)

	}
	auth := r.Group("/auth")
	{
		auth.POST("/login", handlers.Login)
	}
	admin := r.Group("/admin")
	{
		admin.GET("/appointments", handlers.GetAllAppointments)
	}
	// Appointment routes for users (patient/doctor)
	appointments := r.Group("/appointments")
	{
		appointments.GET("/:id", handlers.GetAppointmentByID)            // Get single appointment
		appointments.GET("/user/:user_id", handlers.GetUserAppointments) // Get all user appointments
		appointments.POST("", handlers.CreateAppointment)                // Create appointment
		appointments.PUT("/:id", handlers.UpdateAppointment)             // Update appointment
		appointments.DELETE("/:id", handlers.DeleteAppointment)          // Cancel appointment
	}

	// 4. Start the Server
	fmt.Println("🚀 Server starting on http://localhost:8080")
	r.Run(":8080")
}
