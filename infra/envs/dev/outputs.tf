output "ecr_repository_url" {
  value       = module.ecr.repository_url
  description = "ECR repository URL for pushing images"
}

output "alb_dns_name" {
  value       = module.fargate.alb_dns_name
  description = "ALB DNS name — use this to access the application over HTTP"
}

output "ecs_service_name" {
  value = module.fargate.ecs_service_name
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "cloudwatch_log_group" {
  value = module.fargate.cloudwatch_log_group
}
