package models

import "database/sql"

type Patient struct {
	ID          int            `json:"id"`
	UserID      int            `json:"user_id"`
	DateOfBirth sql.NullString `json:"date_of_birth"`
	Gender      sql.NullString `json:"gender"`
	BloodGroup  sql.NullString `json:"blood_group"`
	Address     sql.NullString `json:"address"`
}
