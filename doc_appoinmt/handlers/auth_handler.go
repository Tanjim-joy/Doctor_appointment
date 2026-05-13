package handlers

import (
	"doc_appoinmt/config"
	models "doc_appoinmt/model"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Secret key for JWT (move to env/config in production)
var jwtSecret = []byte("your-secret-key-here")

func verifyPassword(storedPassword, providedPassword string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(providedPassword)); err == nil {
		return true
	}

	// Fallback for existing non-bcrypt values in the database.
	// Use this only for migration/testing, and migrate stored passwords to bcrypt as soon as possible.
	return storedPassword == providedPassword
}

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	var query string
	var args []interface{}
	if req.Username != "" {
		query = "SELECT id, username, email, password_hash, role FROM users WHERE username = ?"
		args = []interface{}{req.Username}
	} else if req.Email != "" {
		query = "SELECT id, username, email, password_hash, role FROM users WHERE email = ?"
		args = []interface{}{req.Email}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username or email is required"})
		return
	}

	var user models.User
	err := config.DB.QueryRow(query, args...).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials 1"})
		return
	}

	if !verifyPassword(user.PasswordHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials 2"})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   tokenString,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}
