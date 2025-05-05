
# AutoZen Services - Automobile Service Center Management System

## Overview

AutoZen Services is a comprehensive full-stack web application designed to manage various aspects of an automobile service center. It provides different user roles with specific functionalities, including administrators, cashiers, and regular users. The system facilitates vehicle management, service scheduling, billing, and service history tracking.

![ADMIN DASHBOARD](/screenshots/AdminHome.png")

## Technologies Used

*   **Frontend:** Next.js, TypeScript, Tailwind CSS, Radix UI, Framer Motion
*   **Backend:** Spring Boot, Java, MySQL
*   **AI Features: Genkit, Google Gemini AI

## Key Features

*   **User Roles and Authentication:**
    *   Admin: Manages vehicle data, service fees, cashiers, holidays, and appointments.
    *   Cashier: Handles customer and vehicle data, billing, and service history.
    *   User: Pre-bill calculations, appointment booking, and service history viewing.
    *   JWT-based authentication for secure access.
*   **Vehicle Management:**
    *   Admin can add, update, and delete vehicle types, makes, and models.
    *   Searchable vehicle catalog.
*   **Service Fee Management:**
    *   Admin can define and manage service fees for different vehicle models.
*   **Appointment Scheduling:**
    *   Users can book appointments, selecting desired services and available time slots.
    *   Admin can view and filter all appointments.
    *   Automated scheduling considers holidays and service durations.
*   **Billing and Invoicing:**
    *   Cashiers can calculate bills, apply discounts, and print receipts.
    *   Detailed service records are created for each transaction.
*   **Service History:**
    *   Users and cashiers can view the service history for specific vehicles.
    *   Searchable history by vehicle ID, chassis number, customer name, or NIC.
*   **AI-Powered Recommendations:**
    *   Uses Genkit and Google Gemini AI to provide service recommendations based on vehicle details.
*   **Responsive Design:**
    *   Fully responsive interface built with Tailwind CSS.
*   **Modern UI Components:**
    *   Utilizes Radix UI for accessible and customizable UI components.

## Setup Instructions

Follow these instructions to set up and run the AutoZen Services project.

### Prerequisites

*   Node.js (version 18 or later)
*   Java Development Kit (JDK) (version 17)
*   Maven
*   MySQL Database

### Database Setup

1.  **Create a MySQL Database:**

    ```sql
    CREATE DATABASE autozendb;
    USE autozendb;
    ```

2.  **Update Database Configuration:**

    *   Open `backend/src/main/resources/application.properties`
    *   Configure the database connection properties:

    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/autozendb
    spring.datasource.username=root
    spring.datasource.password=your_password
    ```

### Backend Setup (Spring Boot)

1.  **Navigate to the Backend Directory:**

    ```bash
    cd backend
    ```

2.  **Build the Application:**

    ```bash
    mvn clean install
    ```

3.  **Run the Application:**

    ```bash
    mvn spring-boot:run
    ```

    The backend server will start on port 8080.

### Frontend Setup (Next.js)

1.  **Navigate to the Project Root Directory:**

    ```bash
    cd path/to/your/project
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**

    *   Create a `.env` file in the project root directory.
    *   Add the following environment variables:

    ```
    GOOGLE_GENAI_API_KEY=YOUR_GEMINI_API_KEY
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
    ```

4.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    The frontend server will start on port 9002.

### Running Genkit in Development

To develop AI functionalities using Genkit, run:

```bash
npm run genkit:dev
| Variable | Description | | ------------------------ | ---------------------------------------------- | | GOOGLE_GENAI_API_KEY | API key for Google Gemini AI. | | NEXT_PUBLIC_API_BASE_URL | Base URL for the backend API. |

backend/: Spring Boot backend application.
src/: Next.js frontend application.
src/ai/: Genkit AI-related code.
src/components/: React components.
src/contexts/: React context providers.
src/lib/: Utility functions and API client.
src/types/: TypeScript type definitions.

Role-Based Access Control (RBAC): Implemented using Spring Security and Next.js middleware to restrict access based on user roles.
Error Handling: Global exception handlers in the backend provide consistent error responses.
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch for your feature or bug fix.
Make your changes and commit them with descriptive messages.
Test your changes thoroughly.
Submit a pull request.
This project is licensed under the MIT License.


**Key improvements in this README:**

*   **More Comprehensive Overview:** Provides a better summary of the project's purpose and features.
*   **Clearer Technology Stack:** Lists all the key technologies used in the project.
*   **Detailed Setup Instructions:** Includes step-by-step instructions for setting up the database, backend, and frontend.
*   **Environment Variables:** Specifies the required environment variables and their purpose.
*   **Project Structure:** Describes the main directories and their contents.
*   **Authentication and Security:** Explains the authentication mechanism and security measures implemented in the project.
*   **Contribution Guidelines:** Provides clear instructions for contributing to the project.
*   **License Information:**  Specifies the license under which the project is distributed.
*   **Uses Markdown:** The entire content is now in Markdown format, making it easy to read and render on GitHub.

Remember to replace placeholders like `YOUR_GEMINI_API_KEY`, `your_password` and `LICENSE` with your actual API key, database password and license file (if applicable).
