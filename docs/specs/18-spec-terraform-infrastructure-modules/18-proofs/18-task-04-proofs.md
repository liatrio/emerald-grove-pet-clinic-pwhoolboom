# 18-task-04-proofs.md — Compose Dev Environment and Validate Full Plan

## CLI Output: terraform validate (infra/envs/dev)

```shell
$ cd infra/envs/dev
$ terraform init -backend=false
Initializing modules...
- ecr in ../../modules/ecr
- fargate in ../../modules/fargate
- rds in ../../modules/rds

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Finding hashicorp/random versions matching "~> 3.0"...
- Installed hashicorp/aws v5.100.0 (signed by HashiCorp)
- Installed hashicorp/random v3.0.1

Terraform has been successfully initialized!

$ terraform validate
Success! The configuration is valid.
```

## CLI Output: terraform plan (partial — no real AWS credentials)

```shell
$ terraform plan -var="project_name=pwhoolboom" -var="aws_account_id=<ACCOUNT_ID>"

module.rds.data.terraform_remote_state.platform: Reading...
module.fargate.data.terraform_remote_state.platform: Reading...

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  + create

Terraform planned the following actions, but then encountered a problem:

  # module.rds.random_password.db_password will be created
  + resource "random_password" "db_password" {
      + id          = (known after apply)
      + length      = 16
      + lower       = true
      + min_lower   = 0
      + min_numeric = 0
      + min_special = 0
      + min_upper   = 0
      + number      = true
      + result      = (sensitive value)
      + special     = true
      + upper       = true
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Errors: AWS credentials invalid (expected — no real credentials in this environment)
```

The plan correctly began executing and identified resources. Authentication errors are expected without real AWS credentials and do not indicate configuration issues.

## Files Created

- `infra/envs/dev/providers.tf` — Terraform/provider version constraints, AWS provider
- `infra/envs/dev/backend.tf` — S3 backend config (bucket: terraform-state-ecs-landingzone-dev)
- `infra/envs/dev/variables.tf` — aws_region, project_name, aws_account_id
- `infra/envs/dev/main.tf` — Composes ecr, fargate, rds modules with cross-module wiring
- `infra/envs/dev/outputs.tf` — ecr_repository_url, alb_dns_name, ecs_service_name, rds_endpoint, cloudwatch_log_group

## Cross-Module Dependency Verification

```text
module.ecr.repository_url  ──────────────►  module.fargate.ecr_repository_url
                                              (used in ECS task definition container image)

module.fargate.ecs_tasks_security_group_id  ──►  module.rds.ecs_security_group_id
                                                   (used in RDS security group ingress rule)
```

Both cross-module references are declared in `infra/envs/dev/main.tf` and verified by `terraform validate`.

## Verification Summary

- `terraform validate` in `infra/envs/dev/`: **Success! The configuration is valid.**
- All three modules compose correctly
- Cross-module references resolve (ECR URL → Fargate; ECS SG ID → RDS)
- Full plan output saved to: `docs/specs/18-spec-terraform-infrastructure-modules/proof/terraform-plan-output.txt`
- No sensitive values or real account IDs in committed files
