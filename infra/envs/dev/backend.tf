terraform {
  backend "s3" {
    bucket         = "terraform-state-ecs-landingzone-dev"
    key            = "apps/pet-clinic-pwhoolboom/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
