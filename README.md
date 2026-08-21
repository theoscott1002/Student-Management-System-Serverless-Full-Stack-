# Student-Management-System-Serverless-Full-Stack-
> Built a full-stack serverless application using AWS Lambda, API Gateway, DynamoDB, and React, deployed via S3 and CloudFront.

📘 PROJECT DOCUMENTATION

🧑‍🎓 Student Management System (Serverless Full Stack)

🧾 1. Project Overview

This project is a full-stack serverless Student Management System built using:

React (Frontend)

AWS API Gateway (Routing)

AWS Lambda (Backend logic)

DynamoDB (Database)

S3 + CloudFront (Frontend hosting & CDN)

It supports full CRUD operations:

Create → Read → Update → Delete students

🏗️ 2. Architecture
```
User (Browser)
     ↓
CloudFront (CDN)
     ↓
S3 (React Build)
     ↓
API Gateway
     ↓
Lambda Functions
     ↓
DynamoDB

```

⚙️ 3. Backend Setup (AWS)

#########----------3.1 DynamoDB Table-----------#######

Table Name: Students

Partition Key: studentId (String)

<--------------------Steps: Create a DynamoDB Table---------------->

Go to:

AWS Console → DynamoDB → Create table

Use:

Table name:
Students

Partition key:
studentId

Type:
String

Leave everything else as the default.

Click:
Create table

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e340a33c-c551-4b15-be44-52dcb4194011" />



######--------3.2 Lambda Functions-------########

Create the following functions:

| Function       | Purpose              |
| -------------- | -------------------- |
| createStudent  | Add new student      |
| getStudents    | Fetch all students   |
| getStudentById | Fetch single student |
| updateStudent  | Update student       |
| deleteStudent  | Delete student       |
  
<------------Creating the First Lambda Function------------->

Step 1: Open Lambda

Go to:

AWS Console → Lambda → Create function

Choose:

Author from scratch

Function name: createStudent

Runtime: Python 3.13 (or the latest available Python version)

Architecture: x86_64 (default)

For Permissions:

Leave Create a new role with basic Lambda permissions selected.

Click Create function.

Step 2: Connect Lambda to DynamoDB

Right now your Lambda cannot access DynamoDB. Let’s fix that.

1️⃣ Add Permissions

Go to:

Lambda → createStudent → Configuration → Permissions

Click the Execution role (it will open IAM).

Then:

Click Add permissions → Attach policies

Search for:
AmazonDynamoDBFullAccess

Attach it

✅ Done.


Step 4: Write Code to Insert a Student

Go back to your Lambda code and replace it with:
```
import json

import boto3

import uuid

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('Students')

def lambda_handler(event, context):

    body = json.loads(event.get("body", "{}"))

    student = {
        "studentId": str(uuid.uuid4()),
        "name": body.get("name"),
        "department": body.get("department"),
        "level": body.get("level"),
        "email": body.get("email")
    }

    table.put_item(Item=student)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Student created",
            "student": student
        })
    }
```
Click Deploy.



  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ef2b4405-110a-4a4d-a576-3545bac330e2" />
    

 #######----------3.3 API Gateway-----------##########

Routes configured:

POST    /students

GET     /students

GET     /students/{id}

PUT     /students/{id}

DELETE  /students/{id}

<-----------------------Steps: Create API Gateway-------------------->

1️⃣ Go to API Gateway

AWS Console → API Gateway

Click Create API

Choose:
HTTP API (NOT REST API)

Click Build

2️⃣ Configure API

Basic settings:
API name: student-api

Click Next

3️⃣ Add Integration (VERY IMPORTANT)

Click Add integration

Choose:
Lambda

Select your function:
createStudent

Click Next

4️⃣ Define Route

Set:

Method: POST

Path: /students

Click Next

5️⃣ Stage

Stage name:
dev

Click Next → Create

Step 7: Get Your API URL

After creation, you’ll see something like:

(https://htjhdxy1f2.execute-api.us-east-1.amazonaws.com/dev)

Your full endpoint becomes:

https://abc123.execute-api.us-east-1.amazonaws.com/students

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1b57efa5-ba0b-4bda-ac0f-e1b50f31a7b4" />

<--------Steps:Add GET /students (Read Data)-------->

Step 1: Create New Lambda Function

Go to:

Lambda → Create function

Name: getStudents

Runtime: Python (same as before)

Create function

Step 2: Add DynamoDB Permission

Same as before:

Go to Configuration → Permissions

Open role

Attach:
AmazonDynamoDBFullAccess

Step 3: Add Code

Replace code with:
```
import json

import boto3

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('Students')

def lambda_handler(event, context):

    response = table.scan()

    return {
        "statusCode": 200,
        "body": json.dumps(response['Items'])
    }
```
Click Deploy

Step 5: Connect to API Gateway

Go to:

API Gateway → your API → Routes → Create

Set:

Method: GET

Path: /students

Then:

Attach integration → select getStudents

<-------------Steps:GET /students/{id} (Fetch One Student)----------->

Step 1: Create Lambda

Create new function:

Name: getStudentById

Runtime: Python

Step2: Add Code
```
import json

import boto3

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('Students')

def lambda_handler(event, context):

    student_id = event['pathParameters']['id']

    response = table.get_item(
        Key={
            'studentId': student_id
        }
    )

    if 'Item' in response:
        return {
            "statusCode": 200,
            "body": json.dumps(response['Item'])
        }
    else:
        return {
            "statusCode": 404,
            "body": json.dumps({"message": "Student not found"})
        }
```
👉 Click Deploy

Step 3: Add Route in API Gateway

Go to:

Routes → Create

Set:

Method: GET

Path: /students/{id}

Step 4: Attach Integration

Click route

Click Attach integration

Select: getStudentById

It automatically deploys.

<-----------Steps:PUT /students/{id} (Update Student)--------------->

Step 1: Create Lambda

Name: updateStudent

Runtime: Python
```
import json

import boto3

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('Students')

def lambda_handler(event, context):

    student_id = event['pathParameters']['id']
    body = json.loads(event['body'])

    response = table.update_item(
        Key={'studentId': student_id},
        UpdateExpression="""
            SET #n = :name,
                department = :dept,
                #lvl = :level,
                email = :email
        """,
        ExpressionAttributeNames={
            '#n': 'name',
            '#lvl': 'level'
        },
        ExpressionAttributeValues={
            ':name': body['name'],
            ':dept': body['department'],
            ':level': body['level'],
            ':email': body['email']
        },
        ReturnValues="ALL_NEW"
    )

    return {
        "statusCode": 200,
        "body": json.dumps(response['Attributes'])
    }
```
Deploy

Step 3: API Gateway

Create route:

Method: PUT

Path: /students/{id}

Attach → updateStudent

<------------steps:DELETE /students/{id}---------->

Name: deleteStudent
```
import json

import boto3

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('Students')

def lambda_handler(event, context):

    student_id = event['pathParameters']['id']

    table.delete_item(
        Key={'studentId': student_id}
    )

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Student deleted"})
    }
```
Deploy

Step 3: API Gateway

Method: DELETE

Path: /students/{id}

Attach → deleteStudent
  
#########-------------3.4 Postman Testing----------------#######

Test all endpoints successfully.

Step 8: Test with Postman (or curl)

POST request

URL:

https://your-api-id.execute-api.region.amazonaws.com/students

Body (JSON):
```
{
  "name": "Jane Doe",
  "department": "Computer Science",
  "level": "300",
  "email": "jane@example.com"
}
```
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b7e53514-50bc-40c7-b62c-9890b3a7db02" />

🎨 4. Frontend Setup (React)

######--------4.1 Features--------######

Create student

View all students

Edit student

Delete student

######--------4.2 Project Structure--------#########
```
src/

 ├── components/
 
 │   ├── StudentForm.js
 
 │   ├── StudentTable.js
 
 ├── App.js
 
 ├── App.css
 
 ├── index.js
 ```
#######-------4.3 API Integration-----------######

Example:

fetch("https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/students")

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1bbb26c2-9814-408f-83ab-e1f40c213463" />


☁️ 5. Deployment (S3 + CloudFront)

####----------5.1 Build React App-------------####

npm run build

####----------5.2 S3 Setup-------------------#####

Created bucket: student-frontend-theo

Enabled static website hosting

Uploaded build files

Added public bucket policy

<---------------Steps: Create S3 Bucket----------------->

Go to S3 → Create bucket

Settings:

Bucket name: student-frontend-theo (must be unique)

Region: same (us-east-1)

Uncheck “Block all public access”

Acknowledge warning

👉 Create bucket

✅ Step 3: Enable Static Hosting

Inside your bucket:

Go to Properties

Scroll → Static website hosting

Enable

Set:

Index document: index.html

Error document: index.html

👉 Save

✅ Step 4: Upload Build Files

Open bucket → Upload

Upload everything inside /build folder (not the folder itself)

✅ Step 5: Set Bucket Policy (IMPORTANT)

Go to Permissions → Bucket policy

Paste this (replace bucket name):
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::student-frontend-theo/*"
    }
  ]
}
```
👉 Save

🧪 Test S3 URL

Go to:

Properties → Static website hosting → URL

👉 Open it

You should see your app (may look basic)

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c79facff-efc2-44c5-adac-14ed16b4bacf" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1f26f42e-8d03-4baf-b416-d80e0916e1e6" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/aff0df26-20c4-45dc-82f0-636c7d267f3b" />

####----------------5.3 CloudFront Setup-----------------#####

Created distribution

Origin: S3 bucket (website endpoint)

Enabled HTTPS

Set default root object: index.html

<-------------------Steps: Create CloudFront Distribution-------------->

Go to CloudFront → Create distribution

Origin Settings:

Origin domain → select your S3 bucket

Use S3 website endpoint (important ⚠️)

Default Settings:

Viewer protocol policy:
Redirect HTTP to HTTPS

Default root object:
index.html

👉 Create distribution

⏳ Wait (5–10 mins)

Status → Deployed

🌍 Step 7: Access Your App

Copy:

https://<cloudfront-domain>.cloudfront.net

👉 Open it

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2aeeb7ab-276c-4e46-9fd3-dc7cc503c044" />

5.4 Live Application
d1copb8rx9680f.cloudfront.net

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3ed83efe-1f70-4ae8-9079-0f05d448688d" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6f1be976-8f4a-4b1e-9698-32ac35aa4711" />

🔐 6. CORS Configuration

Enabled in API Gateway:

Access-Control-Allow-Origin: *

Access-Control-Allow-Methods: GET,POST,PUT,DELETE

🧪 7. How to Run Locally

git clone <repo-url>

cd student-management-frontend

npm install

npm start










