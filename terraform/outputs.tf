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
  description = "Public URL of the website (custom domain in prod, CloudFront domain in staging)."
  value       = local.use_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "application_resource_group_arn" {
  description = "ARN of the AWS Resource Group filtering by Application tag."
  value       = aws_resourcegroups_group.application.arn
}

output "environment_resource_group_arn" {
  description = "ARN of the AWS Resource Group filtering by Environment tag."
  value       = aws_resourcegroups_group.environment.arn
}

output "app_environment_resource_group_arn" {
  description = "ARN of the AWS Resource Group filtering by both Application AND Environment tags."
  value       = aws_resourcegroups_group.app_environment.arn
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB single-table storing portfolio content."
  value       = aws_dynamodb_table.portfolio.name
}

output "api_gateway_endpoint" {
  description = "HTTP API Gateway v2 endpoint URL."
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID for the Admin Portal."
  value       = aws_cognito_user_pool.admin.id
}

output "cognito_client_id" {
  description = "Cognito App Client ID for the Admin Portal."
  value       = aws_cognito_user_pool_client.admin.id
}
