resource "aws_ssm_parameter" "anthropic_api_key" {
  name  = "/${var.project_name}/${var.environment}/anthropic/api-key"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Name        = "/${var.project_name}/${var.environment}/anthropic/api-key"
    Project     = var.project_name
    Environment = var.environment
  }
}
