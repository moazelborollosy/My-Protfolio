# ==============================================================================
# COGNITO USER POOL FOR ADMIN PORTAL AUTHENTICATION
# ==============================================================================

resource "aws_cognito_user_pool" "admin" {
  name = "${local.prefix}-admin-pool"

  # Strict security: Disable self-registration; only admins can create accounts
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-admin-pool"
  })
}

resource "aws_cognito_user_pool_client" "admin" {
  name         = "${local.prefix}-admin-spa-client"
  user_pool_id = aws_cognito_user_pool.admin.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Prevent attackers from enumerating whether an email exists in the pool
  prevent_user_existence_errors = "ENABLED"

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 7

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

# Optional initial admin user (no password stored in Terraform state; Cognito emails temp password)
resource "aws_cognito_user" "initial_admin" {
  count        = var.admin_email != "" ? 1 : 0
  user_pool_id = aws_cognito_user_pool.admin.id
  username     = var.admin_email

  attributes = {
    email          = var.admin_email
    email_verified = "true"
  }

  desired_delivery_mediums = ["EMAIL"]
}
