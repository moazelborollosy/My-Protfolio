variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

variable "aws_profile" {
  type        = string
  description = "AWS profile to use"
  default     = "aws-aaelborollosy"
}

variable "project" {
  type        = string
  description = "Project name tag"
  default     = "moaz-website"
}

variable "environment" {
  type        = string
  description = "Deployment environment name (e.g. prod, dev, v1)"
  default     = "prod"
}

variable "domain_name" {
  type        = string
  description = "Custom domain name for the website."
  default     = "moaz.elborollosy.com"
}

variable "parent_domain_name" {
  type        = string
  description = "Parent Route 53 Hosted Zone domain name (e.g. elborollosy.com)."
  default     = "elborollosy.com"
}

variable "acm_certificate_arn" {
  type        = string
  description = "ARN of existing ACM certificate in us-east-1 covering domain_name."
}

variable "create_route53_record" {
  type        = bool
  description = "Whether to automatically create Route 53 Alias A and AAAA records for the subdomain."
  default     = true
}

variable "route53_zone_id" {
  type        = string
  description = "Optional override for Route 53 Hosted Zone ID. If left blank, it will be dynamically fetched using parent_domain_name."
  default     = ""
}

variable "bucket_name" {
  type        = string
  description = "Optional override for S3 bucket name."
  default     = ""
}
