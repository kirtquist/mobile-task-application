// Prefer setting EXPO_PUBLIC_API_URL in app.config.* or env.
// Example: http://localhost:8000 or https://api.example.com
export const API_URL =
    process.env.EXPO_PUBLIC_API_URL ?? "https://task-app-service-backend-426afe5-57fc7zcbta-uw.a.run.app/api";
