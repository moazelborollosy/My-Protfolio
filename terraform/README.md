# Terraform Infrastructure (AWS S3 + CloudFront SPA Deployment)

This directory contains the Infrastructure as Code (IaC) configuration for deploying the frontend React SPA to AWS S3 and Amazon CloudFront for `moaz.elborollosy.com`.

## Architecture Overview
* **Amazon S3**: Private bucket hosting the static site build files (`index.html`, JavaScript, CSS, assets).
* **Amazon CloudFront**: Global Edge CDN with SSL/TLS termination using your existing ACM certificate.
* **Origin Access Control (OAC)**: Enforces private S3 bucket access solely via CloudFront.
* **SPA Routing**: Handles client-side React Router navigation by converting HTTP 403/404 origin errors to `/index.html` with HTTP 200.
* **Route 53 (Optional)**: Creates alias A and AAAA DNS records if a hosted zone ID is provided.

## Files
* `providers.tf`: Provider setup and default AWS tagging.
* `variables.tf`: Input variable definitions.
* `main.tf`: S3 bucket, CloudFront OAC, CloudFront distribution, S3 policy, and Route 53 records.
* `outputs.tf`: Exported deployment endpoints and IDs.
* `terraform.tfvars.example`: Configuration template for your local variables.

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
