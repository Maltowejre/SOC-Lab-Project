# SecureAuth SOC Lab

A Security Operations Center (SOC) authentication monitoring lab built with Next.js and Supabase.

## Live Demo

https://soc-lab-web.vercel.app/

## Project Overview

SecureAuth SOC Lab simulates a real-world authentication monitoring system used by Security Operations Centers (SOC).

The system tracks login activity, detects suspicious behavior such as brute force attacks, calculates risk scores, and generates security alerts.

High-risk events trigger real-time email notifications to the SOC administrator.

This project demonstrates secure authentication monitoring architecture and detection logic in a modern web environment.

## Key Features

### Authentication Monitoring
- Successful login tracking
- Failed login tracking
- Account creation logging

### Detection Engine
- Brute force detection (5 failed attempts within 5 minutes)
- Excessive IP detection
- Risk scoring (Low / Medium / High)
- Automatic account lock mechanism

### Alerting System
- Automatic alert creation
- Risk-based alert levels
- Email notifications for high-risk activity
- Alert management in dashboard

### SOC Dashboard
- Authentication event logs
- Risk indicators
- Login metadata
- Event statistics summary

## How to Test the System

You may use any test email and password.

⚠️ Please do NOT use real credentials.

### To simulate a brute force attack:

1. Go to Login page.
2. Enter a valid email.
3. Enter an incorrect password 5 times quickly.
4. The system will:
   - Detect brute force behavior
   - Assign High risk score
   - Lock the account temporarily
   - Generate a security alert
   - Send an email notification to the SOC administrator

## System Flow

1. Login attempt is recorded in `security_events`
2. `/api/process-event` analyzes the event
3. Detection rules are applied
4. Risk score is calculated
5. Alert is created if necessary
6. High-risk events trigger an email notification

## Tech Stack

- Next.js (App Router)
- Supabase (Authentication & Database)
- Resend (Email alerts)
- Vercel (Deployment)
- React Hot Toast (UI notifications)

## Security Notice

This project is a demonstration lab environment.

Users should:
- Use test credentials only
- Avoid using real passwords
- Understand this is a monitoring simulation

## Future Enhancements

- Real-time alert streaming
- Geo-location login detection
- Advanced anomaly detection
- Admin analytics dashboard
- Threat intelligence integration
---

⭐ If you like this project, feel free to star the repository.
