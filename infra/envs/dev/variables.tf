variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Team/project name used in resource naming"
}

variable "aws_account_id" {
  type        = number
  description = "AWS account ID"
}
