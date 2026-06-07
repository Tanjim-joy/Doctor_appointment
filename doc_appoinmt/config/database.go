package config

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectDatabase() {
	host := getEnv("DB_HOST", "127.0.0.1")
	// port := getEnv("DB_PORT", "3306")
	user := getEnv("DB_USER", "root")
	password := getEnv("DB_PASSWORD", "")
	name := getEnv("DB_NAME", "doc_appointments")

	// 🔑 Resolve port (ENV > 3306 > 3307)
	port := resolveDBport(host)

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, password, host, port, name)
	database, err := sql.Open("mysql", dsn)

	if err != nil {
		log.Fatalf("Invalid DSN: %v", err)
	}

	database.SetConnMaxLifetime(time.Minute * 3)
	database.SetMaxOpenConns(10)
	database.SetMaxIdleConns(10)

	if err = database.Ping(); err != nil {
		fmt.Println("❌ Database Connection Failed!")
		log.Fatal(err)
	}

	fmt.Println("✅ Database Connection Successful!")
	DB = database
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func resolveDBport(host string) string {
	if port := os.Getenv("DB_PORT"); port != "" {
		return port
	}

	for _, port := range []string{"3306", "3307"} {
		conn, err := net.DialTimeout("tcp", host+":"+port, time.Second)
		if err == nil {
			conn.Close()
			return port
		}
	}

	return "3306"
}
