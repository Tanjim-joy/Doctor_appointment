# Demo Credentials & Testing Guide

## 🧪 Demo Accounts for Testing

On the **Login Page**, you'll see a demo credentials section with three pre-configured test accounts. Simply click the button next to each account to auto-fill the login form.

---

## 📋 Demo Account Details

### 1. **Admin Account**
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Admin

**Accessible Pages:**
- ✅ Home page (`/`)
- ✅ Doctors page (`/doctors`)
- ✅ Appointments (`/appointments`)
- ✅ Prescriptions (`/prescriptions`) - **Full CRUD access**

**Admin Capabilities:**
- View all prescriptions in the system
- Edit and delete prescriptions
- View all appointments
- Access all admin features

---

### 2. **Doctor Account**
- **Email:** `doctor@example.com`
- **Password:** `doctor123`
- **Role:** Doctor

**Accessible Pages:**
- ✅ Home page (`/`)
- ✅ Doctors page (`/doctors`)
- ✅ Appointments (`/appointments`)
- ✅ Prescriptions (`/prescriptions`) - **Create, Read, Update, Delete**

**Doctor Capabilities:**
- Create new prescriptions for patients
- View all prescriptions
- Edit their own prescriptions
- Delete prescriptions
- View and manage appointments
- Cannot edit other doctors' prescriptions (depends on backend logic)

---

### 3. **Patient Account**
- **Email:** `patient@example.com`
- **Password:** `patient123`
- **Role:** Patient

**Accessible Pages:**
- ✅ Home page (`/`)
- ✅ Doctors page (`/doctors`)
- ✅ Appointments (`/appointments`) - **Full access to book & manage**
- ❌ Prescriptions (`/prescriptions`) - **Redirected to home**

**Patient Capabilities:**
- View available doctors
- Book new appointments
- View their own appointments
- Edit appointment details
- Cancel appointments
- Cannot access prescription management (admin/doctor only)

---

## 🧬 What to Test

### Test as **Admin**:
1. ✅ Login with admin credentials
2. ✅ Navigate to `/prescriptions` page
3. ✅ See all prescriptions in table format
4. ✅ Search, filter prescriptions
5. ✅ View prescription details
6. ✅ Navigate to appointments page
7. ✅ Check navbar shows "Admin" profile

### Test as **Doctor**:
1. ✅ Login with doctor credentials
2. ✅ Navigate to `/prescriptions` page
3. ✅ Create a new prescription
   - Fill in patient details
   - Enter medicines and dosage
   - Submit form
4. ✅ Edit an existing prescription
5. ✅ Delete a prescription
6. ✅ View prescription details
7. ✅ Navigate to appointments
8. ✅ Check navbar shows doctor name

### Test as **Patient**:
1. ✅ Login with patient credentials
2. ✅ Try accessing `/prescriptions` → Should redirect to home
3. ✅ Navigate to `/appointments` page
4. ✅ Book a new appointment
   - Select a doctor
   - Choose date and time
   - Add notes
   - Submit
5. ✅ View appointment details
6. ✅ Edit appointment
7. ✅ Cancel appointment
8. ✅ View doctors list
9. ✅ Check navbar shows patient name

---

## 🔄 Testing Workflow

### Complete User Journey - Patient
```
1. Start at home page (/)
2. Click "Register" or go to login
3. Register as new patient or use demo patient account
4. View available doctors at /doctors
5. Navigate to /appointments (now accessible)
6. Click "নতুন অ্যাপয়েন্টমেন্ট" (New Appointment)
7. Select a doctor
8. Choose appointment date & time
9. Add reason and notes
10. Submit
11. See appointment in list with status
12. Try editing and canceling
```

### Complete User Journey - Doctor
```
1. Login as doctor (doctor@example.com / doctor123)
2. View appointments at /appointments
3. Navigate to /prescriptions
4. Click "নতুন প্রেসক্রিপশন" (New Prescription)
5. Enter patient details
6. Add medicines, dosage, instructions
7. Submit
8. See prescription in table
9. Edit and delete prescriptions
10. View prescription details
```

### Complete User Journey - Admin
```
1. Login as admin (admin@example.com / admin123)
2. Navigate to /prescriptions
3. View all prescriptions in system
4. Search by patient/diagnosis
5. Create/Edit/Delete prescriptions
6. View full prescription details
7. Try accessing all pages
```

---

## 🔗 Important API Endpoints

These endpoints are called when testing:

```
POST   /api/auth/login              - Login
POST   /api/auth/register           - Register
GET    /api/doctors                 - Get list of doctors
GET    /api/appointments            - Get user's appointments
POST   /api/appointments            - Create appointment
PUT    /api/appointments/:id        - Update appointment
DELETE /api/appointments/:id        - Cancel appointment
GET    /api/prescriptions           - Get prescriptions
POST   /api/prescriptions           - Create prescription
PUT    /api/prescriptions/:id       - Update prescription
DELETE /api/prescriptions/:id       - Delete prescription
```

---

## ⚠️ Important Notes

### Backend Requirements:
1. **Your backend must authenticate** these demo credentials OR
2. **Create these demo users in your database** with matching credentials
3. Return correct `role` field in login response:
   - `"admin"` for admin account
   - `"doctor"` for doctor account
   - `"patient"` for patient account

### Login Response Format:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Token Header:
The frontend automatically adds this header to all requests:
```
Authorization: Bearer {token}
```

---

## 🐛 Troubleshooting

### Issue: "Login failed"
- **Check:** Backend is running on `http://localhost:8080`
- **Check:** API endpoint is `/api/auth/login`
- **Check:** Backend accepts POST requests with email/password
- **Check:** User exists in backend database with correct role

### Issue: Can't access prescriptions as doctor
- **Check:** Backend returns `"role": "doctor"` in login response
- **Check:** You're using doctor@example.com account
- **Check:** Browser console for error messages (F12)

### Issue: Demo credentials section not showing
- **Check:** You're on the login page (`/login`)
- **Check:** Login tab is active (not register)
- **Clear:** Browser cache and refresh

### Issue: Can access page that should be protected
- **Check:** Role is correct in login response
- **Check:** ProtectedRoute component is checking role
- **Check:** Browser console for errors

---

## 📝 Creating More Test Users

To add more test accounts:

1. **Add to backend:**
   - Create users with different emails/passwords
   - Assign appropriate roles

2. **Add to frontend LoginPage:**
   - Add new demo credentials object
   - Add new demo card in UI
   - Add fill button

3. **Example:**
   ```javascript
   const demoNurseCredentials = {
     email: 'nurse@example.com',
     password: 'nurse123',
     role: 'Nurse',
   };
   ```

---

## ✨ Features to Test

- [x] Authentication (login/logout)
- [x] Role-based access control
- [x] Protected routes
- [x] Session persistence (page refresh)
- [x] CRUD operations on prescriptions
- [x] CRUD operations on appointments
- [x] Search and filtering
- [x] Modal forms
- [x] Error handling
- [x] Loading states
- [x] Responsive design (mobile/tablet/desktop)
- [x] Navbar user profile dropdown
- [x] Demo credentials section

---

## 🚀 Next Steps After Testing

1. **Backend Integration:**
   - Verify all API endpoints work with real data
   - Test with actual patient/doctor/admin data

2. **Data Validation:**
   - Test form validation (empty fields, invalid formats)
   - Test edge cases

3. **Error Scenarios:**
   - Test network errors
   - Test expired tokens
   - Test invalid credentials

4. **Performance:**
   - Test with large datasets
   - Monitor API response times

5. **Security:**
   - Verify tokens are secured
   - Test HTTPS requirement
   - Verify CORS settings

---

Happy Testing! 🧪✨
