# Terraform Infrastructure (AWS S3 + CloudFront + DynamoDB + Cognito + API Gateway v2)

This directory contains the Infrastructure as Code (IaC) configuration for deploying the React SPA, Dynamic Portfolio CMS, and Edge-Cached CV PDF workflow for `moaz.elborollosy.com`.

## Architecture Overview
* **Amazon S3**: Private bucket hosting the static site build files (`index.html`, JS, CSS) and versioned CV PDFs (`/assets/Moaz-Elborollosy-CV.pdf` and `/assets/cv-history/*`).
* **Amazon CloudFront**:
  * `/` & `/assets/*`: Edge-cached static SPA & CV PDFs.
  * `/api/portfolio`: Long-term edge-cached (`max-age=31536000`) public portfolio read endpoint.
  * `/api/admin/*`: Uncached admin endpoints forwarding the `Authorization` header to API Gateway v2.
* **Amazon DynamoDB**: Single-table (`pk`, `sk`) storing the `PROFILE#CONFIG` singleton and `ULID`-keyed collection items (`PROJECT`, `SKILL_GROUP`, `EDUCATION`, `ACHIEVEMENT`, `INTEREST`) ordered by `displayOrder`.
* **Amazon Cognito**: Invite-only User Pool (`allow_admin_create_user_only = true`) for Admin authentication.
* **Amazon API Gateway v2 (HTTP API)**: Validates Cognito JWT tokens natively at the API Gateway layer without a Lambda authorizer.
* **AWS Lambda (Python 3.13 on `arm64` Graviton2)**:
  * `portfolio-read`: Strict read-only IAM role serving `GET /api/portfolio`.
  * `portfolio-admin`: Read/write IAM role serving `/api/admin/*` (item CRUD, reordering, CV PDF staging/archiving, and unified CloudFront invalidation on "Update").

## Files
* `providers.tf`: AWS & Archive providers.
* `variables.tf`: Input variable definitions (including optional `admin_email`).
* `main.tf`: S3 bucket, CloudFront OAC, CloudFront distribution with `/api/portfolio` and `/api/admin/*` cache behaviors, and Route 53 records.
* `dynamodb.tf`: DynamoDB single-table definition and initial portfolio seed items.
* `cognito.tf`: Cognito User Pool, SPA App Client, and optional initial admin user.
* `lambda.tf`: `portfolio-read` and `portfolio-admin` Python 3.13 `arm64` functions and least-privilege IAM roles.
* `apigateway.tf`: HTTP API Gateway v2, native Cognito JWT Authorizer, and routes.
* `outputs.tf`: Exported deployment endpoints, DynamoDB table name, and Cognito IDs.

## Deployment Instructions

### 1. Configure Variables
Copy the template file to `terraform.tfvars`:
```bash
cp terraform.tfvars.example terraform.tfvars
```
Edit `terraform.tfvars` and set `acm_certificate_arn` to your existing ACM Certificate ARN (must be in `us-east-1`).

### 2. Initialize and Validate
```bash
terraform init
terraform validate
```

### 3. Plan and Apply
```bash
terraform plan
terraform apply
```

### 4. Deploy Frontend Assets
After building the frontend (`npm run build` in `/front-end`), Terraform automatically uploads the files in `../front-end/dist/` on `terraform apply`, or you can manually sync the build output to the created S3 bucket:
```bash
aws s3 sync ../front-end/dist/ s3://$(terraform output -raw s3_bucket_name) --delete
```
Optionally invalidate the CloudFront cache:
```bash
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths "/*"
```
