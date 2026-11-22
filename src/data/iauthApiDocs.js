// Auto-generated reference data extracted from `FMDQ iAuth Service Live.postman_collection 1.json`.
// Regenerate by re-running the extraction script against an updated collection export.
const PAY_OTP_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAY_OTP) || 'http://localhost/qpay/api';

export const IAUTH_API_DOCS = {
  "baseUrl": "http://adgdev.fmdqgroup.com/authService",
  "groups": [
    {
      "key": "user-auth",
      "name": "User Auth & Management",
      "description": "Manage per-application end users: registration, login, password flows, and the approval workflow.",
      "endpoints": [
        {
          "name": "Create user Auth",
          "method": "POST",
          "path": "/api/apps/2/users",
          "auth": "bearer",
          "description": "Register a new user",
          "requestBody": "{\n  \"firstname\": \"Aliu\",\n  \"lastname\": \"Adedigba\",\n  \"email\": \"chance-closer@0792nx5m.mailosaur.net\",\n  \"role_id\": 2,\n  \"app_id\": 2,\n  \"group\": \"BIG\",\n  \"subsidiary\": \"iQx\",\n  \"division\": \"ADG\",\n  \"authoriser_email\": \"teste6zlt2@csrdyoki.mailosaur.net\"\n}",
          "response": {
            "code": 202,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"message\": \"User creation requested. Pending admin approval.\",\n    \"email\": {\n      \"firstname\": \"Aliu\",\n      \"lastname\": \"Adedigba\",\n      \"group\": \"BIG\",\n      \"subsidiary\": \"iQx\",\n      \"division\": \"ADG\",\n      \"email\": \"faithidebi@gmail.com\",\n      \"must_change_password\": true,\n      \"temporary_password_generated_at\": \"2026-02-27T11:44:19.000000Z\",\n      \"updated_at\": \"2026-02-27T11:44:19.000000Z\",\n      \"created_at\": \"2026-02-27T11:44:19.000000Z\",\n      \"id\": 89\n    }\n  },\n  \"message\": \"Creation pending approval\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Forgot Password",
          "method": "POST",
          "path": "/api/apps/forgot-password",
          "auth": "basic",
          "description": "",
          "requestBody": "{\n  \"app_id\": 1,\n  \"email\": \"aliu.adedigba@fmdqgroup.com\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": null,\n  \"message\": \"OTP sent to your email\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "User Login",
          "method": "POST",
          "path": "/api/apps/login",
          "auth": "noauth",
          "description": "User Login into the System",
          "requestBody": "{\n  \"email\": \"williamsmomoh@gmail.com\",\n  \"password\": \"@Password1\",\n  \"app_id\": 3\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"token\": \"4|zBqqJMUaDj6jAUR1wIt7X0zfrLgr18aXNkyYyE8Rc6e0e308\",\n    \"user\": {\n      \"id\": 5,\n      \"firstname\": \"Aliu\",\n      \"lastname\": \"Adedigba\",\n      \"email\": \"aliuadedigba117@gmail.com\"\n    },\n    \"app\": {\n      \"id\": 1,\n      \"name\": null,\n      \"description\": null\n    },\n    \"roles\": [\n      {\n        \"id\": 1,\n        \"name\": \"AuthoriserAul\"\n      }\n    ]\n  },\n  \"message\": \"Login successful\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Change Password",
          "method": "POST",
          "path": "/api/apps/reset-password",
          "auth": "basic",
          "description": "User change password",
          "requestBody": "{\n  \"email\": \"aliuadedigba@gmail.com\",\n  \"app_id\": 2,\n  \"password\": \"newstrongpass456\",\n  \"password_confirmation\": \"newstrongpass456\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": null,\n  \"message\": \"Password reset successful\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get Apps Users",
          "method": "GET",
          "path": "/api/apps/2/users",
          "auth": "bearer",
          "description": "User Login into the System",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"current_page\": 1,\n    \"data\": [\n      {\n        \"id\": 7,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 1,\n        \"temporary_password_generated_at\": \"2026-01-24 17:16:09\",\n        \"created_at\": \"2026-01-24T17:16:09.000000Z\",\n        \"updated_at\": \"2026-01-24T17:16:09.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": null\n      },\n      {\n        \"id\": 6,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"aliuadedigba@gmail.com\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-24 17:13:13\",\n        \"created_at\": \"2026-01-24T17:13:13.000000Z\",\n        \"updated_at\": \"2026-01-24T17:35:38.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-24T17:35:38.000000Z\"\n      }\n    ],\n    \"first_page_url\": \"http://127.0.0.1:8000/api/apps/1/users?page=1\",\n    \"from\": 1,\n    \"last_page\": 1,\n    \"last_page_url\": \"http://127.0.0.1:8000/api/apps/1/users?page=1\",\n    \"links\": [\n      {\n        \"url\": null,\n        \"label\": \"&laquo; Previous\",\n        \"page\": null,\n        \"active\": false\n      },\n      {\n        \"url\": \"http://127.0.0.1:8000/api/apps/1/users?page=1\",\n        \"label\": \"1\",\n        \"page\": 1,\n        \"active\": true\n      },\n      {\n        \"url\": null,\n        \"label\": \"Next &raquo;\",\n        \"page\": null,\n        \"active\": false\n      }\n    ],\n    \"next_page_url\": null,\n    \"path\": \"http://127.0.0.1:8000/api/apps/1/users\",\n    \"per_page\": 15,\n    \"prev_page_url\": null,\n    \"to\": 2,\n    \"total\": 2\n  },\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get Apps Users Stateless",
          "method": "GET",
          "path": "/api/apps/2/users/stateless",
          "auth": "noauth",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"current_page\": 1,\n    \"data\": [\n      {\n        \"id\": 7,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 1,\n        \"temporary_password_generated_at\": \"2026-01-24 17:16:09\",\n        \"created_at\": \"2026-01-24T17:16:09.000000Z\",\n        \"updated_at\": \"2026-01-24T17:16:09.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": null\n      },\n      {\n        \"id\": 6,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"aliuadedigba@gmail.com\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-24 17:13:13\",\n        \"created_at\": \"2026-01-24T17:13:13.000000Z\",\n        \"updated_at\": \"2026-01-24T17:35:38.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-24T17:35:38.000000Z\"\n      }\n    ],\n    \"first_page_url\": \"http://127.0.0.1:8000/api/apps/1/users?page=1\",\n    \"from\": 1,\n    \"last_page\": 1,\n    \"last_page_url\": \"http://127.0.0.1:8000/api/apps/1/users?page=1\",\n    \"links\": [\n      {\n        \"url\": null,\n        \"label\": \"&laquo; Previous\",\n        \"page\": null,\n        \"active\": false\n      },\n      {\n        \"url\": \"http://127.0.0.1:8000/api/apps/1/users?page=1\",\n        \"label\": \"1\",\n        \"page\": 1,\n        \"active\": true\n      },\n      {\n        \"url\": null,\n        \"label\": \"Next &raquo;\",\n        \"page\": null,\n        \"active\": false\n      }\n    ],\n    \"next_page_url\": null,\n    \"path\": \"http://127.0.0.1:8000/api/apps/1/users\",\n    \"per_page\": 15,\n    \"prev_page_url\": null,\n    \"to\": 2,\n    \"total\": 2\n  },\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get single User",
          "method": "GET",
          "path": "/api/apps/1/users/7",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 6,\n    \"firstname\": \"Aliu\",\n    \"lastname\": \"Adedigba\",\n    \"email\": \"aliuadedigba@gmail.com\",\n    \"email_verified_at\": null,\n    \"must_change_password\": 0,\n    \"temporary_password_generated_at\": \"2026-01-24 17:13:13\",\n    \"created_at\": \"2026-01-24T17:13:13.000000Z\",\n    \"updated_at\": \"2026-01-24T17:35:38.000000Z\",\n    \"app_last_password_changed_at\": null,\n    \"app_failed_login_attempts\": 0,\n    \"app_lockout_until\": null,\n    \"app_last_activity_at\": \"2026-01-24T17:35:38.000000Z\"\n  },\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Update User",
          "method": "PUT",
          "path": "/api/apps/3/users/55",
          "auth": "bearer",
          "description": "",
          "requestBody": "{\n  \"firstname\": \"Monetary\",\n  \"lastname\": \"Action\",\n  \"authoriser_email\": \"aliuadedigba@gmail.com\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 6,\n    \"firstname\": \"Adegorite\",\n    \"lastname\": \"Adesola\",\n    \"email\": \"aliuadedigba@gmail.com\",\n    \"email_verified_at\": null,\n    \"must_change_password\": 0,\n    \"temporary_password_generated_at\": \"2026-01-24 17:13:13\",\n    \"created_at\": \"2026-01-24T17:13:13.000000Z\",\n    \"updated_at\": \"2026-01-26T16:14:19.000000Z\",\n    \"app_last_password_changed_at\": null,\n    \"app_failed_login_attempts\": 0,\n    \"app_lockout_until\": null,\n    \"app_last_activity_at\": \"2026-01-24T17:35:38.000000Z\"\n  },\n  \"message\": \"User updated successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "All Pending Actions",
          "method": "GET",
          "path": "/api/apps/2/pending-actions",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 6,\n      \"user_id\": 2,\n      \"action\": \"delete\",\n      \"data\": null,\n      \"requested_by\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null\n      },\n      \"requested_at\": \"2026-01-27T15:24:21.000000Z\",\n      \"status\": \"pending\",\n      \"reviewed_by\": null,\n      \"reviewed_at\": null,\n      \"review_notes\": null,\n      \"created_at\": \"2026-01-27T14:24:21.000000Z\",\n      \"updated_at\": \"2026-01-27T14:24:21.000000Z\",\n      \"user\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null,\n        \"app\": {\n          \"id\": 2,\n          \"app_name\": \"Gold Door\",\n          \"app_description\": \"Applicant Onboarding system\",\n          \"app_url\": null,\n          \"app_password_age\": 20,\n          \"app_session_timeout\": 15,\n          \"app_password_lock_attempts\": 3,\n          \"app_password_history\": 5,\n          \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n          \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n        }\n      }\n    },\n    {\n      \"id\": 5,\n      \"user_id\": 2,\n      \"action\": \"update\",\n      \"data\": {\n        \"authoriser_email\": \"aliuadedigba@gmail.com\",\n        \"firstname\": \"Adegorite\",\n        \"lastname\": \"Adesola\"\n      },\n      \"requested_by\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null\n      },\n      \"requested_at\": \"2026-01-27T15:20:12.000000Z\",\n      \"status\": \"pending\",\n      \"reviewed_by\": null,\n      \"reviewed_at\": null,\n      \"review_notes\": null,\n      \"created_at\": \"2026-01-27T14:20:12.000000Z\",\n      \"updated_at\": \"2026-01-27T14:20:12.000000Z\",\n      \"user\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null,\n        \"app\": {\n          \"id\": 2,\n          \"app_name\": \"Gold Door\",\n          \"app_description\": \"Applicant Onboarding system\",\n          \"app_url\": null,\n          \"app_password_age\": 20,\n          \"app_session_timeout\": 15,\n          \"app_password_lock_attempts\": 3,\n          \"app_password_history\": 5,\n          \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n          \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n        }\n      }\n    },\n    {\n      \"id\": 4,\n      \"user_id\": 5,\n      \"action\": \"create\",\n      \"data\": null,\n      \"requested_by\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null\n      },\n      \"requested_at\": \"2026-01-27T15:18:20.000000Z\",\n      \"status\": \"pending\",\n      \"reviewed_by\": null,\n      \"reviewed_at\": null,\n      \"review_notes\": null,\n      \"created_at\": \"2026-01-27T14:18:20.000000Z\",\n      \"updated_at\": \"2026-01-27T14:18:20.000000Z\",\n      \"user\": {\n        \"id\": 5,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"aliu.adedigba@gmail.com\",\n        \"group\": \"BIG\",\n        \"subsidiary\": \"iQx\",\n        \"division\": \"ADG\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 1,\n        \"temporary_password_generated_at\": \"2026-01-27 14:18:20\",\n        \"created_at\": \"2026-01-27T14:18:20.000000Z\",\n        \"updated_at\": \"2026-01-27T14:18:20.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": null,\n        \"is_active\": false,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null,\n        \"app\": {\n          \"id\": 2,\n          \"app_name\": \"Gold Door\",\n          \"app_description\": \"Applicant Onboarding system\",\n          \"app_url\": null,\n          \"app_password_age\": 20,\n          \"app_session_timeout\": 15,\n          \"app_password_lock_attempts\": 3,\n          \"app_password_history\": 5,\n          \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n          \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n        }\n      }\n    },\n    {\n      \"id\": 3,\n      \"user_id\": 4,\n      \"action\": \"create\",\n      \"data\": null,\n      \"requested_by\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null\n      },\n      \"requested_at\": \"2026-01-27T15:17:56.000000Z\",\n      \"status\": \"pending\",\n      \"reviewed_by\": null,\n      \"reviewed_at\": null,\n      \"review_notes\": null,\n      \"created_at\": \"2026-01-27T14:17:56.000000Z\",\n      \"updated_at\": \"2026-01-27T14:17:56.000000Z\",\n      \"user\": {\n        \"id\": 4,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"aliu1.adedigba@fmdqgroup.com\",\n        \"group\": \"BIG\",\n        \"subsidiary\": \"iQx\",\n        \"division\": \"ADG\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 1,\n        \"temporary_password_generated_at\": \"2026-01-27 14:17:56\",\n        \"created_at\": \"2026-01-27T14:17:56.000000Z\",\n        \"updated_at\": \"2026-01-27T14:17:56.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": null,\n        \"is_active\": false,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null,\n        \"app\": {\n          \"id\": 2,\n          \"app_name\": \"Gold Door\",\n          \"app_description\": \"Applicant Onboarding system\",\n          \"app_url\": null,\n          \"app_password_age\": 20,\n          \"app_session_timeout\": 15,\n          \"app_password_lock_attempts\": 3,\n          \"app_password_history\": 5,\n          \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n          \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n        }\n      }\n    },\n    {\n      \"id\": 2,\n      \"user_id\": 3,\n      \"action\": \"create\",\n      \"data\": null,\n      \"requested_by\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null\n      },\n      \"requested_at\": \"2026-01-27T15:14:15.000000Z\",\n      \"status\": \"pending\",\n      \"reviewed_by\": null,\n      \"reviewed_at\": null,\n      \"review_notes\": null,\n      \"created_at\": \"2026-01-27T14:14:15.000000Z\",\n      \"updated_at\": \"2026-01-27T14:14:15.000000Z\",\n      \"user\": {\n        \"id\": 3,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"aliuadedigba@gmail.com\",\n        \"group\": \"BIG\",\n        \"subsidiary\": \"iQx\",\n        \"division\": \"ADG\",\n        \"email_verified_at\": null,\n        \"must_change_password\": 1,\n        \"temporary_password_generated_at\": \"2026-01-27 14:14:15\",\n        \"created_at\": \"2026-01-27T14:14:15.000000Z\",\n        \"updated_at\": \"2026-01-27T14:14:15.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": null,\n        \"is_active\": false,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null,\n        \"app\": {\n          \"id\": 2,\n          \"app_name\": \"Gold Door\",\n          \"app_description\": \"Applicant Onboarding system\",\n          \"app_url\": null,\n          \"app_password_age\": 20,\n          \"app_session_timeout\": 15,\n          \"app_password_lock_attempts\": 3,\n          \"app_password_history\": 5,\n          \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n          \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n        }\n      }\n    },\n    {\n      \"id\": 1,\n      \"user_id\": 2,\n      \"action\": \"update\",\n      \"data\": {\n        \"firstname\": \"Adegorite\",\n        \"lastname\": \"Adesola\"\n      },\n      \"requested_by\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null\n      },\n      \"requested_at\": \"2026-01-27T15:04:33.000000Z\",\n      \"status\": \"pending\",\n      \"reviewed_by\": null,\n      \"reviewed_at\": null,\n      \"review_notes\": null,\n      \"created_at\": \"2026-01-27T14:04:33.000000Z\",\n      \"updated_at\": \"2026-01-27T14:04:33.000000Z\",\n      \"user\": {\n        \"id\": 2,\n        \"firstname\": \"Aliu\",\n        \"lastname\": \"Adedigba\",\n        \"email\": \"indexcorpng@gmail.com\",\n        \"group\": null,\n        \"subsidiary\": null,\n        \"division\": null,\n        \"email_verified_at\": null,\n        \"must_change_password\": 0,\n        \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n        \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n        \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"app_last_password_changed_at\": null,\n        \"app_failed_login_attempts\": 0,\n        \"app_lockout_until\": null,\n        \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n        \"is_active\": true,\n        \"activated_by\": null,\n        \"activated_at\": null,\n        \"deactivated_by\": null,\n        \"deactivated_at\": null,\n        \"app\": {\n          \"id\": 2,\n          \"app_name\": \"Gold Door\",\n          \"app_description\": \"Applicant Onboarding system\",\n          \"app_url\": null,\n          \"app_password_age\": 20,\n          \"app_session_timeout\": 15,\n          \"app_password_lock_attempts\": 3,\n          \"app_password_history\": 5,\n          \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n          \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n        }\n      }\n    }\n  ],\n  \"message\": \"Pending actions retrieved\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Delete User",
          "method": "DELETE",
          "path": "/api/apps/2/users/89",
          "auth": "bearer",
          "description": "",
          "requestBody": "{\n  \"authoriser_email\": \"faithidebi@gmail.com\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": null,\n  \"message\": \"User deleted successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get Single Pending Action",
          "method": "GET",
          "path": "/api/apps/2/pending-actions/2",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 2,\n    \"user_id\": 3,\n    \"action\": \"create\",\n    \"data\": null,\n    \"requested_by\": {\n      \"id\": 2,\n      \"firstname\": \"Aliu\",\n      \"lastname\": \"Adedigba\",\n      \"email\": \"indexcorpng@gmail.com\",\n      \"group\": null,\n      \"subsidiary\": null,\n      \"division\": null,\n      \"email_verified_at\": null,\n      \"must_change_password\": 0,\n      \"temporary_password_generated_at\": \"2026-01-27 13:56:11\",\n      \"created_at\": \"2026-01-27T13:56:11.000000Z\",\n      \"updated_at\": \"2026-01-27T14:10:36.000000Z\",\n      \"app_last_password_changed_at\": null,\n      \"app_failed_login_attempts\": 0,\n      \"app_lockout_until\": null,\n      \"app_last_activity_at\": \"2026-01-27T14:10:36.000000Z\",\n      \"is_active\": true,\n      \"activated_by\": null,\n      \"activated_at\": null,\n      \"deactivated_by\": null,\n      \"deactivated_at\": null\n    },\n    \"requested_at\": \"2026-01-27T15:14:15.000000Z\",\n    \"status\": \"pending\",\n    \"reviewed_by\": null,\n    \"reviewed_at\": null,\n    \"review_notes\": null,\n    \"created_at\": \"2026-01-27T14:14:15.000000Z\",\n    \"updated_at\": \"2026-01-27T14:14:15.000000Z\",\n    \"user\": {\n      \"id\": 3,\n      \"firstname\": \"Aliu\",\n      \"lastname\": \"Adedigba\",\n      \"email\": \"aliuadedigba@gmail.com\",\n      \"group\": \"BIG\",\n      \"subsidiary\": \"iQx\",\n      \"division\": \"ADG\",\n      \"email_verified_at\": null,\n      \"must_change_password\": 1,\n      \"temporary_password_generated_at\": \"2026-01-27 14:14:15\",\n      \"created_at\": \"2026-01-27T14:14:15.000000Z\",\n      \"updated_at\": \"2026-01-27T14:14:15.000000Z\",\n      \"app_last_password_changed_at\": null,\n      \"app_failed_login_attempts\": 0,\n      \"app_lockout_until\": null,\n      \"app_last_activity_at\": null,\n      \"is_active\": false,\n      \"activated_by\": null,\n      \"activated_at\": null,\n      \"deactivated_by\": null,\n      \"deactivated_at\": null\n    }\n  },\n  \"message\": \"Pending action details\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Approve Pending Action",
          "method": "POST",
          "path": "/api/apps/2/pending-actions/6/approve",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": null,\n  \"message\": \"Action approved successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Deny Pending Approval",
          "method": "POST",
          "path": "/api/apps/2/pending-actions/89/deny",
          "auth": "bearer",
          "description": "",
          "requestBody": "{\n  \"notes\": \"denied\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": null,\n  \"message\": \"Action denied successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Deactivate User",
          "method": "POST",
          "path": "/api/apps/2/users/3/deactivate",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 3,\n    \"firstname\": \"Aliu\",\n    \"lastname\": \"Adedigba\",\n    \"email\": \"aliuadedigba@gmail.com\",\n    \"group\": \"BIG\",\n    \"subsidiary\": \"iQx\",\n    \"division\": \"ADG\",\n    \"email_verified_at\": null,\n    \"must_change_password\": false,\n    \"temporary_password_generated_at\": \"2026-01-27T14:14:15.000000Z\",\n    \"created_at\": \"2026-01-27T14:14:15.000000Z\",\n    \"updated_at\": \"2026-02-02T10:38:22.000000Z\",\n    \"app_last_password_changed_at\": \"2026-02-02 10:36:00\",\n    \"app_failed_login_attempts\": 0,\n    \"app_lockout_until\": null,\n    \"app_last_activity_at\": \"2026-02-02T10:38:22.000000Z\",\n    \"is_active\": true,\n    \"activated_by\": null,\n    \"activated_at\": \"2026-01-27T14:32:44.000000Z\",\n    \"deactivated_by\": null,\n    \"deactivated_at\": null,\n    \"role\": {\n      \"id\": 2,\n      \"app_id\": 2,\n      \"name\": \"Inputter\",\n      \"created_at\": \"2026-01-27T13:53:01.000000Z\",\n      \"updated_at\": \"2026-01-27T13:53:01.000000Z\"\n    },\n    \"app\": {\n      \"id\": 2,\n      \"app_name\": \"Gold Door\",\n      \"app_description\": \"Applicant Onboarding system\",\n      \"app_url\": null,\n      \"app_password_age\": 20,\n      \"app_session_timeout\": 15,\n      \"app_password_lock_attempts\": 3,\n      \"app_password_history\": 5,\n      \"created_at\": \"2026-01-27T13:52:41.000000Z\",\n      \"updated_at\": \"2026-01-27T13:52:41.000000Z\"\n    }\n  },\n  \"message\": \"User deactivated successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Reactivate User",
          "method": "POST",
          "path": "/api/apps/2/users/3/activate",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 422,
            "body": "{\n  \"success\": false,\n  \"data\": null,\n  \"message\": \"User is already active\",\n  \"errors\": []\n}"
          }
        },
        {
          "name": "Get App roles",
          "method": "GET",
          "path": "/api/apps/1/roles/user",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 1,\n      \"app_id\": 1,\n      \"name\": \"AuthoriserAul\",\n      \"created_at\": \"2026-01-22T12:11:16.000000Z\",\n      \"updated_at\": \"2026-01-22T12:11:16.000000Z\"\n    }\n  ],\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        }
      ]
    },
    {
      "key": "audit-logs",
      "name": "Audit Logs",
      "description": "Create and retrieve audit trail entries for application activity.",
      "endpoints": [
        {
          "name": "Create audit log",
          "method": "POST",
          "path": "/api/apps/audit-logs",
          "auth": "basic",
          "description": "",
          "requestBody": "{\r\n    \"action\": \"Hello\",\r\n    \"app_id\": 1,\r\n    \"email\": \"aliu.adedigba2@fmdqgroup.com\"\r\n    \"description\": \"Yess\",\r\n    \"changes\": [\"Yellow\"]\r\n}",
          "response": {
            "code": 201,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"action\": \"Hello\",\n    \"email\": \"aliu.adedigba2@fmdqgroup.com\",\n    \"description\": \"Yess\",\n    \"app_id\": 1,\n    \"ip_address\": \"127.0.0.1\",\n    \"updated_at\": \"2026-02-20T14:28:19.000000Z\",\n    \"created_at\": \"2026-02-20T14:28:19.000000Z\",\n    \"id\": 114\n  },\n  \"message\": \"Audit log created successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get Audit Log",
          "method": "GET",
          "path": "/api/apps/1/audit-logs",
          "auth": "basic",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 5,\n      \"app_id\": \"1\",\n      \"email\": \"unknownemail@user.com\",\n      \"action\": \"app_user_change_initial_password_failed\",\n      \"description\": \"app_user_change_initial_password_failed via API\",\n      \"ip_address\": \"127.0.0.1\",\n      \"details\": {\n        \"reason\": \"not_found\"\n      },\n      \"created_at\": \"2026-01-27T13:57:12.000000Z\",\n      \"updated_at\": \"2026-01-27T13:57:12.000000Z\"\n    },\n    {\n      \"id\": 114,\n      \"app_id\": \"1\",\n      \"email\": \"aliu.adedigba2@fmdqgroup.com\",\n      \"action\": \"Hello\",\n      \"description\": \"Yess\",\n      \"ip_address\": \"127.0.0.1\",\n      \"details\": null,\n      \"created_at\": \"2026-02-20T14:28:19.000000Z\",\n      \"updated_at\": \"2026-02-20T14:28:19.000000Z\"\n    }\n  ],\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        }
      ]
    },
    {
      "key": "admin-app-setup",
      "name": "Admin \u2022 App Setup",
      "description": "Register and manage the legacy applications connected to iAuth SSO.",
      "endpoints": [
        {
          "name": "Create App",
          "method": "POST",
          "path": "/api/apps",
          "auth": "bearer",
          "description": "",
          "requestBody": "{\n  \"app_name\": \"FMDQ Gen X\",\n  \"app_description\": \"Employee management system\",\n  \"app_password_age\": 10,\n  \"app_session_timeout\": 5,\n  \"app_password_lock_attempts\": 3,\n  \"app_password_history\": 10\n}",
          "response": {
            "code": 201,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"app_name\": \"New Dashboard\",\n    \"app_password_age\": 60,\n    \"app_session_timeout\": 15,\n    \"app_password_lock_attempts\": 5,\n    \"app_password_history\": 10,\n    \"updated_at\": \"2026-01-22T12:07:24.000000Z\",\n    \"created_at\": \"2026-01-22T12:07:24.000000Z\",\n    \"id\": 1\n  },\n  \"message\": \"Project created successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get All Apps",
          "method": "GET",
          "path": "/api/apps",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 1,\n      \"app_name\": \"New Dashboard\",\n      \"app_description\": null,\n      \"app_url\": null,\n      \"app_password_age\": 60,\n      \"app_session_timeout\": 15,\n      \"app_password_lock_attempts\": 5,\n      \"app_password_history\": 10,\n      \"created_at\": \"2026-01-22T12:07:24.000000Z\",\n      \"updated_at\": \"2026-01-22T12:07:24.000000Z\"\n    }\n  ],\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get Single App",
          "method": "GET",
          "path": "/api/apps/7",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 1,\n    \"app_name\": \"New Dashboard\",\n    \"app_description\": null,\n    \"app_url\": null,\n    \"app_password_age\": 60,\n    \"app_session_timeout\": 15,\n    \"app_password_lock_attempts\": 5,\n    \"app_password_history\": 10,\n    \"created_at\": \"2026-01-22T12:07:24.000000Z\",\n    \"updated_at\": \"2026-01-22T12:07:24.000000Z\"\n  },\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        }
      ]
    },
    {
      "key": "admin-auth",
      "name": "Admin \u2022 Admin Auth",
      "description": "Authenticate as a platform administrator and register new admin accounts.",
      "endpoints": [
        {
          "name": "Admin Login",
          "method": "POST",
          "path": "/api/admin/login",
          "auth": "basic",
          "description": "",
          "requestBody": "{\n  \"email\": \"faith@68abbnej.mailosaur.net\",\n  \"password\": \"secret123\"\n}",
          "response": null
        },
        {
          "name": "Admin Registration",
          "method": "POST",
          "path": "/api/admin/register",
          "auth": "basic",
          "description": "",
          "requestBody": "{\n  \"firstname\": \" Aliu\",\n  \"lastname\": \"Adedigba\",\n  \"email\": \"ali.adedigba@gmail.com\",\n  \"password\": \"secret123\",\n  \"password_confirmation\": \"secret123\"\n}",
          "response": {
            "code": 201,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"token\": \"1|WoNu50jlvZKQdEVrxXxWC1yfZBtMIemoF3x2XL1td1f0be91\"\n  },\n  \"message\": \"Admin registered successfully\",\n  \"errors\": null\n}"
          }
        }
      ]
    },
    {
      "key": "admin-roles",
      "name": "Admin \u2022 Roles Mgt",
      "description": "Manage the roles available to end users within an application.",
      "endpoints": [
        {
          "name": "Create Roles",
          "method": "GET",
          "path": "/api/apps/2/roles",
          "auth": "bearer",
          "description": "",
          "requestBody": "{\n  \"name\": \"Authoriser\"\n}",
          "response": {
            "code": 201,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"name\": \"AuthoriserAul\",\n    \"app_id\": \"1\",\n    \"updated_at\": \"2026-01-22T12:11:16.000000Z\",\n    \"created_at\": \"2026-01-22T12:11:16.000000Z\",\n    \"id\": 1\n  },\n  \"message\": \"Role created successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get App roles",
          "method": "GET",
          "path": "/api/apps/1/roles",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 1,\n      \"app_id\": 1,\n      \"name\": \"AuthoriserAul\",\n      \"created_at\": \"2026-01-22T12:11:16.000000Z\",\n      \"updated_at\": \"2026-01-22T12:11:16.000000Z\"\n    }\n  ],\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Get a single role",
          "method": "GET",
          "path": "/api/roles/1",
          "auth": "bearer",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 1,\n    \"app_id\": 1,\n    \"name\": \"AuthoriserAul\",\n    \"created_at\": \"2026-01-22T12:11:16.000000Z\",\n    \"updated_at\": \"2026-01-22T12:11:16.000000Z\"\n  },\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        }
      ]
    },
    {
      "key": "groups",
      "name": "Groups",
      "description": "Manage organizational groups scoped to an application.",
      "endpoints": [
        {
          "name": "List all groups",
          "method": "GET",
          "path": "/api/apps/{{appId}}/groups",
          "auth": "basic",
          "description": "List all groups for the specified application",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 1,\n      \"app_id\": 1,\n      \"name\": \"Corporate Banking\",\n      \"description\": \"Group handling corporate clients and large transactions\",\n      \"created_at\": \"2026-03-09T14:00:33.000000Z\",\n      \"updated_at\": \"2026-03-09T14:00:33.000000Z\"\n    },\n    {\n      \"id\": 3,\n      \"app_id\": 1,\n      \"name\": \"Corporate Banking.\",\n      \"description\": \"Group handling corporate clients and large transactions\",\n      \"created_at\": \"2026-03-09T14:04:30.000000Z\",\n      \"updated_at\": \"2026-03-09T14:04:30.000000Z\"\n    }\n  ],\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Create new group",
          "method": "POST",
          "path": "/api/apps/{{appId}}/groups",
          "auth": "basic",
          "description": "Create a new group (name should be unique per app)",
          "requestBody": "{\n  \"name\": \"Corporate Banking.\",\n  \"description\": \"Group handling corporate clients and large transactions\"\n}",
          "response": {
            "code": 201,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"app_id\": 1,\n    \"name\": \"Corporate Banking.\",\n    \"description\": \"Group handling corporate clients and large transactions\",\n    \"updated_at\": \"2026-03-09T14:04:30.000000Z\",\n    \"created_at\": \"2026-03-09T14:04:30.000000Z\",\n    \"id\": 3\n  },\n  \"message\": \"Group created\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Show single group",
          "method": "GET",
          "path": "/api/apps/{{appId}}/groups/{{groupId}}",
          "auth": "basic",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"id\": 1,\n    \"app_id\": 1,\n    \"name\": \"Corporate Banking\",\n    \"description\": \"Group handling corporate clients and large transactions\",\n    \"created_at\": \"2026-03-09T14:00:33.000000Z\",\n    \"updated_at\": \"2026-03-09T14:00:33.000000Z\"\n  },\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Update group",
          "method": "PUT",
          "path": "/api/apps/{{appId}}/groups/{{groupId}}",
          "auth": "inherit",
          "description": "",
          "requestBody": "{\n  \"name\": \"Corporate Banking & Finance\",\n  \"description\": \"Updated - now includes finance operations\"\n}",
          "response": null
        },
        {
          "name": "Delete group",
          "method": "DELETE",
          "path": "/api/apps/{{appId}}/groups/{{groupId}}",
          "auth": "inherit",
          "description": "Will fail if users are still assigned to this group (depending on your implementation)",
          "requestBody": null,
          "response": null
        }
      ]
    },
    {
      "key": "subsidiaries",
      "name": "Subsidiaries",
      "description": "Manage subsidiary records scoped to an application.",
      "endpoints": [
        {
          "name": "List all subsidiaries",
          "method": "GET",
          "path": "/api/apps/{{appId}}/subsidiaries",
          "auth": "basic",
          "description": "",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": [\n    {\n      \"id\": 1,\n      \"app_id\": 1,\n      \"name\": \"FMDQ Securities Limited\",\n      \"code\": \"FMDQ-SEC\",\n      \"description\": \"Brokerage and dealing subsidiary\",\n      \"created_at\": \"2026-03-09T14:21:20.000000Z\",\n      \"updated_at\": \"2026-03-09T14:21:20.000000Z\"\n    },\n    {\n      \"id\": 2,\n      \"app_id\": 1,\n      \"name\": \"FMDQ Securities Limited.\",\n      \"code\": \"FMDQ-SEC.\",\n      \"description\": \"Brokerage and dealing subsidiary\",\n      \"created_at\": \"2026-03-09T14:22:29.000000Z\",\n      \"updated_at\": \"2026-03-09T14:22:29.000000Z\"\n    }\n  ],\n  \"message\": \"Success\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Create new subsidiary",
          "method": "POST",
          "path": "/api/apps/{{appId}}/subsidiaries",
          "auth": "basic",
          "description": "",
          "requestBody": "{\n  \"name\": \"FMDQ Securities Limited.\",\n  \"description\": \"Brokerage and dealing subsidiary\",\n  \"code\": \"FMDQ-SEC.\"\n}",
          "response": {
            "code": 201,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"name\": \"FMDQ Securities Limited.\",\n    \"description\": \"Brokerage and dealing subsidiary\",\n    \"code\": \"FMDQ-SEC.\",\n    \"app_id\": 1,\n    \"updated_at\": \"2026-03-09T14:22:29.000000Z\",\n    \"created_at\": \"2026-03-09T14:22:29.000000Z\",\n    \"id\": 2\n  },\n  \"message\": \"Subsidiary created successfully\",\n  \"errors\": null\n}"
          }
        },
        {
          "name": "Show single subsidiary",
          "method": "GET",
          "path": "/api/apps/{{appId}}/subsidiaries/{{subsidiaryId}}",
          "auth": "inherit",
          "description": "",
          "requestBody": null,
          "response": null
        },
        {
          "name": "Update subsidiary",
          "method": "PUT",
          "path": "/api/apps/{{appId}}/subsidiaries/{{subsidiaryId}}",
          "auth": "inherit",
          "description": "",
          "requestBody": "{\n  \"name\": \"FMDQ Securities Ltd\",\n  \"description\": \"Updated name and description\",\n  \"code\": \"FMDQ-SEC-01\"\n}",
          "response": null
        },
        {
          "name": "Delete subsidiary",
          "method": "DELETE",
          "path": "/api/apps/{{appId}}/subsidiaries/{{subsidiaryId}}",
          "auth": "inherit",
          "description": "",
          "requestBody": null,
          "response": null
        }
      ]
    },
    {
      "key": "payment-integration",
      "name": "Payment Integration",
      "baseUrl": PAY_OTP_BASE,
      "description": "Redirect customers to active payment gateways (Paystack / Flutterwave) and process transactions.",
      "endpoints": [
        {
          "name": "Initiate Payment",
          "method": "POST",
          "path": "/payment/initiate",
          "auth": "custom",
          "description": "Submit transaction details from your application backend to generate a unique checkout URL.",
          "requestBody": "{\n  \"appID\": \"30\",\n  \"amount\": 5000,\n  \"currency\": \"NGN\",\n  \"email\": \"customer@example.com\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Doe\",\n  \"phone\": \"+2348012345678\",\n  \"company\": \"FMDQ Group\",\n  \"callback_url\": \"http://localhost/fmrr_test/payment/callback\",\n  \"metadata\": {\n    \"subscription_id\": \"SUB_9902\"\n  }\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"status\": \"success\",\n  \"message\": \"Transaction initialized. Redirect user to checkout_url.\",\n  \"data\": {\n    \"checkout_url\": \"http://localhost/qpay/checkout/PAY-73829102\",\n    \"reference\": \"PAY-73829102\",\n    \"invoice_url\": \"http://localhost/qpay/invoices/invoice-PAY-73829102.pdf\"\n  }\n}"
          }
        },
        {
          "name": "Verify Payment",
          "method": "GET",
          "path": "/payment/verify/PAY-73829102",
          "auth": "custom",
          "description": "Verify payment transaction status using the reference returned during initiation or callback.",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"status\": \"success\",\n  \"message\": \"Transaction verified.\",\n  \"data\": {\n    \"reference\": \"PAY-73829102\",\n    \"amount\": \"5000.00\",\n    \"status\": \"successful\",\n    \"customer_email\": \"customer@example.com\",\n    \"invoice_url\": \"http://localhost/qpay/invoices/invoice-PAY-73829102.pdf\",\n    \"receipt_url\": \"http://localhost/qpay/receipts/receipt-PAY-73829102.pdf\"\n  }\n}"
          }
        },
        {
          "name": "Download Invoice PDF",
          "method": "GET",
          "path": "/payment/invoice/PAY-73829102",
          "auth": "noauth",
          "description": "Stream or download the official Payment Invoice PDF generated during initiation.",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"status\": \"success\",\n  \"data\": {\n    \"reference\": \"PAY-73829102\",\n    \"invoice_url\": \"http://localhost/qpay/invoices/invoice-PAY-73829102.pdf\"\n  }\n}"
          }
        },
        {
          "name": "Download Receipt PDF",
          "method": "GET",
          "path": "/payment/receipt/PAY-73829102",
          "auth": "noauth",
          "description": "Stream or download the official Payment Receipt PDF for confirmed successful transactions.",
          "requestBody": null,
          "response": {
            "code": 200,
            "body": "{\n  \"status\": \"success\",\n  \"data\": {\n    \"reference\": \"PAY-73829102\",\n    \"receipt_url\": \"http://localhost/qpay/receipts/receipt-PAY-73829102.pdf\"\n  }\n}"
          }
        }
      ]
    },
    {
      "key": "otp-integration",
      "name": "OTP Integration",
      "baseUrl": `${PAY_OTP_BASE}/master`,
      "description": "Generate, deliver, and validate single-use verification codes.",
      "endpoints": [
        {
          "name": "Generate & Deliver OTP",
          "method": "POST",
          "path": "/generator",
          "auth": "custom",
          "description": "Generates a single-use verification code and sends it via email to the recipient.",
          "requestBody": "{\n  \"appID\": \"30\",\n  \"username\": \"fmrr_app_user\",\n  \"email\": \"user@example.com\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"reference\": \"REF_990182\"\n  },\n  \"message\": \"OTP generated and sent successfully\"\n}"
          }
        },
        {
          "name": "Validate OTP Code",
          "method": "POST",
          "path": "/validator",
          "auth": "custom",
          "description": "Verify a user-submitted OTP code against the transaction reference.",
          "requestBody": "{\n  \"appID\": \"30\",\n  \"otp_code\": \"482910\",\n  \"reference\": \"REF_990182\"\n}",
          "response": {
            "code": 200,
            "body": "{\n  \"success\": true,\n  \"data\": {\n    \"status\": \"success\"\n  },\n  \"message\": \"OTP verified successfully\"\n}"
          }
        }
      ]
    }
  ]
}

