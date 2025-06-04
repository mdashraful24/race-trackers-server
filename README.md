# RaceTrackers

[Live Site](https://marathonproject-2a4f2.web.app/)

## About
**RaceTrackers** is a comprehensive marathon management platform designed to streamline event organization and participation. It connects event organizers and participants, enabling efficient event creation, registration, and communication, all through a secure and user-friendly interface.

## Features
- **Event Creation:** Organizers can create and customize marathon events with details like date, location, and participant limits.
- **User Registration:** Participants can easily register for events via a simple and intuitive process.
- **Personal Dashboard:** Users manage their event registrations, track event details, and receive updates.
- **Secure Authentication:** User accounts are protected with JWT-based authentication and secure login.
- **Responsive Design:** Fully optimized for desktops, tablets, and mobile devices to ensure accessibility.

## Technologies Used

### Frontend
- React.js
- CSS / Tailwind CSS (if applicable)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JSON Web Tokens (JWT) for authentication
- dotenv for environment configuration

## Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
````

2. Navigate to the backend folder:

   ```bash
   cd backend
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Create a `.env` file with your configuration (e.g., MongoDB URI, JWT secret).
5. Start the server:

   ```bash
   npm start
   ```

## Backend Dependencies

```json
{
  "dependencies": {
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.12.0"
  }
}
```

## License

This project is licensed under the MIT License.

---

Build, manage, and track marathons effortlessly with **RaceTrackers**!
