output "s3_bucket_name" {
  description = "Name of the created S3 bucket hosting the static website."
  value       = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution."
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Default CloudFront domain name (e.g. d111111abcdef8.cloudfront.net)."
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "Public URL of the custom domain website."
  value       = "https://${var.domain_name}"
}
