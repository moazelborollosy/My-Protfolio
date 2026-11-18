# ==============================================================================
# LAMBDA 1: PUBLIC READ (portfolio-read) - STRICT READ-ONLY IAM ROLE
# ==============================================================================

data "archive_file" "portfolio_read_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/portfolio_read"
  output_path = "${path.module}/portfolio_read.zip"
}

resource "aws_iam_role" "portfolio_read" {
  name = "${local.prefix}-portfolio-read-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-portfolio-read-role"
  })
}

resource "aws_iam_role_policy" "portfolio_read" {
  name = "${local.prefix}-portfolio-read-policy"
  role = aws_iam_role.portfolio_read.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Sid    = "AllowDynamoDBReadOnly"
        Effect = "Allow"
        Action = [
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetItem"
        ]
        Resource = [
          aws_dynamodb_table.portfolio.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "portfolio_read" {
  function_name    = "${local.prefix}-portfolio-read"
  role             = aws_iam_role.portfolio_read.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.13"
  architectures    = ["arm64"]
  filename         = data.archive_file.portfolio_read_zip.output_path
  source_code_hash = data.archive_file.portfolio_read_zip.output_base64sha256
  timeout          = 10
  memory_size      = 256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.portfolio.name
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-portfolio-read"
  })
}

resource "aws_cloudwatch_log_group" "portfolio_read" {
  name              = "/aws/lambda/${aws_lambda_function.portfolio_read.function_name}"
  retention_in_days = 14

  tags = merge(local.common_tags, {
    Name = "/aws/lambda/${aws_lambda_function.portfolio_read.function_name}"
  })
}

# ==============================================================================
# LAMBDA 2: ADMIN WRITE & PUBLISH (portfolio-admin)
# ==============================================================================

data "archive_file" "portfolio_admin_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/portfolio_admin"
  output_path = "${path.module}/portfolio_admin.zip"
}

resource "aws_iam_role" "portfolio_admin" {
  name = "${local.prefix}-portfolio-admin-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-portfolio-admin-role"
  })
}

resource "aws_iam_role_policy" "portfolio_admin" {
  name = "${local.prefix}-portfolio-admin-policy"
  role = aws_iam_role.portfolio_admin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Sid    = "AllowDynamoDBReadWrite"
        Effect = "Allow"
        Action = [
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.portfolio.arn
        ]
      },
      {
        Sid    = "AllowS3CvVersioningAndUpload"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectTagging",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.website.arn}/assets/Moaz-Elborollosy-CV.pdf",
          "${aws_s3_bucket.website.arn}/assets/cv-staged/*",
          "${aws_s3_bucket.website.arn}/assets/cv-history/*"
        ]
      },
      {
        Sid    = "AllowS3ListCvHistory"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.website.arn
        ]
      },
      {
        Sid    = "AllowCloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          aws_cloudfront_distribution.website.arn
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "portfolio_admin" {
  function_name    = "${local.prefix}-portfolio-admin"
  role             = aws_iam_role.portfolio_admin.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.13"
  architectures    = ["arm64"]
  filename         = data.archive_file.portfolio_admin_zip.output_path
  source_code_hash = data.archive_file.portfolio_admin_zip.output_base64sha256
  timeout          = 20
  memory_size      = 256

  environment {
    variables = {
      TABLE_NAME      = aws_dynamodb_table.portfolio.name
      BUCKET_NAME     = aws_s3_bucket.website.id
      DISTRIBUTION_ID = aws_cloudfront_distribution.website.id
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-portfolio-admin"
  })
}

resource "aws_cloudwatch_log_group" "portfolio_admin" {
  name              = "/aws/lambda/${aws_lambda_function.portfolio_admin.function_name}"
  retention_in_days = 14

  tags = merge(local.common_tags, {
    Name = "/aws/lambda/${aws_lambda_function.portfolio_admin.function_name}"
  })
}
