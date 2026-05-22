# ========================================
# Build stage
# ========================================

FROM golang:1.25.9-alpine AS builder

# package dependencies
RUN apk add --no-cache git

# set working directory
WORKDIR /app

# go.mod & go.sum 
COPY go.mod go.sum ./

# download dependencies
RUN go mod download

# copy source code
COPY . .

# build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd

# ========================================
# Final stage & Production image
# ========================================

FROM alpine:latest 

# Certificates for HTTPS & time zone data
RUN apk --no-cache add ca-certificates tzdata

# set working directory
WORKDIR /app

# copy the built binary from the builder stage
COPY --from=builder /app/main .

# expose the application port
EXPOSE 8080

# Application entry point
CMD ["./main"]