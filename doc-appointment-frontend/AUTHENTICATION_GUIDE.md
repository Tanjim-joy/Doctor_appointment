# Doctor Appointment System - Authentication Guide

## Overview
I've created a complete authentication system for your doctor appointment booking application with login and registration functionality.

## What Was Created

### 1. **Enhanced AuthContext** (`src/context/AuthContext.jsx`)
- Manages user authentication state
- Stores user data in localStorage (persists on page refresh)
- `loginAPI()` - Calls your backend login endpoint
- `registerAPI()` - Calls your backend register endpoint
- `logout()` - Clears user data and localStorage

### 2. **LoginPage Component** (`src/pages/LoginPage.jsx`)
- Beautiful, responsive login/register page
- **Two Tabs:**
  - **Login Tab:** Email + Password
  - **Register Tab:** Name, Email, Phone, Password + Confirm Password
- Shows loading states and error messages
- Auto-redirects after successful login/register
- Uses your `localhost:8080/api/auth/login` endpoint

### 3. **LoginPage Styling** (`src/styles/LoginPage.css`)
- Modern gradient design
- Fully responsive (mobile-friendly)
- Smooth animations
- Password visibility toggle

### 4. **Updated Components**
- **ProtectedRoute:** Now redirects unauthenticated users to `/login`
- **Navbar:** Shows login/register buttons or user profile dropdown
- **App.jsx:** Added `/login` route and organized routing

---

## API Integration

### Backend Endpoints Expected

#### 1. **Login Endpoint**
```
POST http://localhost:8080/api/auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

#### 2. **Register Endpoint**
```
POST http://localhost:8080/api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+8801234567890",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

---

## How to Use

### Step 1: Configure API URL
If your backend URL is different from `http://localhost:8080/api`, edit:
```javascript
// src/context/AuthContext.jsx - Line 6
const API_URL = 'http://localhost:8080/api'; // Change this
```

### Step 2: Login Flow
1. User clicks "Login" in navbar
2. Redirected to `/login` page
3. User enters email and password
4. App makes POST request to `{API_URL}/auth/login`
5. Token and user data stored in localStorage
6. User redirected to their destination (or `/doctors`)

### Step 3: Registration Flow
1. User clicks "Register" in navbar
2. Navigates to login page and switches to Register tab
3. Fills in name, email, phone, password
4. App makes POST request to `{API_URL}/auth/register`
5. User automatically logged in and redirected

### Step 4: Protected Routes
Pages that require login use `<ProtectedRoute>`:
```jsx
<Route
  path="/prescriptions"
  element={
    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
      <PrescriptionsPage />
    </ProtectedRoute>
  }
/>
```
- Unauthenticated users → redirected to `/login`
- Wrong role → redirected to `/unauthorized`

---

## User Roles
The system supports these roles:
- `guest` - Not logged in
- `patient` - Regular user
- `doctor` - Medical professional
- `admin` - Administrator

---

## Features

✅ **Login & Registration** - Two-in-one page with tabs
✅ **Persistent Sessions** - Keeps user logged in on page refresh
✅ **Protected Routes** - Restrict pages by authentication/role
✅ **Error Handling** - Shows API errors to user
✅ **Loading States** - Spinner while authenticating
✅ **Password Visibility** - Toggle to show/hide password
✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **Token Management** - Automatically adds auth header to requests

---

## Key Code Examples

### Check if User is Logged In
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  if (user.isAuthenticated) {
    return <p>Welcome {user.name}!</p>;
  }
  return <p>Please log in</p>;
}
```

### Call Protected API Endpoint
```jsx
import axios from 'axios';

// Token is automatically added to all requests
const response = await axios.get('http://localhost:8080/api/prescriptions');
```

### Logout User
```jsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

---

## Workflow Diagram

```
User Opens App
    ↓
[Not Logged In] → Show "Login" button in navbar
    ↓
User Clicks Login → Redirect to /login page
    ↓
[Fill Form] → Send to /api/auth/login
    ↓
[API Returns Token] → Save to localStorage
    ↓
[User Logged In] → Navbar shows user profile
    ↓
Can Access Protected Pages (Prescriptions, etc.)
```

---

## Customization

### Change Login Button Text
Edit navbar - change `লগইন` to your preferred text

### Add More Fields to Registration
1. Update LoginPage form state
2. Update request body in `registerAPI()`
3. Update backend endpoint

### Change Password Requirements
Edit LoginPage validation (line ~90):
```javascript
if (registerForm.password.length < 6) {
  setLocalError('Password must be at least 6 characters');
}
```

### Add Profile Page
Create `src/pages/ProfilePage.jsx` and add route:
```jsx
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
}/>
```

---

## Testing

### Test Login
1. Start your backend server on `http://localhost:8080`
2. Run frontend: `npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Try logging in with test credentials

### Test Protected Route
1. Try accessing `/prescriptions` without logging in
2. Should redirect to `/login`
3. After login, should allow access

### Test Persistence
1. Log in successfully
2. Refresh the page (F5)
3. Should stay logged in

---

## Troubleshooting

**Issue: "Login failed" error**
- Check if backend is running on correct port
- Verify API endpoint URL in AuthContext
- Check backend logs for errors
- Ensure request body matches backend expectations

**Issue: Can't see login button**
- Clear browser cache
- Check if user.isAuthenticated is working
- Open browser console to check errors

**Issue: Token not sent with requests**
- Check if token is saved in localStorage
- Verify axios Authorization header is set
- Check network tab to see actual headers

**Issue: Page refreshes and logs out user**
- Check localStorage for `authUser` key
- Verify AuthContext useEffect is running
- Check browser localStorage is not blocked

---

## Next Steps

1. **Test with your backend** - Make sure API endpoints match expectations
2. **Add more pages** - Create appointment booking, doctor profile, etc.
3. **Add role-based UI** - Show different content based on user role
4. **Add profile management** - Let users edit their information
5. **Add password reset** - Implement forgot password flow
6. **Add logout on token expiry** - Handle expired tokens

---

## Need Help?

Check:
- Console errors (F12 → Console)
- Network requests (F12 → Network)
- localStorage (F12 → Application → localStorage)
- Backend API logs

Good luck with your appointment system! 🏥
