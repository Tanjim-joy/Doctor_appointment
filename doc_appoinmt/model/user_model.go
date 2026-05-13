package models

type User struct {
	ID           int    `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
	Role         string `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username,omitempty" binding:"omitempty"`
	Email    string `json:"email,omitempty" binding:"omitempty"`
	Password string `json:"password" binding:"required"`
}
