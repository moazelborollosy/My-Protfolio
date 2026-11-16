locals {
  prefix         = "${var.project}-${var.environment}"
  s3_bucket_name = var.bucket_name != "" ? var.bucket_name : "${local.prefix}-frontend"
  origin_id      = "S3-${local.s3_bucket_name}"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  mime_types = {
    "html"  = "text/html"
    "css"   = "text/css"
    "js"    = "application/javascript"
    "json"  = "application/json"
    "png"   = "image/png"
    "jpg"   = "image/jpeg"
    "jpeg"  = "image/jpeg"
    "svg"   = "image/svg+xml"
    "ico"   = "image/x-icon"
    "webp"  = "image/webp"
    "pdf"   = "application/pdf"
    "woff"  = "font/woff"
    "woff2" = "font/woff2"
    "ttf"   = "font/ttf"
  }

  route53_zone_id = var.route53_zone_id != "" ? var.route53_zone_id : (var.create_route53_record ? data.aws_route53_zone.parent[0].zone_id : "")
}

# ==============================================================================
# S3 BUCKET FOR STATIC WEBSITE CONTENT
# ==============================================================================

resource "aws_s3_bucket" "website" {
  bucket        = local.s3_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ==============================================================================
# AUTOMATED STATIC ASSET POPULATION FROM FRONTEND DIST BUILD
# ==============================================================================

resource "aws_s3_object" "frontend_assets" {
  for_each = fileset("${path.module}/../front-end/dist", "**/*")

  bucket       = aws_s3_bucket.website.id
  key          = each.value
  source       = "${path.module}/../front-end/dist/${each.value}"
  etag         = filemd5("${path.module}/../front-end/dist/${each.value}")
  content_type = lookup(local.mime_types, regexall("\\.([^.]+)$", each.value)[0][0], "application/octet-stream")
}

# ==============================================================================
# CLOUDFRONT ORIGIN ACCESS CONTROL (OAC)
# ==============================================================================

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${local.prefix}-oac"
  description                       = "OAC for ${var.domain_name} static web assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ==============================================================================
# S3 BUCKET POLICY FOR CLOUDFRONT ACCESS ONLY
# ==============================================================================

data "aws_iam_policy_document" "s3_oac_policy" {
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.website.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.website.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "website" {
  bucket     = aws_s3_bucket.website.id
  policy     = data.aws_iam_policy_document.s3_oac_policy.json
  depends_on = [aws_s3_bucket_public_access_block.website]
}

# ==============================================================================
# CLOUDFRONT DISTRIBUTION
# ==============================================================================

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for ${var.domain_name} (${var.environment})"
  default_root_object = "index.html"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_100"

  # Origin: S3 Bucket for Static SPA Content
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = local.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.origin_id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # SPA Routing Support: Fallback 403 & 404 errors to index.html with HTTP 200
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# ==============================================================================
# ROUTE 53 ALIAS RECORDS FOR SUBDOMAIN
# ==============================================================================

data "aws_route53_zone" "parent" {
  count        = (var.create_route53_record && var.route53_zone_id == "") ? 1 : 0
  name         = var.parent_domain_name
  private_zone = false
}

resource "aws_route53_record" "website_a" {
  count   = var.create_route53_record ? 1 : 0
  zone_id = local.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "website_aaaa" {
  count   = var.create_route53_record ? 1 : 0
  zone_id = local.route53_zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
