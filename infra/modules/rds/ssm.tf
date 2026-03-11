resource "aws_ssm_parameter" "db_url" {
  name  = "/${var.project_name}/${var.environment}/db/url"
  type  = "SecureString"
  value = "jdbc:postgresql://${aws_db_instance.main.endpoint}/${var.db_name}"

  tags = {
    Name        = "/${var.project_name}/${var.environment}/db/url"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.project_name}/${var.environment}/db/username"
  type  = "SecureString"
  value = var.db_username

  tags = {
    Name        = "/${var.project_name}/${var.environment}/db/username"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/${var.environment}/db/password"
  type  = "SecureString"
  value = random_password.db_password.result

  tags = {
    Name        = "/${var.project_name}/${var.environment}/db/password"
    Project     = var.project_name
    Environment = var.environment
  }
}
