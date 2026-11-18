# ==============================================================================
# AWS RESOURCE GROUPS (BY APPLICATION, BY ENVIRONMENT, AND BY APP + ENV)
# ==============================================================================

# 1. Application Resource Group — Groups resources by the 'Application' tag
resource "aws_resourcegroups_group" "application" {
  name        = "${var.application}-${local.env}-by-app"
  description = "Resources grouped by Application tag ${var.application}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Application"
          Values = [var.application]
        }
      ]
    })
  }

  tags = merge(local.common_tags, {
    Name = "${var.application}-${local.env}-by-app"
  })
}

# 2. Environment Resource Group — Groups resources by the 'Environment' tag
resource "aws_resourcegroups_group" "environment" {
  name        = "${local.prefix}-by-env"
  description = "Resources grouped by Environment tag ${local.env}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Environment"
          Values = [local.env]
        }
      ]
    })
  }

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-by-env"
  })
}

# 3. Composite (Application + Environment) Resource Group — Intersection of both tags
resource "aws_resourcegroups_group" "app_environment" {
  name        = "${var.application}-${local.env}-composite"
  description = "Resources grouped by both Application ${var.application} and Environment ${local.env}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Application"
          Values = [var.application]
        },
        {
          Key    = "Environment"
          Values = [local.env]
        }
      ]
    })
  }

  tags = merge(local.common_tags, {
    Name = "${var.application}-${local.env}-composite"
  })
}
