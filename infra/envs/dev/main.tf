module "ecr" {
  source       = "../../modules/ecr"
  project_name = var.project_name
  environment  = "dev"
  aws_region   = var.aws_region
}

module "fargate" {
  source             = "../../modules/fargate"
  project_name       = var.project_name
  environment        = "dev"
  aws_region         = var.aws_region
  aws_account_id     = var.aws_account_id
  container_port     = 8080
  cpu                = 512
  memory             = 1024
  health_check_path  = "/actuator/health"
  ecr_repository_url = module.ecr.repository_url
  environment_variables = [
    {
      name  = "SPRING_PROFILES_ACTIVE"
      value = "postgres,aws"
    }
  ]
}

module "rds" {
  source                = "../../modules/rds"
  project_name          = var.project_name
  environment           = "dev"
  aws_region            = var.aws_region
  aws_account_id        = var.aws_account_id
  ecs_security_group_id = module.fargate.ecs_tasks_security_group_id
  platform_state_bucket = "terraform-state-ecs-landingzone-dev"
  platform_state_key    = "ecs-application-landingzone/terraform.tfstate"
  platform_state_region = "us-east-1"
}
