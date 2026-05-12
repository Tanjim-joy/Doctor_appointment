package config

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectDatabase() {

	dsn := "root:@tcp(127.0.0.1:3306)/doc_appointments"
	database, err := sql.Open("mysql", dsn)

	if err != nil {
		log.Fatalf("Invalid DSN: %v", err)
	}
	// defer database.Close()

	database.SetConnMaxLifetime(time.Minute * 3)
	database.SetMaxOpenConns(10)
	database.SetMaxIdleConns(10)

	if err != nil {
		fmt.Println("❌ Database Connection Failed!")
		log.Fatal(err)
	}

	fmt.Println("✅ Database Connection Successful!")
	DB = database
}
