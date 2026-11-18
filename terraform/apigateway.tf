# ==============================================================================
# HTTP API GATEWAY V2 WITH NATIVE COGNITO JWT AUTHORIZER
# ==============================================================================

resource "aws_apigatewayv2_api" "http_api" {
  name          = "${local.prefix}-api"
  protocol_type = "HTTP"
  description   = "HTTP API Gateway v2 for ${var.domain_name} portfolio & admin CMS"

  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "http://localhost:5173", "*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-api"
  })
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-api-default-stage"
  })
}

# ==============================================================================
# NATIVE JWT AUTHORIZER (VALIDATES COGNITO TOKENS DIRECTLY AT API GATEWAY)
# ==============================================================================

resource "aws_apigatewayv2_authorizer" "cognito_jwt" {
  api_id           = aws_apigatewayv2_api.http_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${local.prefix}-cognito-jwt-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.admin.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.admin.id}"
  }
}

# ==============================================================================
# PUBLIC READ INTEGRATION & ROUTE (GET /api/portfolio)
# ==============================================================================

resource "aws_apigatewayv2_integration" "portfolio_read" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.portfolio_read.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "public_portfolio_get" {
  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = "GET /api/portfolio"
  authorization_type = "NONE"
  target             = "integrations/${aws_apigatewayv2_integration.portfolio_read.id}"
}

resource "aws_lambda_permission" "apigw_portfolio_read" {
  statement_id  = "AllowExecutionFromAPIGatewayPublicRead"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.portfolio_read.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*/api/portfolio"
}

# ==============================================================================
# PROTECTED ADMIN INTEGRATION & ROUTES (JWT AUTHORIZED)
# ==============================================================================

resource "aws_apigatewayv2_integration" "portfolio_admin" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.portfolio_admin.invoke_arn
  payload_format_version = "2.0"
}

locals {
  admin_routes = [
    "GET /api/admin/items",
    "POST /api/admin/items",
    "PUT /api/admin/items",
    "DELETE /api/admin/items",
    "POST /api/admin/cv",
    "POST /api/admin/publish",
  ]
}

resource "aws_apigatewayv2_route" "admin_routes" {
  for_each           = toset(local.admin_routes)
  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = each.value
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
  target             = "integrations/${aws_apigatewayv2_integration.portfolio_admin.id}"
}

resource "aws_lambda_permission" "apigw_portfolio_admin" {
  statement_id  = "AllowExecutionFromAPIGatewayAdmin"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.portfolio_admin.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*/api/admin/*"
}
